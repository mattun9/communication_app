/**
 * Firestore seed script — populates all collections with dummy data.
 *
 * Usage:
 *   node scripts/seed-firestore.mjs <apiKey> <projectId>
 *
 * Example:
 *   node scripts/seed-firestore.mjs AIzaSyXXX my-project-id
 *
 * Requires: test-mode Firestore rules (open for 30 days after creation).
 */

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore'

// ---- parse args ----
const [apiKey, projectId] = process.argv.slice(2)
if (!apiKey || !projectId) {
  console.error('Usage: node scripts/seed-firestore.mjs <apiKey> <projectId>')
  process.exit(1)
}

const app = initializeApp({
  apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.firebasestorage.app`,
})
const db = getFirestore(app)

function ts(dateStr) {
  return Timestamp.fromDate(new Date(dateStr))
}

// ===================== DATA =====================

const classrooms = [
  { id: 'class-a', name: 'Aクラス', sportCategory: 'サッカー', createdAt: ts('2025-01-01') },
  { id: 'class-b', name: 'Bクラス', sportCategory: 'サッカー', createdAt: ts('2025-01-01') },
  { id: 'class-c', name: 'Cクラス', sportCategory: 'バスケットボール', createdAt: ts('2025-03-01') },
  { id: 'class-d', name: 'Dクラス', sportCategory: 'テニス', createdAt: ts('2025-06-01') },
  { id: 'class-e', name: 'Eクラス', sportCategory: 'バレーボール', createdAt: ts('2025-09-01') },
]

const members = [
  { uid: 'member-001', name: '山田 太郎', nameKana: 'ヤマダ タロウ', role: 'member', classId: 'class-a', classIds: ['class-a'], parentId: 'parent-yamada', phone: '090-1234-5678', memberNumber: 'M001', email: 'yamada.taro@example.com', guardians: [{ id: 'g-001', name: '山田 一郎', email: 'yamada.ichiro@example.com', relation: '父' }, { id: 'g-002', name: '山田 美香', email: 'yamada.mika@example.com', relation: '母' }], createdAt: ts('2025-04-01') },
  { uid: 'member-002', name: '鈴木 花子', nameKana: 'スズキ ハナコ', role: 'member', classId: 'class-a', classIds: ['class-a'], phone: '090-2345-6789', memberNumber: 'M002', email: 'suzuki.hanako@example.com', createdAt: ts('2025-04-01') },
  { uid: 'member-003', name: '佐々木 一郎', nameKana: 'ササキ イチロウ', role: 'member', classId: 'class-b', classIds: ['class-b'], phone: '090-3456-7890', memberNumber: 'M003', email: 'sasaki.ichiro@example.com', createdAt: ts('2025-05-01') },
  { uid: 'member-004', name: '高橋 美咲', nameKana: 'タカハシ ミサキ', role: 'member', classId: 'class-b', classIds: ['class-b'], phone: '090-4567-8901', memberNumber: 'M004', email: 'takahashi.misaki@example.com', createdAt: ts('2025-06-01') },
  { uid: 'member-005', name: '伊藤 健太', nameKana: 'イトウ ケンタ', role: 'member', classId: 'class-a', classIds: ['class-a'], phone: '090-5678-9012', memberNumber: 'M005', email: 'ito.kenta@example.com', createdAt: ts('2025-07-01') },
  { uid: 'member-006', name: '渡辺 さくら', nameKana: 'ワタナベ サクラ', role: 'member', classId: 'class-c', classIds: ['class-c'], phone: '090-6789-0123', memberNumber: 'M006', email: 'watanabe.sakura@example.com', createdAt: ts('2025-04-15') },
  { uid: 'member-007', name: '中村 大輔', nameKana: 'ナカムラ ダイスケ', role: 'member', classId: 'class-c', classIds: ['class-c'], phone: '090-7890-1234', memberNumber: 'M007', email: 'nakamura.daisuke@example.com', createdAt: ts('2025-05-15') },
  { uid: 'member-008', name: '小林 悠斗', nameKana: 'コバヤシ ユウト', role: 'member', classId: 'class-a', classIds: ['class-a'], phone: '090-8901-2345', memberNumber: 'M008', email: 'kobayashi.yuto@example.com', createdAt: ts('2025-04-10') },
  { uid: 'member-009', name: '加藤 陽菜', nameKana: 'カトウ ヒナ', role: 'member', classId: 'class-a', classIds: ['class-a'], phone: '090-9012-3456', memberNumber: 'M009', email: 'kato.hina@example.com', createdAt: ts('2025-04-15') },
  { uid: 'member-010', name: '吉田 蓮', nameKana: 'ヨシダ レン', role: 'member', classId: 'class-a', classIds: ['class-a', 'class-b'], phone: '090-0123-4567', memberNumber: 'M010', email: 'yoshida.ren@example.com', createdAt: ts('2025-05-01') },
  { uid: 'member-011', name: '松本 結衣', nameKana: 'マツモト ユイ', role: 'member', classId: 'class-a', classIds: ['class-a'], phone: '090-1111-2222', memberNumber: 'M011', email: 'matsumoto.yui@example.com', createdAt: ts('2025-05-10') },
  { uid: 'member-012', name: '井上 翔太', nameKana: 'イノウエ ショウタ', role: 'member', classId: 'class-a', classIds: ['class-a'], phone: '090-2222-3333', memberNumber: 'M012', email: 'inoue.shota@example.com', createdAt: ts('2025-06-01') },
  { uid: 'member-013', name: '木村 凛', nameKana: 'キムラ リン', role: 'member', classId: 'class-a', classIds: ['class-a', 'class-c'], phone: '090-3333-4444', memberNumber: 'M013', email: 'kimura.rin@example.com', createdAt: ts('2025-06-15') },
  { uid: 'member-014', name: '林 颯太', nameKana: 'ハヤシ ソウタ', role: 'member', classId: 'class-a', classIds: ['class-a'], phone: '090-4444-5555', memberNumber: 'M014', email: 'hayashi.sota@example.com', createdAt: ts('2025-07-01') },
  { uid: 'member-015', name: '清水 葵', nameKana: 'シミズ アオイ', role: 'member', classId: 'class-b', classIds: ['class-b'], phone: '090-5555-6666', memberNumber: 'M015', email: 'shimizu.aoi@example.com', createdAt: ts('2025-04-01') },
  { uid: 'member-016', name: '山口 大翔', nameKana: 'ヤマグチ ヒロト', role: 'member', classId: 'class-b', classIds: ['class-b'], phone: '090-6666-7777', memberNumber: 'M016', email: 'yamaguchi.hiroto@example.com', createdAt: ts('2025-04-15') },
  { uid: 'member-017', name: '森 真央', nameKana: 'モリ マオ', role: 'member', classId: 'class-b', classIds: ['class-b', 'class-d'], phone: '090-7777-8888', memberNumber: 'M017', email: 'mori.mao@example.com', createdAt: ts('2025-05-01') },
  { uid: 'member-018', name: '池田 陸', nameKana: 'イケダ リク', role: 'member', classId: 'class-b', classIds: ['class-b'], phone: '090-8888-9999', memberNumber: 'M018', email: 'ikeda.riku@example.com', createdAt: ts('2025-05-15') },
  { uid: 'member-019', name: '橋本 彩乃', nameKana: 'ハシモト アヤノ', role: 'member', classId: 'class-b', classIds: ['class-b'], phone: '090-9999-0000', memberNumber: 'M019', email: 'hashimoto.ayano@example.com', createdAt: ts('2025-06-01') },
  { uid: 'member-020', name: '阿部 奏太', nameKana: 'アベ ソウタ', role: 'member', classId: 'class-b', classIds: ['class-b'], phone: '090-1010-2020', memberNumber: 'M020', email: 'abe.sota@example.com', createdAt: ts('2025-06-15') },
  { uid: 'member-021', name: '石川 愛莉', nameKana: 'イシカワ アイリ', role: 'member', classId: 'class-b', classIds: ['class-b', 'class-a'], phone: '090-2020-3030', memberNumber: 'M021', email: 'ishikawa.airi@example.com', createdAt: ts('2025-07-01') },
  { uid: 'member-022', name: '前田 湊', nameKana: 'マエダ ミナト', role: 'member', classId: 'class-b', classIds: ['class-b'], phone: '090-3030-4040', memberNumber: 'M022', email: 'maeda.minato@example.com', createdAt: ts('2025-07-15') },
  { uid: 'member-023', name: '藤田 心優', nameKana: 'フジタ ミユ', role: 'member', classId: 'class-c', classIds: ['class-c'], phone: '090-4040-5050', memberNumber: 'M023', email: 'fujita.miyu@example.com', createdAt: ts('2025-04-01') },
  { uid: 'member-024', name: '後藤 蒼空', nameKana: 'ゴトウ ソラ', role: 'member', classId: 'class-c', classIds: ['class-c'], phone: '090-5050-6060', memberNumber: 'M024', email: 'goto.sora@example.com', createdAt: ts('2025-04-15') },
  { uid: 'member-025', name: '岡田 莉子', nameKana: 'オカダ リコ', role: 'member', classId: 'class-c', classIds: ['class-c', 'class-e'], phone: '090-6060-7070', memberNumber: 'M025', email: 'okada.riko@example.com', createdAt: ts('2025-05-01') },
  { uid: 'member-026', name: '村上 颯真', nameKana: 'ムラカミ ソウマ', role: 'member', classId: 'class-c', classIds: ['class-c'], phone: '090-7070-8080', memberNumber: 'M026', email: 'murakami.soma@example.com', createdAt: ts('2025-05-15') },
  { uid: 'member-027', name: '近藤 咲良', nameKana: 'コンドウ サクラ', role: 'member', classId: 'class-c', classIds: ['class-c'], phone: '090-8080-9090', memberNumber: 'M027', email: 'kondo.sakura@example.com', createdAt: ts('2025-06-01') },
  { uid: 'member-028', name: '坂本 悠真', nameKana: 'サカモト ユウマ', role: 'member', classId: 'class-c', classIds: ['class-c'], phone: '090-9090-0101', memberNumber: 'M028', email: 'sakamoto.yuma@example.com', createdAt: ts('2025-06-15') },
  { uid: 'member-029', name: '遠藤 ひまり', nameKana: 'エンドウ ヒマリ', role: 'member', classId: 'class-c', classIds: ['class-c', 'class-d'], phone: '090-0101-1212', memberNumber: 'M029', email: 'endo.himari@example.com', createdAt: ts('2025-07-01') },
  { uid: 'member-030', name: '青木 朝陽', nameKana: 'アオキ アサヒ', role: 'member', classId: 'class-c', classIds: ['class-c'], phone: '090-1212-2323', memberNumber: 'M030', email: 'aoki.asahi@example.com', createdAt: ts('2025-07-15') },
  { uid: 'member-031', name: '藤井 楓', nameKana: 'フジイ カエデ', role: 'member', classId: 'class-d', classIds: ['class-d'], phone: '090-2323-3434', memberNumber: 'M031', email: 'fujii.kaede@example.com', createdAt: ts('2025-06-01') },
  { uid: 'member-032', name: '西村 律', nameKana: 'ニシムラ リツ', role: 'member', classId: 'class-d', classIds: ['class-d'], phone: '090-3434-4545', memberNumber: 'M032', email: 'nishimura.ritsu@example.com', createdAt: ts('2025-06-15') },
  { uid: 'member-033', name: '福田 芽依', nameKana: 'フクダ メイ', role: 'member', classId: 'class-d', classIds: ['class-d', 'class-e'], phone: '090-4545-5656', memberNumber: 'M033', email: 'fukuda.mei@example.com', createdAt: ts('2025-07-01') },
  { uid: 'member-034', name: '太田 暖', nameKana: 'オオタ ダン', role: 'member', classId: 'class-d', classIds: ['class-d'], phone: '090-5656-6767', memberNumber: 'M034', email: 'ota.dan@example.com', createdAt: ts('2025-07-15') },
  { uid: 'member-035', name: '三浦 杏', nameKana: 'ミウラ アン', role: 'member', classId: 'class-d', classIds: ['class-d'], phone: '090-6767-7878', memberNumber: 'M035', email: 'miura.an@example.com', createdAt: ts('2025-08-01') },
  { uid: 'member-036', name: '岡本 海斗', nameKana: 'オカモト カイト', role: 'member', classId: 'class-d', classIds: ['class-d'], phone: '090-7878-8989', memberNumber: 'M036', email: 'okamoto.kaito@example.com', createdAt: ts('2025-08-15') },
  { uid: 'member-037', name: '松田 紬', nameKana: 'マツダ ツムギ', role: 'member', classId: 'class-d', classIds: ['class-d', 'class-b'], phone: '090-8989-9090', memberNumber: 'M037', email: 'matsuda.tsumugi@example.com', createdAt: ts('2025-09-01') },
  { uid: 'member-038', name: '中島 瑛太', nameKana: 'ナカジマ エイタ', role: 'member', classId: 'class-d', classIds: ['class-d'], phone: '090-9191-0202', memberNumber: 'M038', email: 'nakajima.eita@example.com', createdAt: ts('2025-09-15') },
  { uid: 'member-039', name: '原田 柚葉', nameKana: 'ハラダ ユズハ', role: 'member', classId: 'class-d', classIds: ['class-d'], phone: '090-0202-1313', memberNumber: 'M039', email: 'harada.yuzuha@example.com', createdAt: ts('2025-10-01') },
  { uid: 'member-040', name: '小川 陽翔', nameKana: 'オガワ ハルト', role: 'member', classId: 'class-e', classIds: ['class-e'], phone: '090-1313-2424', memberNumber: 'M040', email: 'ogawa.haruto@example.com', createdAt: ts('2025-09-01') },
  { uid: 'member-041', name: '長谷川 琴音', nameKana: 'ハセガワ コトネ', role: 'member', classId: 'class-e', classIds: ['class-e'], phone: '090-2424-3535', memberNumber: 'M041', email: 'hasegawa.kotone@example.com', createdAt: ts('2025-09-15') },
  { uid: 'member-042', name: '村田 蒼士', nameKana: 'ムラタ アオシ', role: 'member', classId: 'class-e', classIds: ['class-e', 'class-a'], phone: '090-3535-4646', memberNumber: 'M042', email: 'murata.aoshi@example.com', createdAt: ts('2025-10-01') },
  { uid: 'member-043', name: '野口 詩織', nameKana: 'ノグチ シオリ', role: 'member', classId: 'class-e', classIds: ['class-e'], phone: '090-4646-5757', memberNumber: 'M043', email: 'noguchi.shiori@example.com', createdAt: ts('2025-10-15') },
  { uid: 'member-044', name: '竹内 壮真', nameKana: 'タケウチ ソウマ', role: 'member', classId: 'class-e', classIds: ['class-e'], phone: '090-5757-6868', memberNumber: 'M044', email: 'takeuchi.soma@example.com', createdAt: ts('2025-11-01') },
  { uid: 'member-045', name: '金子 七海', nameKana: 'カネコ ナナミ', role: 'member', classId: 'class-e', classIds: ['class-e', 'class-c'], phone: '090-6868-7979', memberNumber: 'M045', email: 'kaneko.nanami@example.com', createdAt: ts('2025-11-15') },
  { uid: 'member-046', name: '和田 大和', nameKana: 'ワダ ヤマト', role: 'member', classId: 'class-e', classIds: ['class-e'], phone: '090-7979-8080', memberNumber: 'M046', email: 'wada.yamato@example.com', createdAt: ts('2025-12-01') },
  { uid: 'member-047', name: '上田 真白', nameKana: 'ウエダ マシロ', role: 'member', classId: 'class-e', classIds: ['class-e'], phone: '090-8181-9292', memberNumber: 'M047', email: 'ueda.mashiro@example.com', createdAt: ts('2025-12-15') },
  { uid: 'member-048', name: '杉山 奏', nameKana: 'スギヤマ カナデ', role: 'member', classId: 'class-e', classIds: ['class-e'], phone: '090-9292-0303', memberNumber: 'M048', email: 'sugiyama.kanade@example.com', createdAt: ts('2025-12-20') },
  { uid: 'member-049', name: '平野 晴', nameKana: 'ヒラノ ハル', role: 'member', classId: 'class-a', classIds: ['class-a', 'class-d'], phone: '090-0303-1414', memberNumber: 'M049', email: 'hirano.haru@example.com', createdAt: ts('2025-08-01') },
  { uid: 'member-050', name: '田村 凜', nameKana: 'タムラ リン', role: 'member', classId: 'class-b', classIds: ['class-b', 'class-e'], phone: '090-1414-2525', memberNumber: 'M050', email: 'tamura.rin@example.com', createdAt: ts('2025-08-15') },
  { uid: 'member-051', name: '山田 花', nameKana: 'ヤマダ ハナ', role: 'member', classId: 'class-b', classIds: ['class-b'], parentId: 'parent-yamada', phone: '090-1234-5678', memberNumber: 'M051', email: 'yamada.hana@example.com', guardians: [{ id: 'g-001', name: '山田 一郎', email: 'yamada.ichiro@example.com', relation: '父' }, { id: 'g-002', name: '山田 美香', email: 'yamada.mika@example.com', relation: '母' }], createdAt: ts('2025-09-01') },
]

const adminUser = {
  uid: 'admin-001',
  name: '田中コーチ',
  nameKana: 'タナカ コーチ',
  role: 'admin',
  classId: '',
  classIds: [],
  email: 'tanaka@example.com',
  createdAt: ts('2025-01-01'),
}

const broadcasts = [
  { id: 'bc-1', title: '【重要】来週の練習スケジュール変更', body: '来週の水曜日（2/11）は祝日のため、練習はお休みとなります。\n\n振替練習は2/14（土）10:00〜12:00に実施します。\n場所は第1グラウンドです。\n\nお忘れ物のないようご準備ください。', targetType: 'all', targetClassIds: [], isImportant: true, status: 'sent', sentAt: ts('2026-02-07T09:00:00'), createdBy: 'admin-001', createdAt: ts('2026-02-06T20:00:00') },
  { id: 'bc-2', title: '3月の大会エントリー受付開始', body: '3月15日開催の春季大会のエントリーを受け付けます。\n\n■ 大会名: 第12回 春季ジュニアカップ\n■ 場所: 県営総合運動公園\n■ 日時: 3月15日(日) 8:00集合\n■ 対象: A・Bクラス\n\n参加希望の方は2月末までに申請フォームからお申し込みください。', imageUrl: 'https://placehold.co/600x300/2563eb/white?text=春季大会', targetType: 'class', targetClassIds: ['class-a', 'class-b'], isImportant: false, status: 'sent', sentAt: ts('2026-02-05T12:00:00'), createdBy: 'admin-001', createdAt: ts('2026-02-05T10:00:00') },
  { id: 'bc-3', title: '新ユニフォームのデザイン投票', body: '来シーズンのユニフォームデザインを3案の中から投票で決定します。\n\nA案: 青ベースにオレンジライン\nB案: 白ベースに青ライン\nC案: オレンジベースに白ライン\n\n投票はマイページのアンケートフォームからお願いします。\n締め切り: 2月28日', imageUrl: 'https://placehold.co/600x300/f97316/white?text=ユニフォーム投票', targetType: 'all', targetClassIds: [], isImportant: false, status: 'sent', sentAt: ts('2026-02-03T14:00:00'), createdBy: 'admin-002', createdAt: ts('2026-02-03T10:00:00') },
  { id: 'bc-4', title: 'Cクラス保護者会のお知らせ', body: '下記の通りCクラス保護者会を開催します。\n\n■ 日時: 2月20日(木) 19:00〜20:00\n■ 場所: クラブハウス2F会議室\n■ 議題: 春合宿について、年間スケジュール\n\nご出席の可否を2/15までにご連絡ください。', targetType: 'class', targetClassIds: ['class-c'], isImportant: false, status: 'sent', sentAt: ts('2026-02-08T10:00:00'), createdBy: 'admin-001', createdAt: ts('2026-02-08T09:00:00') },
  { id: 'bc-5', title: '週末練習のお知らせ', body: '今週末の練習について連絡します。\n\n■ 日時: 2月15日(土) 9:00〜11:00\n■ 場所: 第2グラウンド\n■ 持ち物: 通常練習セット\n\n天候により中止の場合は当日朝7時までに連絡します。', targetType: 'all', targetClassIds: [], isImportant: false, status: 'scheduled', scheduledAt: ts('2026-02-13T08:00:00'), createdBy: 'admin-001', createdAt: ts('2026-02-10T15:00:00') },
]

const readStatuses = [
  { id: 'bc-1_member-001', broadcastId: 'bc-1', userId: 'member-001', userName: '山田 太郎', openedAt: ts('2026-02-07T09:05:00') },
  { id: 'bc-1_member-002', broadcastId: 'bc-1', userId: 'member-002', userName: '鈴木 花子', openedAt: ts('2026-02-07T09:10:00') },
  { id: 'bc-1_member-003', broadcastId: 'bc-1', userId: 'member-003', userName: '佐々木 一郎', openedAt: ts('2026-02-07T10:00:00') },
  { id: 'bc-1_member-005', broadcastId: 'bc-1', userId: 'member-005', userName: '伊藤 健太', openedAt: ts('2026-02-07T12:00:00') },
  { id: 'bc-1_member-006', broadcastId: 'bc-1', userId: 'member-006', userName: '渡辺 さくら', openedAt: ts('2026-02-07T14:00:00') },
  { id: 'bc-2_member-001', broadcastId: 'bc-2', userId: 'member-001', userName: '山田 太郎', openedAt: ts('2026-02-05T12:30:00') },
  { id: 'bc-2_member-002', broadcastId: 'bc-2', userId: 'member-002', userName: '鈴木 花子', openedAt: ts('2026-02-05T13:00:00') },
  { id: 'bc-2_member-005', broadcastId: 'bc-2', userId: 'member-005', userName: '伊藤 健太', openedAt: ts('2026-02-05T15:00:00') },
  { id: 'bc-3_member-001', broadcastId: 'bc-3', userId: 'member-001', userName: '山田 太郎', openedAt: ts('2026-02-03T14:30:00') },
  { id: 'bc-3_member-004', broadcastId: 'bc-3', userId: 'member-004', userName: '高橋 美咲', openedAt: ts('2026-02-03T16:00:00') },
  { id: 'bc-3_member-006', broadcastId: 'bc-3', userId: 'member-006', userName: '渡辺 さくら', openedAt: ts('2026-02-03T17:00:00') },
  { id: 'bc-3_member-007', broadcastId: 'bc-3', userId: 'member-007', userName: '中村 大輔', openedAt: ts('2026-02-04T08:00:00') },
  { id: 'bc-4_member-006', broadcastId: 'bc-4', userId: 'member-006', userName: '渡辺 さくら', openedAt: ts('2026-02-08T10:30:00') },
]

const messages = [
  { id: 'msg-1', text: '花子の膝の具合はいかがですか？無理せずお休みしても大丈夫ですよ。', type: 'text', senderUid: 'admin-001', senderName: '田中コーチ', senderRole: 'admin', recipientUid: 'member-001', createdAt: ts('2026-02-06T10:00:00'), isReadByRecipient: true, readAt: ts('2026-02-06T10:10:00') },
  { id: 'msg-2', text: 'ありがとうございます。だいぶ良くなってきたので、来週から復帰できそうです！', type: 'text', senderUid: 'member-001', senderName: '山田 太郎', senderRole: 'member', recipientUid: 'admin-001', createdAt: ts('2026-02-06T10:15:00') },
  { id: 'msg-3', text: 'よかったです！復帰初日は軽めのメニューにしますね。', type: 'text', senderUid: 'admin-001', senderName: '田中コーチ', senderRole: 'admin', recipientUid: 'member-001', createdAt: ts('2026-02-06T10:20:00'), isReadByRecipient: true, readAt: ts('2026-02-06T10:25:00') },
  { id: 'msg-4', text: 'お世話になっております。先日の練習試合のお写真はいただけますでしょうか？', type: 'text', senderUid: 'member-002', senderName: '鈴木 花子', senderRole: 'member', recipientUid: 'admin-001', createdAt: ts('2026-02-07T15:00:00') },
]

const absences = [
  { id: 'abs-1', userId: 'member-001', userName: '山田 太郎', classId: 'class-a', date: ts('2026-02-10'), reason: '怪我', note: '膝の痛みがあるため', createdAt: ts('2026-02-08T18:00:00') },
  { id: 'abs-2', userId: 'member-003', userName: '佐々木 一郎', classId: 'class-b', date: ts('2026-02-10'), reason: '体調不良', createdAt: ts('2026-02-09T20:00:00') },
  { id: 'abs-3', userId: 'member-006', userName: '渡辺 さくら', classId: 'class-c', date: ts('2026-02-12'), reason: '学校行事', note: '授業参観のため', createdAt: ts('2026-02-10T08:00:00') },
]

const events = [
  { id: 'ev-1', title: '通常練習', date: ts('2026-02-10T17:00:00'), description: '第1グラウンド 17:00〜19:00', classId: 'all', type: 'practice' },
  { id: 'ev-2', title: '祝日 - 練習休み', date: ts('2026-02-11T00:00:00'), classId: 'all', type: 'holiday' },
  { id: 'ev-3', title: '振替練習', date: ts('2026-02-14T10:00:00'), description: '体育館 10:00〜12:00', classId: 'all', type: 'practice' },
  { id: 'ev-4', title: '練習試合 vs チームB', date: ts('2026-02-22T09:00:00'), description: '市営グラウンド 9:00〜15:00\n集合: 8:30\n持ち物: ユニフォーム、弁当、水筒', classId: 'class-a', type: 'game' },
  { id: 'ev-5', title: '3月大会', date: ts('2026-03-15T08:00:00'), description: '県営総合運動公園\n8:00集合', classId: 'all', type: 'game' },
]

const templates = [
  { id: 'tpl-1', text: 'ご連絡ありがとうございます。確認いたしました。', order: 1, createdAt: ts('2025-01-01') },
  { id: 'tpl-2', text: '承知いたしました。ありがとうございます。', order: 2, createdAt: ts('2025-01-01') },
  { id: 'tpl-3', text: '本日の練習は通常通り行います。', order: 3, createdAt: ts('2025-01-01') },
  { id: 'tpl-4', text: '天候不良のため本日の練習は中止とします。', order: 4, createdAt: ts('2025-01-01') },
  { id: 'tpl-5', text: 'お大事にしてください。回復をお祈りしています。', order: 5, createdAt: ts('2025-01-01') },
  { id: 'tpl-6', text: '詳細は後日改めてご連絡いたします。', order: 6, createdAt: ts('2025-01-01') },
]

// ===================== SEED =====================

async function seed() {
  console.log('Seeding Firestore...\n')

  // Classrooms
  console.log('  classrooms...')
  for (const c of classrooms) {
    const { id, ...data } = c
    await setDoc(doc(db, 'classrooms', id), data)
  }

  // Users (admin + members)
  console.log('  users (admin)...')
  {
    const { uid, ...data } = adminUser
    await setDoc(doc(db, 'users', uid), data)
  }
  console.log('  users (51 members)...')
  for (const m of members) {
    const { uid, ...data } = m
    await setDoc(doc(db, 'users', uid), data)
  }

  // Broadcasts
  console.log('  broadcasts...')
  for (const b of broadcasts) {
    const { id, ...data } = b
    await setDoc(doc(db, 'broadcasts', id), data)
  }

  // ReadStatuses
  console.log('  readStatuses...')
  for (const r of readStatuses) {
    const { id, ...data } = r
    await setDoc(doc(db, 'readStatuses', id), data)
  }

  // Messages
  console.log('  messages...')
  for (const msg of messages) {
    const { id, ...data } = msg
    await setDoc(doc(db, 'messages', id), data)
  }

  // Absences
  console.log('  absences...')
  for (const a of absences) {
    const { id, ...data } = a
    await setDoc(doc(db, 'absences', id), data)
  }

  // Events
  console.log('  events...')
  for (const e of events) {
    const { id, ...data } = e
    await setDoc(doc(db, 'events', id), data)
  }

  // Templates
  console.log('  templates...')
  for (const t of templates) {
    const { id, ...data } = t
    await setDoc(doc(db, 'templates', id), data)
  }

  console.log('\nDone! All collections seeded successfully.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
