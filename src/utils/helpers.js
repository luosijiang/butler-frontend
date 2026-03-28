export const calculateDuration = (start, end) => {
  if (!start || !end) return '';
  const startTime = new Date(start.replace('T', ' ').replace(/-/g, '/')).getTime();
  const endTime = new Date(end.replace('T', ' ').replace(/-/g, '/')).getTime();
  if (isNaN(startTime) || isNaN(endTime) || endTime < startTime) return '';

  const diffMins = Math.floor((endTime - startTime) / 60000);
  const days = Math.floor(diffMins / 1440);
  const hours = Math.floor((diffMins % 1440) / 60);
  const mins = diffMins % 60;

  let res = [];
  if (days > 0) res.push(`${days}天`);
  if (hours > 0) res.push(`${hours}小时`);
  if (mins > 0 || res.length === 0) res.push(`${mins}分钟`);
  return res.join('');
};

export const sortRoomsByNumber = (roomA, roomB) => {
  const a = roomA || '';
  const b = roomB || '';
  const matchA = a.match(/([^\d]*)(\d+)/);
  const matchB = b.match(/([^\d]*)(\d+)/);
  if (matchA && matchB) {
    if (matchA[1] !== matchB[1]) return matchA[1].localeCompare(matchB[1]);
    return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
  }
  return a.localeCompare(b);
};

export const fieldLabels = {
  area: '建筑面积', delivery_standard: '交房标准', owner_name: '业主姓名',
  age: '年龄', gender: '性别', phone: '手机号', wechat: '微信号', occupation: '职业',
  political_status: '政治面貌', is_resident: '是否常住', pets: '宠物情况',
  car_plate: '车牌号', is_new_energy: '新能源车', use_charging_pile: '使用充电桩',
  ebike_count: '电动车', tricycle_count: '三轮车', stroller_count: '儿童车',
  contact_person: '对接人', relationship: '关系', contact_phone: '对接电话',
  payer: '缴费人', payment_method: '缴费方式', payment_cycle: '缴费周期',
  payment_date: '缴费日期',
  activity_frequency: '活动频次', activity_type: '参与活动类型',
  customer_level: '客户等级', opinion_tags: '舆论标签', negative_info: '负向/敏感信息'
};

export const formatVal = (val, key) => {
  if (val === true || (val === 1 && key && key.startsWith('is_'))) return '是';
  if (val === false || (val === 0 && key && key.startsWith('is_'))) return '否';
  if (val === null || val === undefined || val === '') return '无';
  return String(val);
};