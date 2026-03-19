import React, { useState } from 'react';
import { 
  Save, Plus, Trash2, User, Home, Car, Phone, 
  CreditCard, AlertTriangle, FileText, ClipboardList 
} from 'lucide-react';

// --- 注入全局高级表单动画样式 ---
const formPremiumStyles = `
  @keyframes formFadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .premium-input-box {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .premium-input-box:focus {
    background-color: #ffffff !important;
    border-color: #4F46E5 !important;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15), inset 0 1px 2px rgba(0,0,0,0.01) !important;
    transform: translateY(-1px);
  }
  .premium-input-box:hover:not(:focus) {
    background-color: rgba(255,255,255,0.9) !important;
  }
  .premium-btn-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .premium-btn-hover:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
  }
`;

// --- 样式组件 (移到组件外部定义，防止重新渲染导致输入框失去焦点) ---
const SectionTitle = ({ icon: Icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '16px', marginTop: '24px', color: '#333' }}>
    <Icon size={20} color="#4F46E5" />
    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{title}</h3>
  </div>
);

const FormGroup = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input 
    {...props} 
    className="premium-input-box"
    style={{ 
      width: '100%', boxSizing: 'border-box',
      padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', 
      backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)',
      fontSize: '0.95rem', outline: 'none',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
      ...props.style
    }} 
  />
);

const Select = (props) => (
  <select 
    {...props} 
    className="premium-input-box"
    style={{ 
      width: '100%', boxSizing: 'border-box',
      padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', 
      backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)',
      fontSize: '0.95rem', outline: 'none',
      ...props.style
    }}
  >
    {props.children}
  </select>
);

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px'
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export default function OwnerRecordForm({ onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 初始化状态，对应后端 FullProfileInput 模型
  const [formData, setFormData] = useState({
    // --- 房产基础 ---
    building_room: '',
    area: 0,
    delivery_standard: '毛坯',
    
    // --- 业主基础 ---
    owner_name: '',
    age: 0,
    gender: '男',
    phone: '',
    wechat: '',
    political_status: '群众',
    is_resident: false,
    
    // --- 生活与车辆 ---
    pets: '',
    car_plate: '',
    is_new_energy: false,
    use_charging_pile: false,
    ebike_count: 0,
    tricycle_count: 0,
    stroller_count: 0,
    
    // --- 对接与财务 ---
    contact_person: '',
    relationship: '本人',
    contact_phone: '',
    payer: '',
    payment_method: '微信',
    payment_cycle: '按年',
    
    // --- 客户画像 ---
    customer_level: '普通',
    opinion_tags: '',
    negative_info: '',
    
    // --- 报修记录 (列表) ---
    repair_history: []
  });

  // 通用输入处理
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;

    // 处理数值类型
    if (type === 'number') {
      finalValue = value === '' ? 0 : parseFloat(value);
    }
    // 处理布尔类型
    if (type === 'checkbox') {
      finalValue = checked;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  // 报修记录处理
  const handleRepairChange = (index, field, value) => {
    const newHistory = [...formData.repair_history];
    newHistory[index][field] = value;
    setFormData(prev => ({ ...prev, repair_history: newHistory }));
  };

  const addRepair = () => {
    setFormData(prev => ({
      ...prev,
      repair_history: [
        ...prev.repair_history,
        { 
          report_time: new Date().toISOString().split('T')[0], 
          item: '', 
          handler: '', 
          process_detail: '', 
          status: '处理中', 
          callback_result: '',
          completion_record: '',
          completion_time: ''
        }
      ]
    }));
  };

  const removeRepair = (index) => {
    const newHistory = formData.repair_history.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, repair_history: newHistory }));
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('butler_auth_token');
      if (!token) {
        throw new Error('未检测到登录凭证，请先登录');
      }

      const response = await fetch(`${API_BASE_URL}/api/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '提交失败');
      }

      setMessage({ text: '✅ 档案录入成功！', type: 'success' });
      if (onUpdate) onUpdate(); // 通知全局系统刷新右侧的工单待处理列表
      
      // 提交成功后平滑滚动回顶部，方便继续进行评估或下一次提交
      const scrollArea = document.getElementById('main-scroll-area');
      if (scrollArea) {
        scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error) {
      setMessage({ text: `❌ 错误: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      animation: 'formFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards', 
      maxWidth: '900px', margin: '0 auto', padding: '32px', 
      background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', 
      borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.8)', border: '1px solid rgba(255, 255, 255, 0.6)' 
    }}>
      <style>{formPremiumStyles}</style>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: '#111827' }}>
        📝 业主档案全维度录入
      </h1>

      {message.text && (
        <div style={{ 
          padding: '12px', marginBottom: '20px', borderRadius: '6px', 
          backgroundColor: message.type === 'error' ? '#FEE2E2' : '#D1FAE5',
          color: message.type === 'error' ? '#B91C1C' : '#065F46'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1. 房产基础 */}
        <SectionTitle icon={Home} title="房产基础信息" />
        <div style={gridStyle}>
          <FormGroup label="* 楼栋房号">
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <Select 
                value={(formData.building_room || '').split('-')[0] || 'A'}
                onChange={(e) => {
                  const parts = (formData.building_room || '').split('-');
                  const room = parts[1] || '';
                  setFormData(prev => ({ ...prev, building_room: `${e.target.value}-${room}` }));
                }}
                style={{ width: '85px', flexShrink: 0, padding: '10px 8px' }}
              >
                <option value="A">A栋</option>
                <option value="B">B栋</option>
                <option value="C">C栋</option>
                <option value="D">D栋</option>
              </Select>
              <Input 
                placeholder="房号 (如 101)" 
                value={(formData.building_room || '').split('-')[1] || ''}
                onChange={(e) => {
                  const parts = (formData.building_room || '').split('-');
                  const building = parts[0] || 'A';
                  setFormData(prev => ({ ...prev, building_room: `${building}-${e.target.value}` }));
                }}
                required
                style={{ flex: 1, minWidth: 0 }}
              />
            </div>
          </FormGroup>
          <FormGroup label="建筑面积 (㎡)">
            <Input type="number" name="area" value={formData.area} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="交房标准">
            <Select name="delivery_standard" value={formData.delivery_standard} onChange={handleChange}>
              <option value="毛坯">毛坯</option>
              <option value="简装">简装</option>
              <option value="精装">精装</option>
            </Select>
          </FormGroup>
        </div>

        {/* 2. 业主基础 */}
        <SectionTitle icon={User} title="业主基础信息" />
        <div style={gridStyle}>
          <FormGroup label="业主姓名">
            <Input name="owner_name" value={formData.owner_name} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="手机号">
            <Input name="phone" value={formData.phone} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="微信号">
            <Input name="wechat" value={formData.wechat} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="年龄">
            <Input type="number" name="age" value={formData.age} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="性别">
            <Select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="男">男</option>
              <option value="女">女</option>
            </Select>
          </FormGroup>
          <FormGroup label="政治面貌">
            <Select name="political_status" value={formData.political_status} onChange={handleChange}>
              <option value="群众">群众</option>
              <option value="中共党员">中共党员</option>
              <option value="中共预备党员">中共预备党员</option>
              <option value="共青团员">共青团员</option>
              <option value="民主党派">民主党派</option>
              <option value="无党派人士">无党派人士</option>
            </Select>
          </FormGroup>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input type="checkbox" name="is_resident" checked={formData.is_resident} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: '500' }}>是否常住 (自住)</span>
            </label>
          </div>
        </div>

        {/* 3. 生活与车辆 */}
        <SectionTitle icon={Car} title="车辆与生活设施" />
        <div style={gridStyle}>
          <FormGroup label="车牌号">
            <Input name="car_plate" value={formData.car_plate} onChange={handleChange} placeholder="苏A..." />
          </FormGroup>
          <FormGroup label="宠物情况">
            <Input name="pets" value={formData.pets} onChange={handleChange} placeholder="如：金毛一只" />
          </FormGroup>
          <FormGroup label="电动自行车数量">
            <Input type="number" name="ebike_count" value={formData.ebike_count} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="三轮车数量">
            <Input type="number" name="tricycle_count" value={formData.tricycle_count} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="儿童车数量">
            <Input type="number" name="stroller_count" value={formData.stroller_count} onChange={handleChange} />
          </FormGroup>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" name="is_new_energy" checked={formData.is_new_energy} onChange={handleChange} />
              <span>新能源车辆</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" name="use_charging_pile" checked={formData.use_charging_pile} onChange={handleChange} />
              <span>使用充电桩</span>
            </label>
          </div>
        </div>

        {/* 4. 对接与财务 */}
        <SectionTitle icon={Phone} title="对接与财务" />
        <div style={gridStyle}>
          <FormGroup label="平时对接人">
            <Input name="contact_person" value={formData.contact_person} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="关系">
            <Input name="relationship" value={formData.relationship} onChange={handleChange} placeholder="如：保姆、租客" />
          </FormGroup>
          <FormGroup label="对接电话">
            <Input name="contact_phone" value={formData.contact_phone} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="缴费人">
            <Input name="payer" value={formData.payer} onChange={handleChange} />
          </FormGroup>
          <FormGroup label="缴费周期">
            <Select name="payment_cycle" value={formData.payment_cycle} onChange={handleChange}>
              <option value="按月">按月</option>
              <option value="按季">按季</option>
              <option value="按年">按年</option>
            </Select>
          </FormGroup>
        </div>

        {/* 5. 客户画像 */}
        <SectionTitle icon={ClipboardList} title="客户画像管理" />
        <div style={{ ...gridStyle, gridTemplateColumns: '1fr 1fr' }}>
          <FormGroup label="客户等级">
            <Select name="customer_level" value={formData.customer_level} onChange={handleChange} style={{ width: '100%' }}>
              <option value="普通">普通</option>
              <option value="VIP">VIP</option>
              <option value="重点关注">重点关注</option>
              <option value="黑名单">黑名单</option>
            </Select>
          </FormGroup>
          <FormGroup label="舆论标签">
            <Input name="opinion_tags" value={formData.opinion_tags} onChange={handleChange} placeholder="如：爱投诉、喜静、养生" />
          </FormGroup>
        </div>
        <div style={{ marginTop: '16px' }}>
          <FormGroup label="⚠️ 负向/敏感信息 (慎填)">
            <textarea 
              name="negative_info" 
              value={formData.negative_info} 
              onChange={handleChange}
              rows={3}
              className="premium-input-box"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.95rem', backgroundColor: 'rgba(255,255,255,0.7)' }} 
            />
          </FormGroup>
        </div>

        {/* 6. 报事报修记录 */}
        <SectionTitle icon={AlertTriangle} title="历史报事/报修记录" />
        
        {formData.repair_history.map((item, index) => (
          <div key={index} style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #E5E7EB', position: 'relative' }}>
            <button 
              type="button" 
              onClick={() => removeRepair(index)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
            >
              <Trash2 size={18} />
            </button>
            <div style={gridStyle}>
              <FormGroup label="报事时间">
                <Input type="date" value={item.report_time} onChange={(e) => handleRepairChange(index, 'report_time', e.target.value)} />
              </FormGroup>
              <FormGroup label="报事项目">
                <Input value={item.item} onChange={(e) => handleRepairChange(index, 'item', e.target.value)} placeholder="如：漏水" />
              </FormGroup>
              <FormGroup label="接单人">
                <Input value={item.handler} onChange={(e) => handleRepairChange(index, 'handler', e.target.value)} />
              </FormGroup>
              <FormGroup label="状态">
                <Select value={item.status} onChange={(e) => handleRepairChange(index, 'status', e.target.value)}>
                  <option value="处理中">处理中</option>
                  <option value="已完成">已完成</option>
                </Select>
              </FormGroup>
              <FormGroup label="维修详情">
                <Input value={item.process_detail} onChange={(e) => handleRepairChange(index, 'process_detail', e.target.value)} />
              </FormGroup>
              <FormGroup label="完成记录">
                <Input value={item.completion_record} onChange={(e) => handleRepairChange(index, 'completion_record', e.target.value)} />
              </FormGroup>
              <FormGroup label="回访结果">
                <Input value={item.callback_result} onChange={(e) => handleRepairChange(index, 'callback_result', e.target.value)} />
              </FormGroup>
            </div>
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={addRepair}
          className="premium-btn-hover"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px dashed rgba(79, 70, 229, 0.4)', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', margin: '0 auto', marginBottom: '24px', fontWeight: '500' }}
        >
          <Plus size={18} /> 添加一条报修记录
        </button>

        {/* 提交按钮 */}
        <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button 
            type="submit" 
            disabled={loading}
            className="premium-btn-hover"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', 
              padding: '12px 40px', borderRadius: '8px', fontSize: '1rem', 
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Save size={20} />
            {loading ? '正在保存...' : '保存完整档案'}
          </button>
        </div>
      </form>
    </div>
  );
}