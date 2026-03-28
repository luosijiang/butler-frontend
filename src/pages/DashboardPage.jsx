import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Users, Wrench, CheckCircle, Activity, Box, Zap } from 'lucide-react';
import request from '../utils/request';

// 自定义数字跳动引擎：利用 requestAnimationFrame 实现平滑的 ease-out 缓动动画
const AnimatedCounter = ({ value, suffix = "", duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId;
    const target = Number(value) || 0;
    if (target === 0) return;
    
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Cubic Ease-Out 缓动公式：让数字滚动先快后慢，自然刹车
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutProgress * target));
      if (progress < 1) animationFrameId = requestAnimationFrame(step);
      else setCount(target);
    };
    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <>{count}{suffix}</>;
};

const Building3D = ({ label, height, color, delay, data }) => (
  <div className="relative z-10 hover:z-50 group cursor-pointer" style={{ width: '48px', height: '48px', transformStyle: 'preserve-3d' }}>
    
    {/* 基础容器：彻底去除了无限上下浮动动画，稳定立于地面 */}
    <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* 交互悬浮层：仅在鼠标移入时稳定地沿 Z 轴抬升 */}
      <div className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[transform:translateZ(16px)]" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* 悬浮数据舱 HUD */}
        <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0a0f18]/90 backdrop-blur-xl border text-white px-4 py-3 rounded-2xl whitespace-nowrap shadow-[0_20px_40px_rgba(0,0,0,0.8)] pointer-events-none z-50 flex flex-col gap-2 min-w-[150px]"
             style={{
               top: 0, left: 0,
               borderColor: color,
               boxShadow: `0 20px 40px rgba(0,0,0,0.8), 0 0 20px ${color}50`,
               transform: `translateX(24px) translateY(24px) translateZ(${height + 60}px) rotateZ(45deg) rotateX(-65deg) translate(-50%, -60%)`
             }}>
          <div className="font-black tracking-widest text-[13px] uppercase flex items-center gap-1.5 pb-2 border-b border-white/10" style={{ color }}><Zap className="w-3.5 h-3.5"/> {label} 数据舱</div>
          <div className="flex justify-between items-center text-[11px] text-white/70">今日报修: <span className="text-white font-mono font-bold ml-3">{data?.today_repairs || 0} 笔</span></div>
          <div className="flex justify-between items-center text-[11px] text-white/70">本月工单: <span className="text-white font-mono font-bold ml-3">{data?.month_repairs || 0} 笔</span></div>
          <div className="flex justify-between items-center text-[11px] text-white/70">本月缴费: <span className="text-[#34C759] font-mono font-bold ml-3">¥{(data?.month_payments || 0).toFixed(2)}</span></div>
        </div>

        {/* 1. 楼宇顶面 (Roof, Z = height) */}
        <div className="absolute top-0 left-0 w-[48px] h-[48px] brightness-[1.3] border-[1px] border-white/40 flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.3)] overflow-hidden"
             style={{ backgroundColor: color, transform: `translateZ(${height}px)` }}>
           <span className="text-white/90 font-black text-xs block drop-shadow-md" style={{ transform: 'rotate(45deg)' }}>{label}</span>
           <div className="absolute inset-1 border border-white/20"></div>
        </div>
        
        {/* 2. 楼宇正面 (Front Wall, +Y轴)：向日受光面 */}
        <div className="absolute top-0 left-0 w-[48px] brightness-[1.1] border-x border-t border-white/20 overflow-hidden"
             style={{
               height: `${height}px`, backgroundColor: color,
               transform: `translateY(${48 - height/2}px) translateZ(${height/2}px) rotateX(-90deg) rotateY(180deg)`
             }}>
           <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.5) 2px, transparent 2px), linear-gradient(to bottom, rgba(0,0,0,0.5) 2px, transparent 2px)', backgroundSize: '8px 8px' }}></div>
           <div className="absolute bottom-0 w-full h-[80%] bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        {/* 3. 楼宇背面 (Back Wall, -Y轴)：全闭合新增 */}
        <div className="absolute top-0 left-0 w-[48px] brightness-[0.5] border-x border-t border-black/40 overflow-hidden"
             style={{
               height: `${height}px`, backgroundColor: color,
               transform: `translateY(${-height/2}px) translateZ(${height/2}px) rotateX(-90deg) rotateY(0deg)`
             }}>
           <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.8) 2px, transparent 2px), linear-gradient(to bottom, rgba(0,0,0,0.8) 2px, transparent 2px)', backgroundSize: '8px 8px' }}></div>
           <div className="absolute bottom-0 w-full h-[80%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        </div>

        {/* 4. 楼宇右面 (Right Wall, +X轴)：右侧阴影面 */}
        <div className="absolute top-0 left-0 w-[48px] brightness-[0.75] border-x border-t border-black/30 overflow-hidden"
             style={{
               height: `${height}px`, backgroundColor: color,
               transform: `translateX(24px) translateY(${24 - height/2}px) translateZ(${height/2}px) rotateX(-90deg) rotateY(90deg)`
             }}>
           <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.6) 2px, transparent 2px), linear-gradient(to bottom, rgba(0,0,0,0.6) 2px, transparent 2px)', backgroundSize: '8px 8px' }}></div>
           <div className="absolute bottom-0 w-full h-[80%] bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        </div>

        {/* 5. 楼宇左面 (Left Wall, -X轴)：全闭合新增 */}
        <div className="absolute top-0 left-0 w-[48px] brightness-[0.6] border-x border-t border-black/40 overflow-hidden"
             style={{
               height: `${height}px`, backgroundColor: color,
               transform: `translateX(-24px) translateY(${24 - height/2}px) translateZ(${height/2}px) rotateX(-90deg) rotateY(-90deg)`
             }}>
           <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.8) 2px, transparent 2px), linear-gradient(to bottom, rgba(0,0,0,0.8) 2px, transparent 2px)', backgroundSize: '8px 8px' }}></div>
           <div className="absolute bottom-0 w-full h-[80%] bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        </div>

      </div>
    </div>
    
    {/* 底部全息光晕影子：稳定贴附于地面 */}
    <div className="absolute top-0 left-0 w-[48px] h-[48px] blur-[16px] opacity-60 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" style={{ backgroundColor: color, transform: 'translateZ(-1px) scale(1.4)' }}></div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await request.get('/api/stats/overview');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const completionPercentage = stats ? (stats.completed / (stats.pending + stats.completed) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in duration-500">
      <style>
        {`
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(800%); }
          }
        `}
      </style>
      <div className="bg-white/40 backdrop-blur-[40px] rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden transition-all duration-500">
        <div className="p-5 sm:p-6 border-b border-white/50 bg-white/30">
          <h2 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F2F2F7] rounded-xl flex items-center justify-center text-[#1d1d1f]">
              <FileText className="w-5 h-5" />
            </div>
            数据看板总览
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="text-center text-[#86868b] py-10 col-span-full flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> 正在加载数据...
            </div>
          ) : error ? (
            <div className="text-red-500 text-center col-span-full">Error: {error}</div>
          ) : (
            <>
              {/* ================= 极客风 3D 楼宇数字孪生大屏 ================= */}
              <div className="col-span-full relative w-full h-[500px] sm:h-[580px] bg-[#050B14] rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.15)] border border-slate-700/80 flex flex-col justify-end items-center group">
                {/* 赛博网格地面 */}
                <div className="absolute bottom-[-100px] w-[250%] h-[350px] bg-[linear-gradient(to_right,rgba(0,122,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,122,255,0.15)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_100%,#000_80%,transparent_100%)] transition-all duration-1000 group-hover:scale-105" style={{ transform: 'rotateX(65deg) translateY(50px)' }}></div>
                
                {/* 扫描线动画 */}
                <div className="absolute inset-0 w-full h-10 bg-gradient-to-b from-transparent via-[#007AFF]/20 to-transparent blur-sm animate-[scanline_6s_linear_infinite] z-0 pointer-events-none"></div>

                {/* 顶部标题 HUD */}
                <div className="absolute top-6 left-6 sm:left-8 flex items-center gap-3.5 z-20">
                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007AFF]/30 to-purple-500/20 border border-[#007AFF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,122,255,0.2)]"><Activity className="w-6 h-6 text-blue-400"/></div>
                   <div>
                     <h3 className="text-white font-black tracking-widest text-lg sm:text-xl drop-shadow-md">DIGITAL TWIN</h3>
                     <p className="text-[#007AFF] text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] font-semibold mt-0.5">Real-time Estate Matrix</p>
                   </div>
                </div>

                {/* 3D 城市矩阵容器 */}
                <div className="relative pb-[60px] sm:pb-[100px] pt-24 perspective-[2000px] z-10 w-full flex justify-center mt-12">
                  {/* 真正的 CSS 3D 等距投影底盘 */}
                  <div className="flex gap-10 sm:gap-20" style={{ transform: 'rotateX(65deg) rotateZ(-45deg)', transformStyle: 'preserve-3d' }}>
                     <Building3D label="A栋" height={210} color="#2563eb" delay={0} data={stats?.building_stats?.A} />
                     <Building3D label="B栋" height={140} color="#9333ea" delay={0.2} data={stats?.building_stats?.B} />
                     <Building3D label="C栋" height={250} color="#059669" delay={0.4} data={stats?.building_stats?.C} />
                     <Building3D label="D栋" height={170} color="#ea580c" delay={0.6} data={stats?.building_stats?.D} />
                  </div>
                </div>
              </div>

              {/* 总人数 */}
              <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-white/60 flex items-center gap-4 hover:bg-white/90 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#1d1d1f]">
                    <AnimatedCounter value={stats.pending + stats.completed} />
                  </div>
                  <div className="text-sm text-[#86868b]">总人数</div>
                </div>
              </div>

              {/* 待处理工单 */}
              <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-white/60 flex items-center gap-4 hover:bg-white/90 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#1d1d1f]">
                    <AnimatedCounter value={stats.pending} />
                  </div>
                  <div className="text-sm text-[#86868b]">待处理工单</div>
                </div>
              </div>

              {/* 收缴率 */}
              <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-white/60 flex items-center gap-4 hover:bg-white/90 transition-colors">
                
                <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                  {/* 原生 SVG 环形进度条，彻底抛弃外部依赖 */}
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path className="text-black/5" strokeWidth="3" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-[#34C759] drop-shadow-sm" strokeDasharray={`${completionPercentage || 0}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#1d1d1f]">
                    <AnimatedCounter value={completionPercentage.toFixed(0)} suffix="%" />
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-[#1d1d1f]">
                    <AnimatedCounter value={completionPercentage.toFixed(0)} suffix="%" />
                  </div>
                  <div className="text-sm text-[#86868b]">收缴率</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
