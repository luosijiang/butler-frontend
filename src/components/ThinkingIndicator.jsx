import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';

export default function ThinkingIndicator({ targetRoom }) {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const texts = [
    "初始化神经推理引擎...",
    "建立多维语义关联矩阵...",
    "提取历史上下文与快照...",
    "匹配《非暴力沟通(NVC)》语料...",
    "注入物业领域知识图谱...",
    "正在推演负向情绪边界...",
    "生成降冲突话术拓扑树...",
    "深度检索相似工单案例...",
    "优化最终输出语义连贯性...",
    "模型解算完成，生成响应流..."
  ];

  useEffect(() => {
    const textTimer = setInterval(() => { setTextIndex(prev => (prev + 1) % texts.length); }, 800);
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99;
        const remaining = 99 - prev;
        const increment = Math.max(0.5, remaining * (Math.random() * 0.1 + 0.05));
        return prev + increment;
      });
    }, 350);

    return () => { clearInterval(textTimer); clearInterval(progressTimer); };
  }, []);

  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-500 mb-2 max-w-[85%] sm:max-w-[75%]">
      <div className="relative mr-3 shrink-0 mt-1">
        <div className="absolute inset-0 bg-[#007AFF] rounded-full blur-md animate-pulse opacity-40"></div>
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#007AFF] to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,122,255,0.4)] border border-white/40">
          <Sparkles className="w-4 h-4 text-white" style={{ animation: 'spin 3s linear infinite' }} />
        </div>
      </div>

      <div className="relative bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgba(0,122,255,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] rounded-3xl rounded-bl-sm px-5 py-4 flex flex-col gap-3 min-w-[280px] sm:min-w-[320px] overflow-hidden group">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] pointer-events-none"></div>
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-[#007AFF] animate-spin" />
            <span className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-purple-600 uppercase">AI Processing</span>
          </div>
          <div className="text-[10px] font-mono font-bold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">{Math.floor(progress)}%</div>
        </div>
        <div className="bg-black/[0.03] rounded-xl p-3 border border-white/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden z-10">
          <div className="text-[12px] font-mono text-[#424245] flex flex-col gap-2">
            <div className="flex items-center gap-2 opacity-50"><CheckCircle className="w-3.5 h-3.5 text-[#34C759]" /><span className="truncate">载入 {targetRoom || '全局'} 知识图谱... [OK]</span></div>
            <div className="flex items-center gap-2">
              <span className="text-[#007AFF] animate-pulse w-3 text-center font-bold">❯</span> 
              <span key={textIndex} className="animate-in fade-in slide-in-from-right-2 duration-300 truncate text-[#1d1d1f] font-medium">{texts[textIndex]}</span>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden mt-1 relative z-10">
          <div className="h-full bg-gradient-to-r from-[#007AFF] via-purple-500 to-[#007AFF] rounded-full transition-all duration-300 ease-out bg-[length:200%_100%] animate-[gradientSweep_2s_linear_infinite]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}