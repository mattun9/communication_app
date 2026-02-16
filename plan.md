# 修正計画: サイドバーバッジとInboxメンバーリストバッジの不一致

## 問題の詳細

### 現状
- **AdminLayout サイドバー**（左）の「チャット」バッジ: `DUMMY_MESSAGES`（静的インポート）を直接参照 → **常に 2** を表示
- **Inbox メンバーリスト**（右）の各メンバーバッジ: ローカル `messages` state を参照 → メンバー選択時に既読処理が走り **合計 1** を表示

### 原因
1. `AdminLayout.tsx:27` の `getBadgeCount` は `DUMMY_MESSAGES`（モジュールレベルのインポート）から未読数を算出
2. `Inbox.tsx:54` は `useState(DUMMY_MESSAGES)` でローカルstateを初期化
3. `Inbox.tsx:72-82` の `useEffect` がメンバー選択時にローカルstateの未読を既読に更新
4. **しかし、AdminLayout のバッジは静的データを参照し続けるため、Inbox での既読処理が反映されない**

## 修正方針: React Context で メッセージstate を共有

### なぜ Context か
- AdminLayout（親コンポーネント）と Inbox（`<Outlet />` の子コンポーネント）で同じデータを共有する必要がある
- propsのバケツリレー不要、既存のコンポーネント構造を大きく変えずに済む
- 将来的にメンバー画面側（MemberLayout）とも共有可能

## 実装ステップ

### Step 1: MessageContext を作成
**新規ファイル: `src/contexts/MessageContext.tsx`**

- `messages` state（`DUMMY_MESSAGES` で初期化）
- `markMemberMessagesAsRead(memberUid: string)` — 指定メンバーからの未読メッセージを既読にする
- `addMessage(msg: Message)` — 新しいメッセージを追加する
- `unsendMessage(msgId: string)` — メッセージを取り消す
- `updateMessage(msgId: string, updates)` — メッセージを更新する
- `getUnreadCountFromMembers()` — 全メンバーからの未読合計を返す（サイドバー用）

### Step 2: AdminLayout に MessageProvider を統合
**変更ファイル: `src/components/AdminLayout.tsx`**

- `MessageProvider` で `<Outlet />` をラップ（AdminLayout自身もcontext内に入るよう配置）
- `getBadgeCount('chat')` を context の `getUnreadCountFromMembers()` に置き換え
- `DUMMY_MESSAGES` の直接参照を削除

### Step 3: Inbox を context に移行
**変更ファイル: `src/pages/admin/Inbox.tsx`**

- `const [messages, setMessages] = useState(DUMMY_MESSAGES)` を削除
- context から `messages`, `markMemberMessagesAsRead`, `addMessage`, `unsendMessage`, `updateMessage` を取得
- メンバー選択時の `useEffect` を `markMemberMessagesAsRead(selectedMember.uid)` に置き換え
- `handleSend`, `handleUnsend`, `handleSaveEdit`, `handleDeleteScheduled` を context の関数で置き換え

## 結果
- サイドバーの「チャット」バッジ = メンバーリスト内の全バッジの合計（常に一致）
- メンバーを選択して既読になれば、サイドバーのバッジも即座に減少
- 新しいメッセージ送信・取り消しもサイドバーバッジに即反映
