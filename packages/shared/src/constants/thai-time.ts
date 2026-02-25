// Thai time period names mapped to Chinese 時辰 (2-hour periods)
export const THAI_TIME_PERIODS = [
  { name: 'ตีหนึ่ง', label: 'ตี 1-3', chineseHour: 1, period: 'zi' },      // 01:00-03:00
  { name: 'ตีสอง', label: 'ตี 3-5', chineseHour: 3, period: 'chou' },    // 03:00-05:00
  { name: 'รุ่งเช้า', label: 'เช้า 5-7', chineseHour: 5, period: 'yin' },   // 05:00-07:00
  { name: 'เช้าตรู่', label: 'เช้า 7-9', chineseHour: 7, period: 'mao' },   // 07:00-09:00
  { name: 'สายเช้า', label: 'สาย 9-11', chineseHour: 9, period: 'chen' },  // 09:00-11:00
  { name: 'เที่ยง', label: 'เที่ยง 11-13', chineseHour: 11, period: 'si' }, // 11:00-13:00
  { name: 'บ่ายโมง', label: 'บ่าย 13-15', chineseHour: 13, period: 'wu' }, // 13:00-15:00
  { name: 'บ่ายสาม', label: 'บ่าย 15-17', chineseHour: 15, period: 'wei' }, // 15:00-17:00
  { name: 'เย็น', label: 'เย็น 17-19', chineseHour: 17, period: 'shen' },   // 17:00-19:00
  { name: 'ค่ำ', label: 'ค่ำ 19-21', chineseHour: 19, period: 'you' },      // 19:00-21:00
  { name: 'สองทุ่ม', label: 'สองทุ่ม 21-23', chineseHour: 21, period: 'xu' }, // 21:00-23:00
  { name: 'เที่ยงคืน', label: 'เที่ยงคืน 23-01', chineseHour: 23, period: 'hai' }, // 23:00-01:00
] as const;

export const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
] as const;

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
] as const;

// Buddhist Era offset
export const BE_OFFSET = 543;
