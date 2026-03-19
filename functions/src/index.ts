import * as admin from "firebase-admin";
import {
  onRequest,
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();
const db = admin.firestore();

// ---- Secrets ----
const lineLoginChannelId = defineSecret("LINE_LOGIN_CHANNEL_ID");
const lineLoginChannelSecret = defineSecret("LINE_LOGIN_CHANNEL_SECRET");
const lineMessagingToken = defineSecret("LINE_MESSAGING_CHANNEL_ACCESS_TOKEN");

// ============================================================
// 1. LINE Login OAuth Callback
// ============================================================
export const lineLoginCallback = onRequest(
  { secrets: [lineLoginChannelId, lineLoginChannelSecret], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { code, redirectUri } = req.body as {
      code?: string;
      redirectUri?: string;
    };

    if (!code || !redirectUri) {
      res.status(400).json({ error: "code and redirectUri are required" });
      return;
    }

    try {
      // Exchange authorization code for tokens
      const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: lineLoginChannelId.value(),
          client_secret: lineLoginChannelSecret.value(),
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        res.status(401).json({ error: "LINE token exchange failed", detail: err });
        return;
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token as string;

      // Get LINE user profile
      const profileRes = await fetch("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!profileRes.ok) {
        res.status(401).json({ error: "Failed to fetch LINE profile" });
        return;
      }

      const profile = await profileRes.json();
      const lineUserId = profile.userId as string;
      const lineDisplayName = profile.displayName as string;

      // Look up existing user linked to this LINE account
      const usersSnap = await db
        .collection("users")
        .where("lineUserId", "==", lineUserId)
        .limit(1)
        .get();

      if (!usersSnap.empty) {
        // User found — create custom token
        const userDoc = usersSnap.docs[0];
        const customToken = await admin.auth().createCustomToken(userDoc.id);
        res.json({
          status: "linked",
          customToken,
          lineUserId,
          lineDisplayName,
        });
      } else {
        // No linked user — return LINE profile so frontend can prompt linking
        res.json({
          status: "not_linked",
          lineUserId,
          lineDisplayName,
        });
      }
    } catch (error) {
      console.error("lineLoginCallback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ============================================================
// 1b. LIFF Auth — Exchange LIFF access token for Firebase Custom Token
// ============================================================
export const liffAuth = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { liffAccessToken } = req.body as { liffAccessToken?: string };

    if (!liffAccessToken) {
      res.status(400).json({ error: "liffAccessToken is required" });
      return;
    }

    try {
      // Verify LIFF access token by fetching LINE profile
      const profileRes = await fetch("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${liffAccessToken}` },
      });

      if (!profileRes.ok) {
        res.status(401).json({ error: "Invalid LIFF access token" });
        return;
      }

      const profile = await profileRes.json();
      const lineUserId = profile.userId as string;
      const lineDisplayName = profile.displayName as string;

      // Look up existing user linked to this LINE account
      const usersSnap = await db
        .collection("users")
        .where("lineUserId", "==", lineUserId)
        .limit(1)
        .get();

      if (!usersSnap.empty) {
        const userDoc = usersSnap.docs[0];
        const customToken = await admin.auth().createCustomToken(userDoc.id);
        res.json({
          status: "linked",
          customToken,
          lineUserId,
          lineDisplayName,
        });
      } else {
        res.json({
          status: "not_linked",
          lineUserId,
          lineDisplayName,
        });
      }
    } catch (error) {
      console.error("liffAuth error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ============================================================
// 2. Link LINE Account to authenticated user
// ============================================================
export const linkLineAccount = onCall(
  { secrets: [] },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "認証が必要です");
    }

    const { lineUserId, lineDisplayName } = request.data as {
      lineUserId?: string;
      lineDisplayName?: string;
    };

    if (!lineUserId) {
      throw new HttpsError("invalid-argument", "lineUserId is required");
    }

    // Check if this LINE account is already linked to another user
    const existing = await db
      .collection("users")
      .where("lineUserId", "==", lineUserId)
      .limit(1)
      .get();

    if (!existing.empty && existing.docs[0].id !== uid) {
      throw new HttpsError(
        "already-exists",
        "このLINEアカウントは別のユーザーに連携済みです"
      );
    }

    await db.collection("users").doc(uid).update({
      lineUserId,
      lineDisplayName: lineDisplayName || null,
      lineNotificationEnabled: true,
      lineLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

// ============================================================
// 3. Unlink LINE Account
// ============================================================
export const unlinkLineAccount = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "認証が必要です");
  }

  await db.collection("users").doc(uid).update({
    lineUserId: admin.firestore.FieldValue.delete(),
    lineDisplayName: admin.firestore.FieldValue.delete(),
    lineNotificationEnabled: admin.firestore.FieldValue.delete(),
    lineLinkedAt: admin.firestore.FieldValue.delete(),
  });

  return { success: true };
});

// ============================================================
// 4. Send LINE notification on individual message (admin → member)
// ============================================================
export const sendLineNotification = onDocumentCreated(
  { document: "messages/{messageId}", secrets: [lineMessagingToken] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    // Only notify for admin-sent messages
    if (data.senderRole !== "admin") return;
    if (!data.recipientUid) return;
    // Skip scheduled messages (they'll trigger when actually sent)
    if (data.isScheduled) return;

    const recipientDoc = await db
      .collection("users")
      .doc(data.recipientUid)
      .get();
    const recipient = recipientDoc.data();

    if (!recipient?.lineUserId) return;
    if (recipient.lineNotificationEnabled === false) return;

    const textPreview =
      data.text?.length > 200
        ? data.text.substring(0, 200) + "…"
        : data.text || "";

    const message = {
      to: recipient.lineUserId,
      messages: [
        {
          type: "text",
          text: `【STARTUS】${data.senderName}さんからメッセージが届きました\n\n${textPreview}`,
        },
      ],
    };

    try {
      const res = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lineMessagingToken.value()}`,
        },
        body: JSON.stringify(message),
      });

      if (!res.ok) {
        console.error(
          "LINE push failed:",
          res.status,
          await res.text()
        );
      }
    } catch (error) {
      console.error("LINE push error:", error);
    }
  }
);

// ============================================================
// 5. Send LINE notification on broadcast
// ============================================================
export const sendLineBroadcastNotification = onDocumentUpdated(
  { document: "broadcasts/{broadcastId}", secrets: [lineMessagingToken] },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // Only trigger when status transitions to 'sent'
    if (before.status === "sent" || after.status !== "sent") return;

    // Resolve target members
    let memberQuery: admin.firestore.Query = db.collection("users").where("role", "==", "member");

    if (after.targetType === "class" && after.targetClassIds?.length > 0) {
      memberQuery = memberQuery.where(
        "classIds",
        "array-contains-any",
        after.targetClassIds
      );
    } else if (
      after.targetType === "individual" &&
      after.targetUserIds?.length > 0
    ) {
      // For individual targeting, fetch specific users
      const userIds: string[] = after.targetUserIds;
      const lineUserIds: string[] = [];

      for (const userId of userIds) {
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        if (
          userData?.lineUserId &&
          userData.lineNotificationEnabled !== false
        ) {
          lineUserIds.push(userData.lineUserId);
        }
      }

      if (lineUserIds.length > 0) {
        await sendLineMulticast(
          lineUserIds,
          after.title,
          after.body,
          after.isImportant
        );
      }
      return;
    }

    // For 'all' or 'class' targeting
    const membersSnap = await memberQuery.get();
    const lineUserIds: string[] = [];

    for (const doc of membersSnap.docs) {
      const data = doc.data();
      if (data.lineUserId && data.lineNotificationEnabled !== false) {
        lineUserIds.push(data.lineUserId);
      }
    }

    if (lineUserIds.length > 0) {
      await sendLineMulticast(
        lineUserIds,
        after.title,
        after.body,
        after.isImportant
      );
    }
  }
);

async function sendLineMulticast(
  lineUserIds: string[],
  title: string,
  body: string,
  isImportant: boolean
): Promise<void> {
  const prefix = isImportant ? "【重要】" : "";
  const bodyPreview =
    body.length > 200 ? body.substring(0, 200) + "…" : body;

  // LINE multicast supports up to 500 recipients per call
  const chunks: string[][] = [];
  for (let i = 0; i < lineUserIds.length; i += 500) {
    chunks.push(lineUserIds.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    const payload = {
      to: chunk,
      messages: [
        {
          type: "text",
          text: `【STARTUS】${prefix}お知らせ\n\n${title}\n\n${bodyPreview}`,
        },
      ],
    };

    try {
      const res = await fetch(
        "https://api.line.me/v2/bot/message/multicast",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lineMessagingToken.value()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        console.error(
          "LINE multicast failed:",
          res.status,
          await res.text()
        );
      }
    } catch (error) {
      console.error("LINE multicast error:", error);
    }
  }
}
