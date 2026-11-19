/**
 * JAABBAR 3D LIVE OPS - Venue Layout & Staff Database
 * JAABBAR CONCERT • SEOUL CAFÉ & SPACE
 */

const VENUE_ZONES = {
  VIP: {
    id: 'VIP',
    name: 'ZONE VIP (โต๊ะนั่งหน้าเวที)',
    shortName: 'ZONE VIP',
    color: '#8b5cf6',
    colorHex: 0x8b5cf6,
    price: 2500,
    tableCount: 13,
    description: 'โต๊ะหน้าเวทีคอนเสิร์ต 13 โต๊ะ (โต๊ะ 6, 7, 54, 53, 52, 51, 50, 49, 48, 46, 47, 45, 44)'
  },
  ZONE_A: {
    id: 'ZONE_A',
    name: 'ZONE A (Pre-sale โต๊ะยืนแถวหน้า)',
    shortName: 'ZONE A',
    color: '#f97316',
    colorHex: 0xf97316,
    price: 1500,
    tableCount: 17,
    description: 'โต๊ะแถวหน้าคอนเสิร์ต 17 โต๊ะ (โต๊ะ 5, 8, 16-19, 22-25, 28-31, 34-36)'
  },
  ZONE_SOFA: {
    id: 'ZONE_SOFA',
    name: 'ZONE SOFA (โต๊ะนั่งโซฟาริมผนัง/ข้างบาร์)',
    shortName: 'ZONE SOFA',
    color: '#eab308',
    colorHex: 0xeab308,
    price: 1200,
    tableCount: 5,
    description: 'โซฟานุ่มสบายริมผนังและข้างบาร์ 5 โต๊ะ (โต๊ะ 13, 14, 37, 38, 39)'
  },
  ZONE_B: {
    id: 'ZONE_B',
    name: 'ZONE B & BAR (Walk-in โต๊ะยืนโซนหลัง & หน้าบาร์)',
    shortName: 'ZONE B',
    color: '#22c55e',
    colorHex: 0x22c55e,
    price: 800,
    tableCount: 19,
    description: 'โต๊ะโซนหลัง 19 โต๊ะ (โต๊ะ 1–4, 9–12, 15, 20–21, 26–27, 32–33, 40–43) และที่นั่งหน้าบาร์'
  },
  BAR: {
    id: 'BAR',
    name: 'บาร์น้ำ (BAR & COUNTER)',
    shortName: 'บาร์น้ำ',
    color: '#06b6d4',
    colorHex: 0x06b6d4,
    price: 350,
    tableCount: 6,
    description: 'เก้าอี้บาร์สตูลสีฟ้า 6 ที่นั่ง (B-1 ถึง B-6)'
  }
};

// All 54 Tables + 6 Bar Seats placed exactly per the floor plan
const TABLES_CONFIG = [
  // --- ZONE VIP (13 Tables) ---
  // Left of Stage
  { id: '6', number: '6', zone: 'VIP', x: -24.5, z: -14.5, shape: 'round', seats: 4, label: 'VIP 6' },
  { id: '7', number: '7', zone: 'VIP', x: -18.5, z: -14.5, shape: 'round', seats: 4, label: 'VIP 7' },
  { id: '54', number: '54', zone: 'VIP', x: -12.5, z: -13.0, shape: 'round', seats: 4, label: 'VIP 54' },
  // Right of Stage
  { id: '46', number: '46', zone: 'VIP', x: 12.0, z: -20.5, shape: 'round', seats: 4, label: 'VIP 46' },
  { id: '47', number: '47', zone: 'VIP', x: 11.0, z: -15.5, shape: 'round', seats: 4, label: 'VIP 47' },
  { id: '45', number: '45', zone: 'VIP', x: 16.5, z: -15.5, shape: 'round', seats: 4, label: 'VIP 45' },
  { id: '44', number: '44', zone: 'VIP', x: 19.5, z: -10.0, shape: 'round', seats: 4, label: 'VIP 44' },
  // Front Row of VIP (Horizontal row)
  { id: '53', number: '53', zone: 'VIP', x: -13.0, z: -8.0, shape: 'round', seats: 4, label: 'VIP 53' },
  { id: '52', number: '52', zone: 'VIP', x: -6.5, z: -8.0, shape: 'round', seats: 4, label: 'VIP 52' },
  { id: '51', number: '51', zone: 'VIP', x: 0.0, z: -8.0, shape: 'round', seats: 4, label: 'VIP 51' },
  { id: '50', number: '50', zone: 'VIP', x: 6.5, z: -8.0, shape: 'round', seats: 4, label: 'VIP 50' },
  { id: '49', number: '49', zone: 'VIP', x: 13.0, z: -8.0, shape: 'round', seats: 4, label: 'VIP 49' },
  { id: '48', number: '48', zone: 'VIP', x: 18.0, z: -8.0, shape: 'round', seats: 4, label: 'VIP 48' },

  // --- ZONE A (17 Tables) ---
  // Row 1 (Just behind VIP barrier line)
  { id: '5', number: '5', zone: 'ZONE_A', x: -24.5, z: -3.0, shape: 'square', seats: 4, label: 'A 5' },
  { id: '8', number: '8', zone: 'ZONE_A', x: -18.5, z: -3.0, shape: 'square', seats: 4, label: 'A 8' },
  { id: '17', number: '17', zone: 'ZONE_A', x: -13.0, z: -3.0, shape: 'square', seats: 4, label: 'A 17' },
  { id: '18', number: '18', zone: 'ZONE_A', x: -8.0, z: -3.0, shape: 'square', seats: 4, label: 'A 18' },
  { id: '23', number: '23', zone: 'ZONE_A', x: -3.0, z: -3.0, shape: 'square', seats: 4, label: 'A 23' },
  { id: '24', number: '24', zone: 'ZONE_A', x: 2.0, z: -3.0, shape: 'square', seats: 4, label: 'A 24' },
  { id: '29', number: '29', zone: 'ZONE_A', x: 7.0, z: -3.0, shape: 'square', seats: 4, label: 'A 29' },
  { id: '30', number: '30', zone: 'ZONE_A', x: 12.0, z: -3.0, shape: 'square', seats: 4, label: 'A 30' },
  { id: '35', number: '35', zone: 'ZONE_A', x: 17.0, z: -3.0, shape: 'square', seats: 4, label: 'A 35' },
  { id: '36', number: '36', zone: 'ZONE_A', x: 21.5, z: -3.0, shape: 'square', seats: 4, label: 'A 36' },
  // Row 2
  { id: '16', number: '16', zone: 'ZONE_A', x: -11.0, z: 1.8, shape: 'square', seats: 4, label: 'A 16' },
  { id: '19', number: '19', zone: 'ZONE_A', x: -6.0, z: 1.8, shape: 'square', seats: 4, label: 'A 19' },
  { id: '22', number: '22', zone: 'ZONE_A', x: -1.0, z: 1.8, shape: 'square', seats: 4, label: 'A 22' },
  { id: '25', number: '25', zone: 'ZONE_A', x: 4.0, z: 1.8, shape: 'square', seats: 4, label: 'A 25' },
  { id: '28', number: '28', zone: 'ZONE_A', x: 9.0, z: 1.8, shape: 'square', seats: 4, label: 'A 28' },
  { id: '31', number: '31', zone: 'ZONE_A', x: 14.0, z: 1.8, shape: 'square', seats: 4, label: 'A 31' },
  { id: '34', number: '34', zone: 'ZONE_A', x: 19.0, z: 1.8, shape: 'square', seats: 4, label: 'A 34' },

  // --- ZONE B (19 Tables) ---
  // Left wall column (1, 2, 3, 4)
  { id: '4', number: '4', zone: 'ZONE_B', x: -24.5, z: 2.5, shape: 'square', seats: 4, label: 'B 4' },
  { id: '3', number: '3', zone: 'ZONE_B', x: -24.5, z: 8.5, shape: 'square', seats: 4, label: 'B 3' },
  { id: '2', number: '2', zone: 'ZONE_B', x: -24.5, z: 14.5, shape: 'square', seats: 4, label: 'B 2' },
  { id: '1', number: '1', zone: 'ZONE_B', x: -24.5, z: 20.5, shape: 'square', seats: 4, label: 'B 1' },
  // Second left column (9, 10, 11, 12)
  { id: '9', number: '9', zone: 'ZONE_B', x: -18.5, z: 6.5, shape: 'square', seats: 4, label: 'B 9' },
  { id: '10', number: '10', zone: 'ZONE_B', x: -17.5, z: 12.5, shape: 'square', seats: 4, label: 'B 10' },
  { id: '11', number: '11', zone: 'ZONE_B', x: -17.5, z: 16.5, shape: 'square', seats: 4, label: 'B 11' },
  { id: '12', number: '12', zone: 'ZONE_B', x: -17.5, z: 20.5, shape: 'square', seats: 4, label: 'B 12' },
  // Middle Row behind Zone A (15, 20, 21, 26, 27, 32, 33)
  { id: '15', number: '15', zone: 'ZONE_B', x: -13.0, z: 6.5, shape: 'square', seats: 4, label: 'B 15' },
  { id: '20', number: '20', zone: 'ZONE_B', x: -8.0, z: 6.5, shape: 'square', seats: 4, label: 'B 20' },
  { id: '21', number: '21', zone: 'ZONE_B', x: -2.5, z: 6.5, shape: 'square', seats: 4, label: 'B 21' },
  { id: '26', number: '26', zone: 'ZONE_B', x: 3.0, z: 6.5, shape: 'square', seats: 4, label: 'B 26' },
  { id: '27', number: '27', zone: 'ZONE_B', x: 8.5, z: 6.5, shape: 'square', seats: 4, label: 'B 27' },
  { id: '32', number: '32', zone: 'ZONE_B', x: 13.5, z: 6.5, shape: 'square', seats: 4, label: 'B 32' },
  { id: '33', number: '33', zone: 'ZONE_B', x: 19.0, z: 6.5, shape: 'square', seats: 4, label: 'B 33' },
  // Right column beside bar (43, 42, 41, 40)
  { id: '43', number: '43', zone: 'ZONE_B', x: 14.5, z: 10.5, shape: 'square', seats: 4, label: 'B 43' },
  { id: '42', number: '42', zone: 'ZONE_B', x: 14.5, z: 14.5, shape: 'square', seats: 4, label: 'B 42' },
  { id: '41', number: '41', zone: 'ZONE_B', x: 14.5, z: 18.5, shape: 'square', seats: 4, label: 'B 41' },
  { id: '40', number: '40', zone: 'ZONE_B', x: 15.0, z: 22.5, shape: 'square', seats: 4, label: 'B 40' },

  // --- ZONE SOFA (5 Tables) ---
  // Left of bar (14, 13)
  { id: '14', number: '14', zone: 'ZONE_SOFA', x: -11.0, z: 15.0, shape: 'sofa', seats: 5, label: 'SOFA 14' },
  { id: '13', number: '13', zone: 'ZONE_SOFA', x: -11.0, z: 21.0, shape: 'sofa', seats: 5, label: 'SOFA 13' },
  // Right wall (37, 38, 39)
  { id: '37', number: '37', zone: 'ZONE_SOFA', x: 23.5, z: 7.0, shape: 'sofa', seats: 5, label: 'SOFA 37' },
  { id: '38', number: '38', zone: 'ZONE_SOFA', x: 23.5, z: 13.0, shape: 'sofa', seats: 5, label: 'SOFA 38' },
  { id: '39', number: '39', zone: 'ZONE_SOFA', x: 25.5, z: 20.0, shape: 'sofa', seats: 5, label: 'SOFA 39' },

  // --- BAR STOOLS (6 Seats B-1 to B-6) ---
  { id: 'B-1', number: 'B-1', zone: 'BAR', x: -1.5, z: 12.8, shape: 'stool', seats: 1, label: 'บาร์ B-1' },
  { id: 'B-2', number: 'B-2', zone: 'BAR', x: 0.5, z: 12.8, shape: 'stool', seats: 1, label: 'บาร์ B-2' },
  { id: 'B-3', number: 'B-3', zone: 'BAR', x: 2.5, z: 12.8, shape: 'stool', seats: 1, label: 'บาร์ B-3' },
  { id: 'B-4', number: 'B-4', zone: 'BAR', x: 4.5, z: 12.8, shape: 'stool', seats: 1, label: 'บาร์ B-4' },
  { id: 'B-5', number: 'B-5', zone: 'BAR', x: 6.5, z: 12.8, shape: 'stool', seats: 1, label: 'บาร์ B-5' },
  { id: 'B-6', number: 'B-6', zone: 'BAR', x: 8.5, z: 12.8, shape: 'stool', seats: 1, label: 'บาร์ B-6' }
];

// 18 Staff / AI Agents Default Profiles
const DEFAULT_STAFF_PROFILES = [
  // --- บาร์น้ำ (2 คน - สีฟ้า Cyan #06b6d4) ---
  {
    id: 'JB-BAR-01',
    key: 'bar_1',
    name: 'บาริสต้า เจ',
    nickname: 'เจ (Jay)',
    role: 'บาร์น้ำ',
    title: 'หัวหน้าบาร์เทนเดอร์',
    dept: 'bar',
    deptName: 'บาร์น้ำ & เครื่องดื่ม',
    color: '#06b6d4',
    colorHex: 0x06b6d4,
    icon: '🍸',
    spawnPos: { x: 2.0, z: 15.5 },
    workPos: { x: 2.0, z: 15.5 },
    currentStatus: 'กำลังเชค Signature Cocktail',
    actionDesc: 'ผสมมิกโซโลจี้ ค็อกเทลสูตรพิเศษ',
    itemHolding: 'shaker',
    tasksCompleted: 42
  },
  {
    id: 'JB-BAR-02',
    key: 'bar_2',
    name: 'มิกโซโลจิสต์ นิว',
    nickname: 'นิว (New)',
    role: 'บาร์น้ำ',
    title: 'บาร์เทนเดอร์ชำนาญการ',
    dept: 'bar',
    deptName: 'บาร์น้ำ & เครื่องดื่ม',
    color: '#0891b2',
    colorHex: 0x0891b2,
    icon: '🍹',
    spawnPos: { x: 5.5, z: 15.5 },
    workPos: { x: 5.5, z: 15.5 },
    currentStatus: 'เสิร์ฟเครื่องดื่มหน้าบาร์ B-3',
    actionDesc: 'รินเบียร์สดคราฟต์ & เช็ดหน้าบาร์',
    itemHolding: 'glass',
    tasksCompleted: 38
  },

  // --- พนักงานเสิร์ฟ (6 คน - สีเขียว Emerald #10b981) ---
  {
    id: 'JB-SRV-01',
    key: 'srv_1',
    name: 'เสิร์ฟ กาย',
    nickname: 'กาย (Guy)',
    role: 'พนักงานเสิร์ฟ',
    title: 'พนักงานเสิร์ฟ โซน VIP',
    dept: 'waiter',
    deptName: 'ทีมเสิร์ฟ & บริการ',
    color: '#10b981',
    colorHex: 0x10b981,
    icon: '🤵',
    spawnPos: { x: 0.0, z: -5.0 },
    workPos: { x: 0.0, z: -5.0 },
    currentStatus: 'กำลังส่งแชมเปญ โต๊ะ VIP 51',
    actionDesc: 'ดูแลบริการระดับพรีเมียม โซน VIP',
    itemHolding: 'tray_champagne',
    tasksCompleted: 56
  },
  {
    id: 'JB-SRV-02',
    key: 'srv_2',
    name: 'เสิร์ฟ ตอง',
    nickname: 'ตอง (Tong)',
    role: 'พนักงานเสิร์ฟ',
    title: 'พนักงานเสิร์ฟ โซน A1',
    dept: 'waiter',
    deptName: 'ทีมเสิร์ฟ & บริการ',
    color: '#059669',
    colorHex: 0x059669,
    icon: '🍽️',
    spawnPos: { x: -5.0, z: -1.0 },
    workPos: { x: -5.0, z: -1.0 },
    currentStatus: 'รับอาหารจากช่องส่งครัวไปโต๊ะ 23',
    actionDesc: 'เสิร์ฟอาหารจานร้อน โซนแถวหน้า',
    itemHolding: 'tray_food',
    tasksCompleted: 49
  },
  {
    id: 'JB-SRV-03',
    key: 'srv_3',
    name: 'เสิร์ฟ พีท',
    nickname: 'พีท (Pete)',
    role: 'พนักงานเสิร์ฟ',
    title: 'พนักงานเสิร์ฟ โซน A2',
    dept: 'waiter',
    deptName: 'ทีมเสิร์ฟ & บริการ',
    color: '#34d399',
    colorHex: 0x34d399,
    icon: '🍱',
    spawnPos: { x: 8.0, z: 0.0 },
    workPos: { x: 8.0, z: 0.0 },
    currentStatus: 'กำลังนำเครื่องดื่มเสิร์ฟโต๊ะ 28',
    actionDesc: 'เดินนำสแน็คและดริงก์ส่งลูกค้า',
    itemHolding: 'tray_drink',
    tasksCompleted: 52
  },
  {
    id: 'JB-SRV-04',
    key: 'srv_4',
    name: 'เสิร์ฟ เมย์',
    nickname: 'เมย์ (May)',
    role: 'พนักงานเสิร์ฟ',
    title: 'พนักงานเสิร์ฟ โซนโซฟา',
    dept: 'waiter',
    deptName: 'ทีมเสิร์ฟ & บริการ',
    color: '#10b981',
    colorHex: 0x10b981,
    icon: '✨',
    spawnPos: { x: 18.0, z: 12.0 },
    workPos: { x: 18.0, z: 12.0 },
    currentStatus: 'บริการเซ็ตอาหารว่าง โต๊ะ 38',
    actionDesc: 'เช็กความเรียบร้อยโต๊ะโซฟาริมผนัง',
    itemHolding: 'tray_food',
    tasksCompleted: 44
  },
  {
    id: 'JB-SRV-05',
    key: 'srv_5',
    name: 'เสิร์ฟ บิว',
    nickname: 'บิว (Bew)',
    role: 'พนักงานเสิร์ฟ',
    title: 'พนักงานเสิร์ฟ โซน B ซ้าย',
    dept: 'waiter',
    deptName: 'ทีมเสิร์ฟ & บริการ',
    color: '#047857',
    colorHex: 0x047857,
    icon: '🍻',
    spawnPos: { x: -20.0, z: 10.0 },
    workPos: { x: -20.0, z: 10.0 },
    currentStatus: 'นำแก้วเบียร์เสิร์ฟโต๊ะ 10',
    actionDesc: 'เดินตรวจและเก็บแก้วที่โต๊ะ 3',
    itemHolding: 'tray_drink',
    tasksCompleted: 47
  },
  {
    id: 'JB-SRV-06',
    key: 'srv_6',
    name: 'เสิร์ฟ ฝ้าย',
    nickname: 'ฝ้าย (Fai)',
    role: 'พนักงานเสิร์ฟ',
    title: 'พนักงานเสิร์ฟ โซน B ขวา',
    dept: 'waiter',
    deptName: 'ทีมเสิร์ฟ & บริการ',
    color: '#6ee7b7',
    colorHex: 0x6ee7b7,
    icon: '🥂',
    spawnPos: { x: 12.0, z: 14.0 },
    workPos: { x: 12.0, z: 14.0 },
    currentStatus: 'นำออเดอร์ส่งโต๊ะ 42',
    actionDesc: 'บริการเครื่องดื่มและของทานเล่น',
    itemHolding: 'tray_food',
    tasksCompleted: 51
  },

  // --- พนักงานครัว (5 คน - สีส้ม Orange #f97316 + หมวกเชฟ) ---
  {
    id: 'JB-KIT-01',
    key: 'chef_1',
    name: 'เชฟใหญ่ ท็อป',
    nickname: 'ท็อป (Chef Top)',
    role: 'พนักงานครัว',
    title: 'หัวหน้าพ่อครัว (Executive Chef)',
    dept: 'kitchen',
    deptName: 'ครัว & อาหารเกาหลี',
    color: '#f97316',
    colorHex: 0xf97316,
    icon: '👨‍🍳',
    hasChefHat: true,
    spawnPos: { x: 27.5, z: -1.0 },
    workPos: { x: 27.5, z: -1.0 },
    currentStatus: 'วางจานอาหารที่ช่องส่งอาหาร',
    actionDesc: 'ตรวจเช็กคุณภาพอาหารและกดกริ่งเรียกเสิร์ฟ',
    itemHolding: 'pot',
    tasksCompleted: 62
  },
  {
    id: 'JB-KIT-02',
    key: 'chef_2',
    name: 'ผู้ช่วยเชฟ โอม',
    nickname: 'โอม (Ohm)',
    role: 'พนักงานครัว',
    title: 'เชฟกระทะร้อน 1 (Hot Wok)',
    dept: 'kitchen',
    deptName: 'ครัว & อาหารเกาหลี',
    color: '#ea580c',
    colorHex: 0xea580c,
    icon: '🍳',
    hasChefHat: true,
    spawnPos: { x: 30.5, z: -3.5 },
    workPos: { x: 30.5, z: -3.5 },
    currentStatus: 'ผัดไก่ทอดซอสเกาหลีกระทะร้อน',
    actionDesc: 'ปรุงเมนูกระทะร้อนและต๊อกบกกีชีส',
    itemHolding: 'pan',
    tasksCompleted: 58
  },
  {
    id: 'JB-KIT-03',
    key: 'chef_3',
    name: 'เชฟกระทะร้อน ก้อง',
    nickname: 'ก้อง (Kong)',
    role: 'พนักงานครัว',
    title: 'เชฟสเต็ก & กระทะร้อน 2',
    dept: 'kitchen',
    deptName: 'ครัว & อาหารเกาหลี',
    color: '#fb923c',
    colorHex: 0xfb923c,
    icon: '🥩',
    hasChefHat: true,
    spawnPos: { x: 30.5, z: -1.5 },
    workPos: { x: 30.5, z: -1.5 },
    currentStatus: 'ย่างเนื้อหมูสามชั้นย่างเกาหลี',
    actionDesc: 'ควบคุมเตาย่างและเตรียมเซ็ตปิ้งย่าง',
    itemHolding: 'spatula',
    tasksCompleted: 54
  },
  {
    id: 'JB-KIT-04',
    key: 'chef_4',
    name: 'เชฟเตรียม ปอนด์',
    nickname: 'ปอนด์ (Pond)',
    role: 'พนักงานครัว',
    title: 'เชฟเตรียมวัตถุดิบ & สลัด',
    dept: 'kitchen',
    deptName: 'ครัว & อาหารเกาหลี',
    color: '#fdba74',
    colorHex: 0xfdba74,
    icon: '🥗',
    hasChefHat: true,
    spawnPos: { x: 30.5, z: 1.0 },
    workPos: { x: 30.5, z: 1.0 },
    currentStatus: 'หั่นผักเครื่องเคียงกิมจิสด',
    actionDesc: 'เตรียมวัตถุดิบและจัดจานเครื่องเคียง',
    itemHolding: 'knife',
    tasksCompleted: 60
  },
  {
    id: 'JB-KIT-05',
    key: 'chef_5',
    name: 'เชฟของหวาน มุก',
    nickname: 'มุก (Mook)',
    role: 'พนักงานครัว',
    title: 'เชฟของหวาน & คาเฟ่โซล',
    dept: 'kitchen',
    deptName: 'ครัว & อาหารเกาหลี',
    color: '#ff7849',
    colorHex: 0xff7849,
    icon: '🍧',
    hasChefHat: true,
    spawnPos: { x: 28.0, z: 2.2 },
    workPos: { x: 28.0, z: 2.2 },
    currentStatus: 'ทำบิงซูสตรอว์เบอร์รีเกาหลี',
    actionDesc: 'ตกแต่งขนมหวานและของทานเล่นคาเฟ่',
    itemHolding: 'bowl',
    tasksCompleted: 46
  },

  // --- พนักงานบัญชี (1 คน - สีน้ำเงิน Indigo #6366f1 + แว่นตา) ---
  {
    id: 'JB-ACC-01',
    key: 'acc_1',
    name: 'นักบัญชี แบงค์',
    nickname: 'แบงค์ (Bank)',
    role: 'พนักงานบัญชี',
    title: 'หัวหน้าฝ่ายบัญชีและการเงิน',
    dept: 'accountant',
    deptName: 'การเงิน & POS หลังบาร์',
    color: '#6366f1',
    colorHex: 0x6366f1,
    icon: '💼',
    hasGlasses: true,
    spawnPos: { x: 2.0, z: 21.0 },
    workPos: { x: 2.0, z: 21.0 },
    currentStatus: 'ตรวจเช็กยอดขาย POS แบบเรียลไทม์',
    actionDesc: 'ตรวจสอบยอดใบเสร็จและเงินสดที่บาร์น้ำ',
    itemHolding: 'tablet',
    tasksCompleted: 35
  },

  // --- ผู้จัดการ (2 คน - สีม่วง Purple #a855f7) ---
  {
    id: 'JB-MGR-01',
    key: 'mgr_1',
    name: 'ผจก. นัท',
    nickname: 'นัท (Nut)',
    role: 'ผู้จัดการ',
    title: 'ผู้จัดการฝ่ายปฏิบัติการหน้าร้าน',
    dept: 'manager',
    deptName: 'ฝ่ายบริหารจัดการ',
    color: '#a855f7',
    colorHex: 0xa855f7,
    icon: '📋',
    spawnPos: { x: -6.0, z: -5.0 },
    workPos: { x: -6.0, z: -5.0 },
    currentStatus: 'ตรวจความเรียบร้อยโซน VIP & เวที',
    actionDesc: 'ประสานงานดูแลลูกค้าคนสำคัญรอบเวที',
    itemHolding: 'clipboard',
    tasksCompleted: 40
  },
  {
    id: 'JB-MGR-02',
    key: 'mgr_2',
    name: 'ผจก. แพร',
    nickname: 'แพร (Prae)',
    role: 'ผู้จัดการ',
    title: 'ผู้จัดการคุณภาพการบริการ & ครัว',
    dept: 'manager',
    deptName: 'ฝ่ายบริหารจัดการ',
    color: '#9333ea',
    colorHex: 0x9333ea,
    icon: '📑',
    spawnPos: { x: 21.0, z: 0.0 },
    workPos: { x: 21.0, z: 0.0 },
    currentStatus: 'ประสานคิวอาหารระหว่างครัวและเสิร์ฟ',
    actionDesc: 'ตรวจรอบช่องส่งอาหารและรายงานซีอีโอ',
    itemHolding: 'radio',
    tasksCompleted: 43
  },

  // --- เจ้าของร้าน CEO / ผู้บริหาร (2 คน - สีเหลืองทอง Gold #eab308 + มงกุฎ/เข็มกลัด) ---
  {
    id: 'JB-CEO-01',
    key: 'ceo_1',
    name: 'ซีอีโอ วิน',
    nickname: 'วิน (CEO Win)',
    role: 'ผู้บริหาร (CEO)',
    title: 'ประธานกรรมการผู้จัดการ (CEO & Founder)',
    dept: 'executive',
    deptName: 'ผู้บริหารระดับสูง',
    color: '#eab308',
    colorHex: 0xeab308,
    icon: '👑',
    hasCrown: true,
    spawnPos: { x: -16.0, z: -9.0 },
    workPos: { x: -16.0, z: -9.0 },
    currentStatus: 'ตรวจระบบแสงสีเสียงเวทีคอนเสิร์ต',
    actionDesc: 'ดูแลประสบการณ์คอนเสิร์ตและทักทายลูกค้า VIP',
    itemHolding: 'phone',
    tasksCompleted: 31
  },
  {
    id: 'JB-CEO-02',
    key: 'ceo_2',
    name: 'ผู้บริหาร ฟ้า',
    nickname: 'ฟ้า (MD Fah)',
    role: 'ผู้บริหาร (CEO)',
    title: 'กรรมการบริหารภาพรวม (Managing Director)',
    dept: 'executive',
    deptName: 'ผู้บริหารระดับสูง',
    color: '#f59e0b',
    colorHex: 0xf59e0b,
    icon: '💎',
    hasCrown: true,
    spawnPos: { x: -22.0, z: 18.0 },
    workPos: { x: -22.0, z: 18.0 },
    currentStatus: 'ต้อนรับลูกค้าที่จุดทางเข้า-ออก',
    actionDesc: 'สังเกตการณ์การไหลเวียนลูกค้าและประชุมกับ ผจก.',
    itemHolding: 'tablet',
    tasksCompleted: 29
  }
];

// LocalStorage Persistence Key (Requested: jaabbar_custom_staff_names)
const STORAGE_KEY_STAFF_NAMES = 'jaabbar_custom_staff_names';

class StaffDataManager {
  constructor() {
    this.staffList = [];
    this.loadStaffData();
  }

  loadStaffData() {
    let savedNames = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STAFF_NAMES) || localStorage.getItem('jaabbar_staff_names_v1');
      if (stored) {
        savedNames = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Cannot load staff names from localStorage', e);
    }

    // Clone defaults and apply saved customizations
    this.staffList = DEFAULT_STAFF_PROFILES.map(staff => {
      const saved = savedNames[staff.id];
      if (saved) {
        return {
          ...staff,
          name: saved.name || staff.name,
          nickname: saved.nickname || staff.nickname,
          id: saved.id || staff.id,
          title: saved.title || staff.title,
          customNote: saved.customNote || ''
        };
      }
      return { ...staff };
    });
  }

  saveStaffName(staffId, newName, newNickname, newTitle, newId) {
    const staff = this.staffList.find(s => s.id === staffId);
    if (!staff) return false;

    if (newName) staff.name = newName.trim();
    if (newNickname) staff.nickname = newNickname.trim();
    if (newTitle) staff.title = newTitle.trim();
    if (newId) staff.id = newId.trim();

    // Persist to localStorage with key: jaabbar_custom_staff_names
    const savedObj = {};
    this.staffList.forEach(s => {
      savedObj[s.id] = {
        id: s.id,
        name: s.name,
        nickname: s.nickname,
        title: s.title
      };
    });

    try {
      localStorage.setItem(STORAGE_KEY_STAFF_NAMES, JSON.stringify(savedObj));
    } catch (e) {
      console.warn('Failed saving staff to localStorage', e);
    }

    return staff;
  }

  resetToDefault() {
    try {
      localStorage.removeItem(STORAGE_KEY_STAFF_NAMES);
      localStorage.removeItem('jaabbar_staff_names_v1');
    } catch (e) {
      console.warn('Failed to clear staff localStorage', e);
    }
    this.staffList = DEFAULT_STAFF_PROFILES.map(s => ({ ...s }));
    return this.staffList;
  }

  getStaffById(id) {
    return this.staffList.find(s => s.id === id);
  }

  getStaffByKey(key) {
    return this.staffList.find(s => s.key === key);
  }

  getAllStaff() {
    return this.staffList;
  }
}

// Global Staff Manager Instance
const staffManager = new StaffDataManager();
