import type { Message, Broadcast, ReadStatus, Absence, CalendarEvent, User } from '../types'

// --- ユーザー ---
export const DUMMY_MEMBERS: User[] = [
  { uid: 'member-001', name: '山田 太郎', role: 'member', classId: 'class-a', email: 'yamada@example.com', createdAt: new Date('2025-04-01') },
  { uid: 'member-002', name: '鈴木 花子', role: 'member', classId: 'class-a', email: 'suzuki@example.com', createdAt: new Date('2025-04-01') },
  { uid: 'member-003', name: '佐々木 一郎', role: 'member', classId: 'class-b', email: 'sasaki@example.com', createdAt: new Date('2025-05-01') },
  { uid: 'member-004', name: '高橋 美咲', role: 'member', classId: 'class-b', email: 'takahashi@example.com', createdAt: new Date('2025-06-01') },
  { uid: 'member-005', name: '伊藤 健太', role: 'member', classId: 'class-a', email: 'ito@example.com', createdAt: new Date('2025-07-01') },
  { uid: 'member-006', name: '渡辺 さくら', role: 'member', classId: 'class-c', email: 'watanabe@example.com', createdAt: new Date('2025-04-15') },
  { uid: 'member-007', name: '中村 大輔', role: 'member', classId: 'class-c', email: 'nakamura@example.com', createdAt: new Date('2025-05-15') },
]

// --- セグメント配信 ---
export const DUMMY_BROADCASTS: Broadcast[] = [
  {
    id: 'bc-1',
    title: '【重要】来週の練習スケジュール変更',
    body: '来週の水曜日（2/11）は祝日のため、練習はお休みとなります。\n\n振替練習は2/14（土）10:00〜12:00に実施します。\n場所は第1グラウンドです。\n\nお忘れ物のないようご準備ください。',
    targetType: 'all',
    targetClassIds: [],
    isImportant: true,
    status: 'sent',
    sentAt: new Date('2026-02-07T09:00:00'),
    createdBy: 'admin-001',
    createdAt: new Date('2026-02-06T20:00:00'),
  },
  {
    id: 'bc-2',
    title: '3月の大会エントリー受付開始',
    body: '3月15日開催の春季大会のエントリーを受け付けます。\n\n■ 大会名: 第12回 春季ジュニアカップ\n■ 場所: 県営総合運動公園\n■ 日時: 3月15日(日) 8:00集合\n■ 対象: A・Bクラス\n\n参加希望の方は2月末までに申請フォームからお申し込みください。',
    imageUrl: 'https://placehold.co/600x300/2563eb/white?text=春季大会',
    targetType: 'class',
    targetClassIds: ['class-a', 'class-b'],
    isImportant: false,
    status: 'sent',
    sentAt: new Date('2026-02-05T12:00:00'),
    createdBy: 'admin-001',
    createdAt: new Date('2026-02-05T10:00:00'),
  },
  {
    id: 'bc-3',
    title: '新ユニフォームのデザイン投票',
    body: '来シーズンのユニフォームデザインを3案の中から投票で決定します。\n\nA案: 青ベースにオレンジライン\nB案: 白ベースに青ライン\nC案: オレンジベースに白ライン\n\n投票はマイページのアンケートフォームからお願いします。\n締め切り: 2月28日',
    imageUrl: 'https://placehold.co/600x300/f97316/white?text=ユニフォーム投票',
    targetType: 'all',
    targetClassIds: [],
    isImportant: false,
    status: 'sent',
    sentAt: new Date('2026-02-03T14:00:00'),
    createdBy: 'admin-002',
    createdAt: new Date('2026-02-03T10:00:00'),
  },
  {
    id: 'bc-4',
    title: 'Cクラス保護者会のお知らせ',
    body: '下記の通りCクラス保護者会を開催します。\n\n■ 日時: 2月20日(木) 19:00〜20:00\n■ 場所: クラブハウス2F会議室\n■ 議題: 春合宿について、年間スケジュール\n\nご出席の可否を2/15までにご連絡ください。',
    targetType: 'class',
    targetClassIds: ['class-c'],
    isImportant: false,
    status: 'sent',
    sentAt: new Date('2026-02-08T10:00:00'),
    createdBy: 'admin-001',
    createdAt: new Date('2026-02-08T09:00:00'),
  },
  {
    id: 'bc-5',
    title: '週末練習のお知らせ',
    body: '今週末の練習について連絡します。\n\n■ 日時: 2月15日(土) 9:00〜11:00\n■ 場所: 第2グラウンド\n■ 持ち物: 通常練習セット\n\n天候により中止の場合は当日朝7時までに連絡します。',
    targetType: 'all',
    targetClassIds: [],
    isImportant: false,
    status: 'scheduled',
    scheduledAt: new Date('2026-02-13T08:00:00'),
    createdBy: 'admin-001',
    createdAt: new Date('2026-02-10T15:00:00'),
  },
]

// --- 開封状況 ---
export const DUMMY_READ_STATUSES: ReadStatus[] = [
  // bc-1: 7人中5人開封
  { broadcastId: 'bc-1', userId: 'member-001', userName: '山田 太郎', openedAt: new Date('2026-02-07T09:05:00') },
  { broadcastId: 'bc-1', userId: 'member-002', userName: '鈴木 花子', openedAt: new Date('2026-02-07T09:10:00') },
  { broadcastId: 'bc-1', userId: 'member-003', userName: '佐々木 一郎', openedAt: new Date('2026-02-07T10:00:00') },
  { broadcastId: 'bc-1', userId: 'member-005', userName: '伊藤 健太', openedAt: new Date('2026-02-07T12:00:00') },
  { broadcastId: 'bc-1', userId: 'member-006', userName: '渡辺 さくら', openedAt: new Date('2026-02-07T14:00:00') },
  // bc-2: 4人中3人開封 (class-a, class-bのみ対象)
  { broadcastId: 'bc-2', userId: 'member-001', userName: '山田 太郎', openedAt: new Date('2026-02-05T12:30:00') },
  { broadcastId: 'bc-2', userId: 'member-002', userName: '鈴木 花子', openedAt: new Date('2026-02-05T13:00:00') },
  { broadcastId: 'bc-2', userId: 'member-005', userName: '伊藤 健太', openedAt: new Date('2026-02-05T15:00:00') },
  // bc-3: 7人中4人開封
  { broadcastId: 'bc-3', userId: 'member-001', userName: '山田 太郎', openedAt: new Date('2026-02-03T14:30:00') },
  { broadcastId: 'bc-3', userId: 'member-004', userName: '高橋 美咲', openedAt: new Date('2026-02-03T16:00:00') },
  { broadcastId: 'bc-3', userId: 'member-006', userName: '渡辺 さくら', openedAt: new Date('2026-02-03T17:00:00') },
  { broadcastId: 'bc-3', userId: 'member-007', userName: '中村 大輔', openedAt: new Date('2026-02-04T08:00:00') },
  // bc-4: 2人中1人開封 (class-cのみ)
  { broadcastId: 'bc-4', userId: 'member-006', userName: '渡辺 さくら', openedAt: new Date('2026-02-08T10:30:00') },
]

// --- 個別チャットメッセージ ---
export const DUMMY_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    text: '花子の膝の具合はいかがですか？無理せずお休みしても大丈夫ですよ。',
    type: 'text',
    senderUid: 'admin-001',
    senderName: '田中コーチ',
    senderRole: 'admin',
    recipientUid: 'member-001',
    createdAt: new Date('2026-02-06T10:00:00'),
  },
  {
    id: 'msg-2',
    text: 'ありがとうございます。だいぶ良くなってきたので、来週から復帰できそうです！',
    type: 'text',
    senderUid: 'member-001',
    senderName: '山田 太郎',
    senderRole: 'member',
    recipientUid: 'admin-001',
    createdAt: new Date('2026-02-06T10:15:00'),
  },
  {
    id: 'msg-3',
    text: 'よかったです！復帰初日は軽めのメニューにしますね。',
    type: 'text',
    senderUid: 'admin-001',
    senderName: '田中コーチ',
    senderRole: 'admin',
    recipientUid: 'member-001',
    createdAt: new Date('2026-02-06T10:20:00'),
  },
  {
    id: 'msg-4',
    text: 'お世話になっております。先日の練習試合のお写真はいただけますでしょうか？',
    type: 'text',
    senderUid: 'member-002',
    senderName: '鈴木 花子',
    senderRole: 'member',
    recipientUid: 'admin-001',
    createdAt: new Date('2026-02-07T15:00:00'),
  },
]

// --- お休み連絡 ---
export const DUMMY_ABSENCES: Absence[] = [
  {
    id: 'abs-1',
    userId: 'member-001',
    userName: '山田 太郎',
    classId: 'class-a',
    date: new Date('2026-02-10'),
    reason: '怪我',
    note: '膝の痛みがあるため',
    createdAt: new Date('2026-02-08T18:00:00'),
  },
  {
    id: 'abs-2',
    userId: 'member-003',
    userName: '佐々木 一郎',
    classId: 'class-b',
    date: new Date('2026-02-10'),
    reason: '体調不良',
    createdAt: new Date('2026-02-09T20:00:00'),
  },
  {
    id: 'abs-3',
    userId: 'member-006',
    userName: '渡辺 さくら',
    classId: 'class-c',
    date: new Date('2026-02-12'),
    reason: '学校行事',
    note: '授業参観のため',
    createdAt: new Date('2026-02-10T08:00:00'),
  },
]

// --- カレンダーイベント ---
export const DUMMY_EVENTS: CalendarEvent[] = [
  { id: 'ev-1', title: '通常練習', date: new Date('2026-02-10T17:00:00'), description: '第1グラウンド 17:00〜19:00', classId: 'all', type: 'practice' },
  { id: 'ev-2', title: '祝日 - 練習休み', date: new Date('2026-02-11T00:00:00'), classId: 'all', type: 'holiday' },
  { id: 'ev-3', title: '振替練習', date: new Date('2026-02-14T10:00:00'), description: '体育館 10:00〜12:00', classId: 'all', type: 'practice' },
  { id: 'ev-4', title: '練習試合 vs チームB', date: new Date('2026-02-22T09:00:00'), description: '市営グラウンド 9:00〜15:00\n集合: 8:30\n持ち物: ユニフォーム、弁当、水筒', classId: 'class-a', type: 'game' },
  { id: 'ev-5', title: '3月大会', date: new Date('2026-03-15T08:00:00'), description: '県営総合運動公園\n8:00集合', classId: 'all', type: 'game' },
]

// --- ヘルパー ---
export const CLASS_OPTIONS = [
  { value: 'class-a', label: 'Aクラス' },
  { value: 'class-b', label: 'Bクラス' },
  { value: 'class-c', label: 'Cクラス' },
] as const

export function getClassLabel(classId: string): string {
  return CLASS_OPTIONS.find((c) => c.value === classId)?.label ?? classId
}

export function getTargetLabel(bc: Broadcast): string {
  if (bc.targetType === 'all') return '全体'
  if (bc.targetType === 'class') return bc.targetClassIds.map(getClassLabel).join(', ')
  return '個別指定'
}

export function getTargetMemberCount(bc: Broadcast): number {
  if (bc.targetType === 'all') return DUMMY_MEMBERS.length
  if (bc.targetType === 'class') {
    return DUMMY_MEMBERS.filter((m) => bc.targetClassIds.includes(m.classId)).length
  }
  return bc.targetUserIds?.length ?? 0
}
