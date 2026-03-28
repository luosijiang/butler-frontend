import React, { useState } from 'react';
import { FileText, User, Car, DollarSign, Sparkles, Wrench, Plus, Trash2, Loader2, CheckCircle, AlertTriangle, Activity, Edit, Search } from 'lucide-react';
import request from './utils/request';

const SectionHeader = ({ icon, title, subtitle }) => {
  const Icon = icon;
  return (
    <div className="flex items-start gap-4 mb-5">
      <div className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center text-[#007AFF] shadow-sm border border-white/60">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#1d1d1f]">{title}</h3>
        <p className="text-sm text-[#86868b]">{subtitle}</p>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm font-semibold text-[#424245] mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
    />
  </div>
);

const ToggleSwitch = ({ label, name, checked, onChange }) => (
    <div className="flex items-center justify-between bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
      <label className="text-sm font-semibold text-[#424245]">{label}</label>
      <button
        type="button"
        onClick={() => onChange({ target: { name, checked: !checked, type: 'checkbox' } })}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-[#007AFF]' : 'bg-gray-300'}`}
      >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
);


export default function OwnerRecordForm({ onUpdate, initialData, onClearEdit }) {
  const initialFormData = {
    building_room: '',
    area: '',
    delivery_standard: '毛坯',
    owner_name: '',
    occupation: '',
    age: '',
    gender: '男',
    phone: '',
    wechat: '',
    political_status: '群众',
    is_resident: true,
    pets: '',
    car_plate: '',
    is_new_energy: false,
    use_charging_pile: false,
    ebike_count: 0,
    tricycle_count: 0,
    stroller_count: 0,
    contact_person: '',
    relationship: '本人',
    contact_phone: '',
    payer: '',
    payment_method: '微信',
    payment_cycle: '按年',
    payment_date: '',
    activity_frequency: '',
    activity_type: '',
    // --- 核心修改：客户等级默认为 C ---
    customer_level: 'C',
    opinion_tags: '',
    negative_info: '',
    repair_history: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [buildingZone, setBuildingZone] = useState('A');
  const [roomNum, setRoomNum] = useState('');

  // --- 核心新增：监听编辑数据传入，自动反填表单 ---
  React.useEffect(() => {
    if (initialData) {
      const mappedData = { ...initialFormData };
      Object.keys(initialFormData).forEach(key => {
        if (initialData[key] !== undefined && initialData[key] !== null) {
          if (typeof initialFormData[key] === 'boolean') {
            mappedData[key] = !!initialData[key];
          } else {
            mappedData[key] = initialData[key];
          }
        }
      });
      // 编辑档案时不自动带入报修历史记录，以免重复提交
      mappedData.repair_history = [];
      setFormData(mappedData);
      
      const parts = (initialData.building_room || '').split('-');
      if (parts.length >= 2) {
        setBuildingZone(parts[0]);
        setRoomNum(parts.slice(1).join('-'));
      }
    } else {
      setFormData(initialFormData);
      setBuildingZone('A');
      setRoomNum('');
    }
  }, [initialData]);

  // --- 新增：在录入界面通过房号一键拉取档案，实现快速更改 ---
  const fetchExistingRecord = async () => {
    const finalBuildingRoom = roomNum.trim() ? `${buildingZone}-${roomNum.trim()}` : '';
    if (!finalBuildingRoom) {
      setMessage({ type: 'error', text: '请先填写需要修改的房号' });
      return;
    }
    setIsLoading(true);
    try {
      const data = await request.get(`/api/records/${encodeURIComponent(finalBuildingRoom)}`);
      
      const mappedData = { ...initialFormData };
      Object.keys(initialFormData).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          mappedData[key] = typeof initialFormData[key] === 'boolean' ? !!data[key] : data[key];
        }
      });
      mappedData.repair_history = [];
      setFormData(mappedData);
      setMessage({ type: 'success', text: `已成功调出 ${finalBuildingRoom} 的档案，请直接修改并在底部保存。` });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        window.alert(`未找到 ${finalBuildingRoom} 的已有档案，该住户为空。\n\n您可以直接在下方填入信息进行首次录入。`);
        setMessage({ type: 'success', text: `未找到 ${finalBuildingRoom} 的档案，您可以直接录入新档案。` });
        return;
      }
      setMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRepairChange = (index, e) => {
    const { name, value } = e.target;
    const newRepairs = [...formData.repair_history];
    newRepairs[index][name] = value;
    setFormData(prev => ({ ...prev, repair_history: newRepairs }));
  };

  const addRepair = () => {
    // 修复：获取带有时区偏移的正确本地时间，不再是 UTC 0时区时间
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const localDatetime = now.toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      repair_history: [...prev.repair_history, { report_time: localDatetime, item: '', handler: '', status: '处理中' }]
    }));
  };

  const removeRepair = (index) => {
    const newRepairs = formData.repair_history.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, repair_history: newRepairs }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalBuildingRoom = roomNum.trim() ? `${buildingZone}-${roomNum.trim()}` : '';
    if (!finalBuildingRoom) {
      setMessage({ type: 'error', text: '房号是必填项，请填写具体房号后再提交。' });
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // 修复：在提交给后端前，将带有 'T' 字符的时间格式清洗为空格
    const payload = {
      ...formData,
      building_room: finalBuildingRoom,
      repair_history: formData.repair_history.map(r => ({
        ...r,
        report_time: (r.report_time || '').replace('T', ' ')
      }))
    };

    // 💡 核心防御：清理数字字段，避免向后端发送空字符串引发 422 类型校验错误
    const numericFields = ['area', 'age', 'ebike_count', 'tricycle_count', 'stroller_count'];
    numericFields.forEach(field => {
      if (payload[field] === '') {
        payload[field] = 0;
      } else {
        payload[field] = Number(payload[field]);
      }
    });

    try {
      const responseData = await request.post('/api/records', payload);

      if (responseData.status === 'no-change') {
        setMessage({ type: 'error', text: responseData.message });
      } else {
        setMessage({ type: 'success', text: '档案已成功录入/更新！' });
        setFormData(initialFormData); // 清空表单
        setBuildingZone('A'); // 重置楼栋
        setRoomNum('');       // 重置房号
        if (onUpdate) onUpdate(); // 触发 App.jsx 的数据刷新
        if (onClearEdit) onClearEdit(); // 提交成功后清除编辑状态，返回新建模式

        // 延迟 1 秒后自动平滑滚动回容器顶部，方便直接进行下一次填写
        setTimeout(() => {
          document.getElementById('main-scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1000);
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || error.message });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {initialData && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-5 py-3.5 rounded-2xl text-sm font-medium flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2"><Edit className="w-4 h-4"/> 正在修改业主档案：<span className="font-bold">{initialData.building_room}</span></span>
            <button type="button" onClick={() => { if(onClearEdit) onClearEdit(); }} className="text-orange-500 hover:text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors font-semibold">取消修改</button>
          </div>
        )}

        {/* 房产基础信息 */}
        <fieldset>
          <SectionHeader icon={FileText} title="房产基础信息" subtitle="关于房屋本身的基础数据" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#424245] mb-2">房号 (必填)</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-1">
                  <select
                    value={buildingZone}
                    onChange={(e) => setBuildingZone(e.target.value)}
                    className="w-24 sm:w-1/3 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                  >
                    <option value="A">A 栋</option>
                    <option value="B">B 栋</option>
                    <option value="C">C 栋</option>
                    <option value="D">D 栋</option>
                  </select>
                  <input
                    type="text"
                    value={roomNum}
                    onChange={(e) => setRoomNum(e.target.value)}
                    placeholder="例如：101"
                    className="flex-1 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchExistingRecord}
                  disabled={!roomNum.trim() || isLoading}
                  className="sm:w-auto w-full px-5 py-3 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  检索并调出档案
                </button>
              </div>
              <p className="text-[11px] text-[#86868b] mt-2 ml-1">💡 提示：输入房号后点击检索，可一键调出已有档案进行快速修改。</p>
            </div>
            <InputField label="建筑面积 (㎡)" name="area" value={formData.area} onChange={handleChange} placeholder="例如：120.5" type="number" />
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">交房标准</label>
              <select
                name="delivery_standard"
                value={formData.delivery_standard}
                onChange={handleChange}
                className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              >
                <option value="毛坯">毛坯</option>
                <option value="简装">简装</option>
                <option value="精装">精装</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* 业主基础信息 */}
        <fieldset>
          <SectionHeader icon={User} title="业主基础信息" subtitle="业主或家庭成员的个人情况" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="业主姓名" name="owner_name" value={formData.owner_name} onChange={handleChange} placeholder="输入业主姓名" />
            <InputField label="手机号" name="phone" value={formData.phone} onChange={handleChange} placeholder="输入联系电话" />
            <InputField label="职业" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="例如：教师 / 医生 / 自由职业" />
            <InputField label="年龄" name="age" value={formData.age} onChange={handleChange} type="number" />
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">性别</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <option>男</option>
                <option>女</option>
              </select>
            </div>
            <InputField label="政治面貌" name="political_status" value={formData.political_status} onChange={handleChange} placeholder="例如：党员 / 群众" />
            <ToggleSwitch label="是否常住" name="is_resident" checked={formData.is_resident} onChange={handleChange} />
          </div>
        </fieldset>

        {/* 生活与车辆 */}
        <fieldset>
          <SectionHeader icon={Car} title="生活与车辆" subtitle="家庭生活习惯及车辆信息" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="宠物情况" name="pets" value={formData.pets} onChange={handleChange} placeholder="例如：金毛犬一只" />
            <InputField label="车牌号" name="car_plate" value={formData.car_plate} onChange={handleChange} placeholder="例如：京A88888" />
            <ToggleSwitch label="是否新能源车" name="is_new_energy" checked={formData.is_new_energy} onChange={handleChange} />
            <InputField label="电动车数量" name="ebike_count" value={formData.ebike_count} onChange={handleChange} type="number" />
            <InputField label="三轮车数量" name="tricycle_count" value={formData.tricycle_count} onChange={handleChange} type="number" />
            <InputField label="儿童车数量" name="stroller_count" value={formData.stroller_count} onChange={handleChange} type="number" />
          </div>
        </fieldset>

        {/* 对接与财务 */}
        <fieldset>
          <SectionHeader icon={DollarSign} title="对接与财务" subtitle="日常对接人与物业缴费信息" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="平时对接人" name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="输入对接人姓名" />
            <InputField label="与业主关系" name="relationship" value={formData.relationship} onChange={handleChange} placeholder="例如：本人 / 亲属 / 租客" />
            <InputField label="联系方式" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="输入对接人电话" />
            <InputField label="缴费人" name="payer" value={formData.payer} onChange={handleChange} placeholder="输入缴费人姓名" />
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">缴费方式</label>
              <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <option>微信</option>
                <option>支付宝</option>
                <option>银行卡</option>
                <option>现金</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">缴费周期</label>
              <select name="payment_cycle" value={formData.payment_cycle} onChange={handleChange} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <option>按月</option>
                <option>按季</option>
                <option>按半年</option>
                <option>按年</option>
              </select>
            </div>
            <InputField label="缴费日期" name="payment_date" value={formData.payment_date} onChange={handleChange} type="date" />
          </div>
        </fieldset>

        {/* 社区活动参与 */}
        <fieldset>
          <SectionHeader icon={Activity} title="社区活动参与" subtitle="业主参与社区活动的频次与偏好" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">参与频次</label>
              <select name="activity_frequency" value={formData.activity_frequency} onChange={handleChange} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <option value="">未选择</option>
                <option>经常</option>
                <option>偶尔</option>
                <option>从不</option>
              </select>
            </div>
            <InputField label="参与活动类型" name="activity_type" value={formData.activity_type} onChange={handleChange} placeholder="例如：亲子活动、节日晚会" />
          </div>
        </fieldset>

        {/* 客户画像 */}
        <fieldset>
          <SectionHeader icon={Sparkles} title="客户画像" subtitle="用于定义客户价值与沟通策略" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">客户等级</label>
              {/* --- 核心修改：客户等级选项已更新为 S/A/B/C --- */}
              <select
                name="customer_level"
                value={formData.customer_level}
                onChange={handleChange}
                className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              >
                <option value="S">S - 核心价值</option>
                <option value="A">A - 重点关注</option>
                <option value="B">B - 潜力客户</option>
                <option value="C">C - 普通客户</option>
              </select>
            </div>
            <InputField label="舆论标签" name="opinion_tags" value={formData.opinion_tags} onChange={handleChange} placeholder="例如：社区活跃分子、意见领袖" />
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-red-600 mb-2">负向/敏感信息</label>
              <textarea
                name="negative_info"
                value={formData.negative_info}
                onChange={handleChange}
                rows="3"
                placeholder="记录任何需要特别注意的负面或敏感信息..."
                className="w-full bg-red-50/30 backdrop-blur-md border border-red-200/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white transition-all text-base sm:text-sm text-red-800 placeholder:text-red-400 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>
        </fieldset>

        {/* 报修记录 */}
        <fieldset>
          <SectionHeader icon={Wrench} title="关联报修记录" subtitle="可同时录入该业主的历史或当前报修工单" />
          <div className="space-y-4">
            {formData.repair_history.map((repair, index) => (
              <div key={index} className="bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <InputField label="报修时间" name="report_time" value={repair.report_time} onChange={(e) => handleRepairChange(index, e)} type="datetime-local" />
                <InputField label="报修项目" name="item" value={repair.item} onChange={(e) => handleRepairChange(index, e)} placeholder="例如：客厅灯不亮" />
                <InputField label="接单人 (维修人)" name="handler" value={repair.handler} onChange={(e) => handleRepairChange(index, e)} placeholder="例如：张师傅" />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#424245] mb-2">状态</label>
                    <select name="status" value={repair.status} onChange={(e) => handleRepairChange(index, e)} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                      <option>处理中</option>
                      <option>已完成</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => removeRepair(index)} className="p-3 text-red-500 hover:bg-red-100 rounded-xl transition-colors h-[46px] mt-auto mb-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addRepair} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#007AFF]/30 text-[#007AFF] hover:bg-[#007AFF]/10 rounded-xl py-3 transition-colors font-medium">
              <Plus className="w-4 h-4" /> 添加一条报修记录
            </button>
          </div>
        </fieldset>

        {/* 提交按钮和消息提示 */}
        <div className="pt-6 border-t border-black/5 flex flex-col items-center">
          {message.text && (
            <div className={`mb-4 w-full max-w-md text-center p-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full max-w-xs bg-gradient-to-r from-[#007AFF] to-[#0051e3] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isLoading ? '正在提交...' : (initialData ? '保存修改' : '确认录入')}
          </button>
        </div>
      </form>
    </div>
  );
}