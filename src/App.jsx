import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Upload, User, CheckCircle, Sparkles, Lock, ArrowRight, 
  MessageSquare, Settings, LogOut, Plus, X, FileText, AlertTriangle, Search,
  Shield, Trash2, Loader2, Bell, Moon, PanelLeft, Wrench, Edit, Activity
} from 'lucide-react'; 
import ReactMarkdown from 'react-markdown';
import OwnerRecordForm from './OwnerRecordForm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 优先读取 Vercel 的环境变量，如果没有则回退到本地地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// --- 新增：工单历时计算辅助函数 ---
const calculateDuration = (start, end) => {
  if (!start || !end) return '';
  // 修复：将 'T' 转换为空格，再将 '-' 转换为 '/'，确保所有浏览器都能正确解析为 Date 对象
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

// --- 新增：房号自然排序辅助函数（先按字母比，字母相同按数字升序） ---
const sortRoomsByNumber = (roomA, roomB) => {
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

// --- 新增：富有科技感与深度思考文字的 AI 等待动画组件 ---
function ThinkingIndicator({ targetRoom }) {
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
    const textTimer = setInterval(() => {
      setTextIndex(prev => (prev + 1) % texts.length);
    }, 800);

    // 采用“渐进缓动（Asymptotic）”算法：根据剩余距离计算步长，越接近99%越慢，更加拟真
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99;
        const remaining = 99 - prev;
        // 每次前进剩余距离的 5%~15%，保底推进 0.5%，形成“起步快、后段极度平滑”的真实感
        const increment = Math.max(0.5, remaining * (Math.random() * 0.1 + 0.05));
        return prev + increment;
      });
    }, 350);

    return () => {
      clearInterval(textTimer);
      clearInterval(progressTimer);
    };
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
        {/* 核心增加：面板扫光动画 */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] pointer-events-none"></div>
        
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-[#007AFF] animate-spin" />
            <span className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-purple-600 uppercase">
              AI Processing
            </span>
          </div>
          <div className="text-[10px] font-mono font-bold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">
            {Math.floor(progress)}%
          </div>
        </div>

        <div className="bg-black/[0.03] rounded-xl p-3 border border-white/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden z-10">
          <div className="text-[12px] font-mono text-[#424245] flex flex-col gap-2">
            <div className="flex items-center gap-2 opacity-50">
              <CheckCircle className="w-3.5 h-3.5 text-[#34C759]" />
              <span className="truncate">载入 {targetRoom || '全局'} 知识图谱... [OK]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#007AFF] animate-pulse w-3 text-center font-bold">❯</span> 
              <span key={textIndex} className="animate-in fade-in slide-in-from-right-2 duration-300 truncate text-[#1d1d1f] font-medium">
                {texts[textIndex]}
              </span>
            </div>
          </div>
        </div>

        {/* 核心增加：动态科技渐变进度条 */}
        <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden mt-1 relative z-10">
          <div
            className="h-full bg-gradient-to-r from-[#007AFF] via-purple-500 to-[#007AFF] rounded-full transition-all duration-300 ease-out bg-[length:200%_100%] animate-[gradientSweep_2s_linear_infinite]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('butler_auth_token'));
  
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('butler_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return [{ 
      id: '1', 
      title: '新对话', 
      targetRoom: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [{ role: 'ai', content: '您好！我是专属档案分析引擎。请在上方搜索框检索并选中一位业主，我将为您进行深度画像分析并解答相关沟通问题。' }]
    }];
  });

  const [activeChatId, setActiveChatId] = useState(chatHistory[0].id);
  
  // 核心修改：智慧判斷初始螢幕寬度，手機端預設收起側邊欄
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 768 : true);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [messages, setMessages] = useState(chatHistory[0].messages);

  const [currentUser, setCurrentUser] = useState({
    name: localStorage.getItem('butler_username') || '物业管家',
    role: '高级物业顾问',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    pending: 12,
    completed: 5,
    recentPending: []
  });

  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('chat'); 
  const [targetRepairRoom, setTargetRepairRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // --- 新增：全域搜尋與目標房號狀態 ---
  const [globalSelectedRecord, setGlobalSelectedRecord] = useState(null);
  const [activeTargetRoom, setActiveTargetRoom] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchDropdown, setSearchDropdown] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showContextWarning, setShowContextWarning] = useState(false); // 新增：上下文超载警告状态
  const [systemStatus, setSystemStatus] = useState('checking'); // 新增：系统连接真实状态

  const checkSystemStatus = async (isManual = false) => {
    if (isManual) setSystemStatus('checking');
    const token = localStorage.getItem('butler_auth_token');
    if (!token) {
      setSystemStatus('expired');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/system/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        setSystemStatus('expired');
      } else if (!res.ok) {
        setSystemStatus('error');
      } else {
        setSystemStatus('normal');
      }
    } catch (err) {
      setSystemStatus('disconnected');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      checkSystemStatus();
      const interval = setInterval(() => checkSystemStatus(false), 30000); // 30秒真实心跳检测
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('butler_chat_history', JSON.stringify(chatHistory));
    
    const token = localStorage.getItem('butler_auth_token');
    // 核心修复：如果 AI 正在流式输出（isLoading），则暂停发送同步请求，防止瞬间并发大量请求导致 cpolar 阻断报错
    if (!isLoggedIn || !token || isLoading) return; 

    // ⚡ 核心提速与防御优化：只同步当前活跃的对话。避免随着历史增多，全量同步造成 JSON 体积过大，
    // 触发内网穿透代理 (cpolar) 的 Payload 限制，导致直接被掐断返回 CORS 和 HTTP2 报错。
    const activeChat = chatHistory.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/history/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify([activeChat])
      }).catch(err => console.error("自动保存失败:", err));
    }, 2000); // 增加防抖延迟到 2 秒，减轻内网穿透带宽压力

    return () => clearTimeout(timer);
  }, [chatHistory, isLoggedIn, isLoading, activeChatId]);

  useEffect(() => {
    setChatHistory(prev => prev.map(chat => 
      chat.id === activeChatId
        // 核心修复：保存时，将当前激活的 targetRoom 也一并存入该对话的历史中
        ? { ...chat, messages: messages, targetRoom: activeTargetRoom }
        : chat
    ));
  }, [messages, activeChatId, activeTargetRoom]);

  useEffect(() => {
    if (mode === 'chat') {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50); // 確保在頁面模式切換、DOM 渲染完成後才執行滾動
    }
  }, [messages, mode]);

  // 监听输入框内容变化，自动调整高度以展示多行文本
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  // --- 新增：核心全局数据刷新触发器 ---
  const fetchStats = async () => {
    const token = localStorage.getItem('butler_auth_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(prev => ({ 
          ...prev, 
          pending: data.pending ?? 0, 
          completed: data.completed ?? 0,
          recentPending: data.recent_pending || []
        }));
      }
    } catch (err) {
      console.error("获取统计数据失败:", err);
    }
  };

  // 当用户登录状态或切换左侧菜单时，自动拉取最新实时概览
  useEffect(() => {
    if (isLoggedIn) {
      fetchStats();
    }
  }, [isLoggedIn, mode]);

  const handleSwitchChat = (id) => {
    setMode('chat'); // 無論在哪個頁面，點擊對話記錄都強制切換回聊天室
    if (id === activeChatId) return;
    const targetChat = chatHistory.find(c => c.id === id);
    if (targetChat) {
      setActiveChatId(id);
      setMessages(targetChat.messages);
      setActiveTargetRoom(targetChat.targetRoom || ''); // 核心修复：切换对话时，同步切换上下文中的目标房号
      setShowContextWarning(false);
    }
  };

  const handleRecordSuccess = () => {
    setCurrentUser(prev => ({
      ...prev,
      completed: prev.completed + 1,
      pending: prev.pending > 0 ? prev.pending - 1 : 0
    }));
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation(); 
    
    setChatHistory(prev => {
      const newHistory = prev.filter(c => c.id !== id);
      
      if (newHistory.length === 0) {
        const newId = Date.now().toString();
        const newChat = {
          id: newId,
          title: '新对话',
          targetRoom: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: [{ role: 'ai', content: '您好！我是专属档案分析引擎。请在上方搜索框检索并选中一位业主，我将为您进行深度画像分析并解答相关沟通问题。' }]
        };
        setActiveChatId(newId);
        setMessages(newChat.messages);
        setShowContextWarning(false);
        return [newChat];
      } else if (id === activeChatId) {
        setActiveChatId(newHistory[0].id);
        setMessages(newHistory[0].messages);
      }
      return newHistory;
    });
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newChat = {
      id: newId,
      title: '新对话',
      targetRoom: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [{ role: 'ai', content: '您好！我是专属档案分析引擎。请在上方搜索框检索并选中一位业主，我将为您进行深度画像分析并解答相关沟通问题。' }]
    };
    setChatHistory([newChat, ...chatHistory]);
    setActiveChatId(newId);
    setMessages(newChat.messages);
    setActiveTargetRoom(''); // 核心修复：新建对话时，清空目标房号
    setShowContextWarning(false);
    setMode('chat'); // 新建對話時也強制切換回聊天室
  };

  // --- 新增：快捷操作 - 清理当前会话并新建 ---
  const handleClearAndNew = () => {
    setMode('chat');
    setChatHistory(prev => {
      const newHistory = prev.filter(c => c.id !== activeChatId);
      const newId = Date.now().toString();
      const newChat = {
        id: newId,
        title: '新对话',
        targetRoom: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [{ role: 'ai', content: '您好！我是专属档案分析引擎。请在上方搜索框检索并选中一位业主，我将为您进行深度画像分析并解答相关沟通问题。' }]
      };
      setActiveChatId(newId);
      setMessages(newChat.messages);
      setActiveTargetRoom('');
      setShowContextWarning(false);
      return [newChat, ...newHistory];
    });
  };

  const handleGlobalSearchChange = async (e) => {
    const val = e.target.value;
    setGlobalSearch(val);
    if (!val.trim()) {
      setShowSearchDropdown(false);
      return;
    }
    setShowSearchDropdown(true);
    setIsSearching(true);
    const token = localStorage.getItem('butler_auth_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/records/search?q=${encodeURIComponent(val)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchDropdown(data.records || []);
    } catch(err) { console.error(err) }
    setIsSearching(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    
    if (messages.length === 1 && messages[0].role === 'ai') {
      setChatHistory(prev => prev.map(chat => {
        if (chat.id === activeChatId && (chat.title === '新对话' || chat.title === 'New Chat')) {
          return { ...chat, title: userText.length > 12 ? userText.slice(0, 12) + '...' : userText };
        }
        return chat;
      }));
    }

    const newUserMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    let aiFullText = '';
    let hasStartedStreaming = false;

    try {
      const cleanHistory = messages.filter(m => !m.content.includes('<ui_form>'));
      const formData = new FormData();
      formData.append('mode', mode);
      formData.append('query', userText);
      formData.append('history', JSON.stringify(cleanHistory));
      formData.append('target_room', activeTargetRoom); // 傳遞目前選中的房號讓 AI 分析

      const token = localStorage.getItem('butler_auth_token');
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        throw new Error('登录凭证已失效，请重新登录。');
      }
      
      if (!response.ok) {
        let errDetail = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errDetail = errData.detail || errData.message || errDetail;
        } catch(e) {}
        throw new Error(`后端拒绝了请求: ${errDetail}`);
      }
      
      // --- 替换为流式读取逻辑 ---
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留未完全接收的最后一行
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              if (!dataStr) continue;
              
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.warning === 'context_limit') {
                  setShowContextWarning(true);
                }
                if (parsed.chunk !== undefined) {
                  aiFullText += parsed.chunk;
                  if (!hasStartedStreaming) {
                    hasStartedStreaming = true;
                    setIsLoading(false); // 收到首个字，隐去 Loading 动画
                    setMessages(prev => [...prev, { role: 'ai', content: aiFullText }]);
                  } else {
                    setMessages(prev => {
                      const newMsgs = [...prev];
                      newMsgs[newMsgs.length - 1] = { role: 'ai', content: aiFullText };
                      return newMsgs;
                    });
                  }
                }
              } catch (e) {
                if (e.name !== 'SyntaxError') throw e;
              }
            }
          }
        }
      }
      
      // 如果模型因為上下文過長等原因直接結束且沒有生成任何文字，提供優雅的防呆提示
      if (!hasStartedStreaming) {
        setMessages(prev => [...prev, { role: 'ai', content: '⚠️ **AI 引擎未能生成有效回復**\n可能是由於多輪對話導致上下文過長，模型自動中斷了生成。建議您點擊左側的【新建對話】來清理歷史記憶。' }]);
      }
      fetchStats();
      
    } catch (error) {
      console.error("请求失败:", error);
      if (!hasStartedStreaming) {
        setMessages(prev => [...prev, { role: 'ai', content: `⚠️ **请求异常**: ${error.message}` }]);
      } else {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'ai', content: aiFullText + `\n\n⚠️ **连接中断**: ${error.message}` };
          return newMsgs;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 新增：專門用於數據分析的 AI 請求處理函數 ---
  const handleAIAnalysis = async (room) => {
    // 1. 關閉詳情彈窗，並切換到對話模式
    const analysisGoal = `请结合档案，分析该业主目前的画像状态，并针对工单给予《非暴力沟通》的话术建议。`;
    
    // 2. 核心優化：為每次分析創建一個全新的、乾淨的對話，徹底重置上下文
    const newId = Date.now().toString();
    const userMsg = { role: 'user', content: `[AI 分析请求] 房号: ${room}\n\n**分析目标**:\n${analysisGoal}` };
    const newChat = {
      id: newId,
      title: `对 ${room} 的分析`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [userMsg],
      targetRoom: room
    };
    setChatHistory(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setMessages(newChat.messages);
    setGlobalSelectedRecord(null);
    setMode('chat');
    setActiveTargetRoom(room); // 绑定目标房号，确保后续追问带上数据
    setIsLoading(true);
    setShowContextWarning(false);
    
    let aiFullText = '';
    let hasStartedStreaming = false;

    try {
      const token = localStorage.getItem('butler_auth_token');
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          selected_rooms: [room], // 將房號作為陣列傳遞
          analysis_goal: analysisGoal
        })
      });

      if (!response.ok) throw new Error(`分析接口请求失败: HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let isStreamDone = false;
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
               isStreamDone = true;
               break;
            }
            if (!dataStr) continue;
            
            const parsed = JSON.parse(dataStr);
            if (parsed.chunk !== undefined) {
              aiFullText += parsed.chunk;
              if (!hasStartedStreaming) {
                hasStartedStreaming = true;
                setIsLoading(false);
                setMessages(prev => [...prev, { role: 'ai', content: aiFullText }]);
              } else {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = { role: 'ai', content: aiFullText };
                  return newMsgs;
                });
              }
            }
          }
        }
        if (isStreamDone) break;
      }
      
      if (!hasStartedStreaming) {
        setMessages(prev => [...prev, { role: 'ai', content: '⚠️ **AI 引擎未能生成有效回復**\n可能是檔案數據過長導致上下文超載。建議您點擊左側的【新建對話】清理歷史記憶。' }]);
      }
    } catch (error) {
      console.error("AI 分析失败:", error);
      if (!hasStartedStreaming) {
        setMessages(prev => [...prev, { role: 'ai', content: `⚠️ **分析中断**: ${error.message}` }]);
      } else {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'ai', content: aiFullText + `\n\n⚠️ **分析中断**: ${error.message}` };
          return newMsgs;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content, isUser, index) => {
    return (
      <div className="space-y-3 text-sm leading-relaxed">
        <ReactMarkdown 
          components={{
            h1: ({node, ...props}) => <h1 className={`text-xl font-bold mt-4 mb-2 ${isUser ? 'text-white' : 'text-slate-800'}`} {...props} />,
            h2: ({node, ...props}) => <h2 className={`text-lg font-bold mt-4 mb-2 ${isUser ? 'text-white' : 'text-slate-800'}`} {...props} />,
            h3: ({node, ...props}) => <h3 className={`text-base font-bold mt-3 mb-1 ${isUser ? 'text-blue-100' : 'text-blue-900'}`} {...props} />,
            h4: ({node, ...props}) => <h4 className={`text-sm font-bold mt-2 mb-1 ${isUser ? 'text-white' : 'text-slate-800'}`} {...props} />,
            p: ({node, ...props}) => <p className={`leading-relaxed ${isUser ? 'text-white/90' : 'text-slate-800'}`} {...props} />,
            ul: ({node, ...props}) => <ul className={`list-disc pl-5 space-y-1 ${isUser ? 'text-white/90' : 'text-slate-800'}`} {...props} />,
            ol: ({node, ...props}) => <ol className={`list-decimal pl-5 space-y-1 ${isUser ? 'text-white/90' : 'text-slate-800'}`} {...props} />,
            li: ({node, ...props}) => <li className="pl-1 marker:text-current" {...props} />,
            strong: ({node, ...props}) => <strong className={`font-bold px-1 py-0.5 rounded ${isUser ? 'text-white bg-white/20' : 'text-slate-900 bg-blue-50'}`} {...props} />,
            blockquote: ({node, ...props}) => <blockquote className={`border-l-4 pl-3 italic py-1 rounded-r-lg ${isUser ? 'border-white/50 text-white/80 bg-white/10' : 'border-blue-500 text-slate-500 bg-slate-50'}`} {...props} />,
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  children={String(children).replace(/\n$/, '')}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl my-3 text-[13px] shadow-md border border-white/10"
                />
              ) : (
                <code {...props} className={`${className || ''} ${isUser ? 'bg-white/20 text-white' : 'bg-black/5 text-[#007AFF]'} px-1.5 py-0.5 rounded-md font-mono text-[13px]`}>
                  {children}
                </code>
              )
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const handleLoginSuccess = (token, username) => {
    localStorage.setItem('butler_auth_token', token);
    if (username) localStorage.setItem('butler_username', username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('butler_auth_token');
    localStorage.removeItem('butler_username');
    setIsLoggedIn(false);
  };

  const handleAdminAuthSuccess = () => {
    setMode('admin');
    setShowAdminAuth(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="fixed inset-0 bg-slate-50 font-sans text-[#1d1d1f] selection:bg-[#007AFF]/20 overflow-hidden flex flex-col p-2 sm:p-4 md:p-6 z-0">
      {/* 新增：全局柔和過渡動畫樣式 */}
      <style>
        {`
          @keyframes softFadeIn {
               0% { opacity: 0; transform: translateY(24px) scale(0.98); filter: blur(8px); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
          .page-transition {
               animation: softFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-20px) translateX(20px) scale(1.05); }
          66% { transform: translateY(20px) translateX(-20px) scale(0.95); }
        }
        .animate-float-1 { animation: float 14s ease-in-out infinite; }
        .animate-float-2 { animation: float 18s ease-in-out infinite reverse; }
        .animate-float-3 { animation: float 22s ease-in-out infinite 2s; }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradientSweep {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
        `}
      </style>
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-400/40 to-teal-300/30 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-multiply animate-float-1" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-purple-500/40 to-pink-400/30 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-multiply animate-float-2" />
      <div className="fixed top-[20%] left-[20%] w-[40%] h-[40%] bg-gradient-to-tr from-indigo-400/30 to-blue-500/30 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-multiply animate-float-3" />
      
      {/* 核心修复：将 h-full 替换为 flex-1 min-h-0，强制卡片撑满父容器底部的剩余空间 */}
      <div className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto flex bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] rounded-2xl sm:rounded-[2.5rem] border border-white/50 overflow-hidden relative z-10">
      
      {/* 移動端專屬遮罩層 */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`${isSidebarOpen ? 'w-[280px] translate-x-0 opacity-100' : 'w-0 -translate-x-10 opacity-0 overflow-hidden'} bg-white/80 md:bg-white/40 backdrop-blur-2xl md:backdrop-blur-none border-r border-white/50 flex flex-col shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] absolute md:relative h-full z-40 shadow-[10px_0_40px_rgba(0,0,0,0.1)] md:shadow-none`}>
        <div className="p-5 flex items-center gap-3 font-semibold text-lg text-[#1d1d1f] tracking-tight pl-6">
           <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center shadow-sm">
             <Sparkles className="w-4 h-4" />
           </div>
           <span>Butler AI</span>
        </div>
        
        <div className="px-4 pb-2">
          <button 
            onClick={() => {
              handleNewChat();
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }} 
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gradient-to-b hover:from-white hover:to-blue-50 text-[#007AFF] border border-white/60 px-4 py-2.5 rounded-xl transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,122,255,0.15)] hover:-translate-y-0.5 font-medium text-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> 新建对话
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[11px] font-semibold text-[#86868b] px-3 mb-2 uppercase tracking-wider">History</div>
          {chatHistory.map((chat) => (
            <button 
              key={chat.id} 
              onClick={() => {
                handleSwitchChat(chat.id);
                if (window.innerWidth <= 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm truncate flex items-center gap-3 group transition-all duration-300 ${
                activeChatId === chat.id ? 'bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-white/60 text-[#1d1d1f] font-medium scale-100' : 'text-[#424245] hover:bg-white/40 hover:scale-[1.02] border border-transparent'
              }`}
            >
              <MessageSquare className={`w-4 h-4 transition-colors ${activeChatId === chat.id ? 'text-[#007AFF]' : 'text-[#86868b]'}`} />
              <div className="flex-1 min-w-0">
                <div className="truncate">{chat.title}</div>
                <div className="text-[10px] text-[#86868b] font-normal mt-0.5">{chat.timestamp}</div>
              </div>
              
              <div 
                onClick={(e) => handleDeleteChat(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] rounded-md transition-all cursor-pointer"
                title="删除此对话"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-black/5">
           <button 
             onClick={() => {
               setMode('chat');
               if (window.innerWidth <= 768) setIsSidebarOpen(false);
             }} 
             className={`flex items-center gap-3 text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full px-4 py-3 rounded-xl mb-1.5 ${mode === 'chat' ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] text-[#007AFF] font-bold border border-white/80 scale-[1.02] translate-x-1' : 'text-[#424245] hover:text-[#1d1d1f] hover:bg-white/50 hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:translate-x-1 border border-transparent'}`}
           >
             <MessageSquare className="w-4 h-4" /> AI 档案分析
           </button>
           <button 
             onClick={() => {
               setMode('upload');
               if (window.innerWidth <= 768) setIsSidebarOpen(false);
             }} 
             className={`flex items-center gap-3 text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full px-4 py-3 rounded-xl mb-1.5 ${mode === 'upload' ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] text-[#007AFF] font-bold border border-white/80 scale-[1.02] translate-x-1' : 'text-[#424245] hover:text-[#1d1d1f] hover:bg-white/50 hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:translate-x-1 border border-transparent'}`}
           >
             <Upload className="w-4 h-4" /> 信息录入
           </button>
           <button 
             onClick={() => {
               setTargetRepairRoom(null); // 点击侧边栏菜单时，重置目标房号展示总览列表
               setMode('repair_manage');
               if (window.innerWidth <= 768) setIsSidebarOpen(false);
             }} 
             className={`flex items-center gap-3 text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full px-4 py-3 rounded-xl mb-1.5 ${mode === 'repair_manage' ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] text-orange-600 font-bold border border-white/80 scale-[1.02] translate-x-1' : 'text-[#424245] hover:text-[#1d1d1f] hover:bg-white/50 hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:translate-x-1 border border-transparent'}`}
           >
             <Wrench className="w-4 h-4" /> 报修管理
           </button>
           <button 
             onClick={() => {
               setMode('owner_dynamics');
               if (window.innerWidth <= 768) setIsSidebarOpen(false);
             }} 
             className={`flex items-center gap-3 text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full px-4 py-3 rounded-xl mb-1.5 ${mode === 'owner_dynamics' ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] text-[#007AFF] font-bold border border-white/80 scale-[1.02] translate-x-1' : 'text-[#424245] hover:text-[#1d1d1f] hover:bg-white/50 hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:translate-x-1 border border-transparent'}`}
           >
             <Activity className="w-4 h-4" /> 业主动态
           </button>
           <button 
             onClick={() => {
               setShowAdminAuth(true);
               if (window.innerWidth <= 768) setIsSidebarOpen(false);
             }} 
             className={`flex items-center gap-3 text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full px-4 py-3 rounded-xl mb-1.5 ${mode === 'admin' ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] text-[#007AFF] font-bold border border-white/80 scale-[1.02] translate-x-1' : 'text-[#424245] hover:text-[#1d1d1f] hover:bg-white/50 hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:translate-x-1 border border-transparent'}`}
           >
             <FileText className="w-4 h-4" /> 后台记录
           </button>

           <div className="pt-2 mt-2 border-t border-black/5"></div>

           <button 
             onClick={() => setShowSettings(true)}
             className="flex items-center gap-3 text-sm text-[#424245] hover:text-[#1d1d1f] transition-all duration-300 w-full px-3 py-2.5 rounded-xl hover:bg-white/40 hover:translate-x-1"
           >
             <Settings className="w-4 h-4" /> 系统设置
           </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col relative bg-white/50 z-10">
        <header className="shrink-0 sm:h-16 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-0 border-b border-white/50 bg-white/40 backdrop-blur-xl z-20 transition-all shadow-sm gap-3 sm:gap-4">
           <div className="flex items-center justify-between w-full sm:w-auto gap-4">
             <div className="flex items-center gap-3 sm:gap-4">
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 sm:ml-0 rounded-lg hover:bg-black/5 transition-all text-[#1d1d1f] active:scale-95">
               <PanelLeft className="w-5 h-5" />
             </button>
               <span className="font-semibold text-[#1d1d1f] text-base sm:text-lg tracking-tight">
             {mode === 'chat' ? 'AI 档案分析' : mode === 'upload' ? '信息录入' : mode === 'repair_manage' ? '工单报修管理' : mode === 'owner_dynamics' ? '全局业主动态' : '后台记录管理'}
             </span>
             {mode === 'chat' && (
                 <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F2F2F7] text-[#86868b] text-[10px] font-medium tracking-wide uppercase">
                 Beta
               </span>
             )}
           </div>
           </div>
           
           {mode === 'chat' && (
             <div className="w-full sm:flex-1 max-w-2xl sm:mx-8 relative animate-in fade-in duration-300 z-50">
               <div className="relative flex items-center">
                 <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#007AFF] absolute left-3 sm:left-4" />
                 <input 
                   type="text" 
                   placeholder="搜索房号/姓名锁定业主..." 
                 className="w-full bg-white/60 backdrop-blur-2xl border border-white/80 hover:border-[#007AFF]/40 rounded-xl sm:rounded-full py-2 sm:py-2.5 pl-10 sm:pl-12 pr-4 text-sm sm:text-[15px] focus:outline-none focus:ring-4 focus:ring-[#007AFF]/15 focus:border-[#007AFF]/50 transition-all duration-500 ease-out shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8)] focus:shadow-[0_8px_24px_rgba(0,122,255,0.15)] font-medium text-[#1d1d1f] placeholder:text-[#86868b] placeholder:font-normal"
                   value={globalSearch}
                   onChange={handleGlobalSearchChange}
                   onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                   onFocus={() => { if (globalSearch) setShowSearchDropdown(true); }}
                 />
               </div>
               {showSearchDropdown && (
                 <div className="absolute top-full mt-2 sm:mt-3 w-full bg-white/95 backdrop-blur-2xl border border-[#007AFF]/10 shadow-[0_20px_60px_rgba(0,122,255,0.15)] rounded-2xl py-2 max-h-60 sm:max-h-72 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                   {isSearching ? (
                     <div className="px-4 py-4 text-sm text-[#007AFF] text-center flex items-center justify-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" /> 極速搜尋中...
                     </div>
                   ) : searchDropdown.length > 0 ? (
                     searchDropdown.map(r => (
                       <div key={r.building_room} className="px-5 py-3 hover:bg-[#007AFF]/10 cursor-pointer transition-colors border-b border-black/5 last:border-0" onClick={() => { setGlobalSearch(''); setShowSearchDropdown(false); setGlobalSelectedRecord(r); }}>
                         <div className="font-semibold text-[#1d1d1f] text-base">{r.building_room} <span className="text-sm text-[#86868b] ml-2 font-normal bg-[#F2F2F7] px-2 py-0.5 rounded-md">{r.owner_name}</span></div>
                       </div>
                     ))
                   ) : (
                     <div className="px-4 py-4 text-sm text-[#86868b] text-center">未找到相關檔案</div>
                   )}
                 </div>
               )}
             </div>
           )}
        </header>

        {/* 利用 key={mode} 强制 React 卸载并重新渲染，从而触发丝滑的出场动画 */}
        <div id="main-scroll-area" key={mode} className="page-transition flex-1 min-h-0 overflow-y-auto scroll-smooth z-0 relative">
          {mode === 'chat' ? (
            <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-2 space-y-6">
            {/* 核心新增：检测到上下文接近极限时的顶部警告提示 */}
            {showContextWarning && (
              <div className="flex items-center justify-between bg-orange-50/80 backdrop-blur-md border border-orange-200/60 text-orange-700 px-5 py-3.5 rounded-2xl mb-2 text-sm shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                  <span className="font-medium leading-relaxed">当前对话携带的历史数据过长，接近大模型记忆极限。<br/><span className="opacity-80 font-normal">继续对话可能导致 AI 响应缓慢、胡言乱语或截断错误，建议您清理会话。</span></span>
                </div>
                <button onClick={handleClearAndNew} className="shrink-0 ml-4 px-4 py-2 bg-white hover:bg-orange-100 rounded-xl border border-orange-200 shadow-sm transition-all active:scale-95 font-semibold text-orange-600">
                  清理并新建
                </button>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-[#F2F2F7] flex items-center justify-center mr-2 shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-[#86868b]"/>
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[75%] break-words px-5 py-3.5 rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] text-[15px] ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#007AFF] via-[#0062FF] to-[#0051e3] text-white rounded-br-sm shadow-[0_12px_32px_rgba(0,122,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_40px_rgba(0,122,255,0.4)] hover:-translate-y-1' 
                    : 'bg-white/70 backdrop-blur-2xl border border-white/80 text-[#1d1d1f] rounded-bl-sm shadow-[0_12px_40px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                }`}>
                  {renderMessageContent(msg.content, msg.role === 'user', idx)}
                </div>
                
              </div>
            ))}
            
            {isLoading && <ThinkingIndicator targetRoom={activeTargetRoom} />}
            <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : mode === 'upload' ? (
            <div className="p-4 sm:p-6">
              <OwnerRecordForm onUpdate={fetchStats} />
            </div>
          ) : mode === 'repair_manage' ? (
            <RepairManagePage onUpdate={fetchStats} initialRoom={targetRepairRoom} />
          ) : mode === 'owner_dynamics' ? (
            <OwnerDynamicsPage />
          ) : (
            <AdminPage onViewRecord={setGlobalSelectedRecord} />
          )}
        </div>

        {mode === 'chat' && (
        <footer className="shrink-0 px-2 pb-2 sm:px-6 sm:pb-6 max-w-3xl mx-auto w-full z-20 flex flex-col items-center">
          
          {/* 顯示目前關聯的目標房號 */}
          {activeTargetRoom && (
            <div className="w-full max-w-2xl bg-[#007AFF]/10 border border-[#007AFF]/20 px-4 py-2 rounded-t-2xl mb-[-12px] pb-4 flex items-center justify-between text-xs text-[#007AFF] animate-in slide-in-from-bottom-2">
              <span className="flex items-center gap-1.5 font-medium"><FileText className="w-3.5 h-3.5"/> 🧠 AI 已鎖定目標檔案：{activeTargetRoom}</span>
              <button onClick={() => setActiveTargetRoom('')} className="hover:bg-[#007AFF]/20 p-1 rounded-full transition-colors"><X className="w-3 h-3"/></button>
            </div>
          )}

          <div className="w-full bg-white/60 backdrop-blur-[40px] shadow-[0_16px_60px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.12)] border border-white/80 hover:border-white rounded-[2rem] p-2.5 flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:bg-white/80 focus-within:shadow-[0_32px_100px_rgba(0,122,255,0.2)] focus-within:border-[#007AFF]/30 relative z-10">
            {/* 核心修改：将毫无作用的加号按钮换成一键重置对话的垃圾桶按钮 */}
            <button 
              onClick={handleClearAndNew}
              title="销毁当前会话历史并开启新对话"
              className="p-2.5 text-[#86868b] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center group"
            >
              <Trash2 className="w-5 h-5 group-active:scale-90 transition-transform" />
            </button>
            
            <div className="flex-1 relative">
              <textarea 
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full bg-transparent border-none px-2 focus:ring-0 focus:outline-none resize-none max-h-32 overflow-y-auto text-[#1d1d1f] placeholder:text-[#86868b] text-[16px] sm:text-[15px] leading-5 pt-3 pb-2"
                placeholder={mode === 'chat' ? "请输入关于该业主的问题" : "输入您想要提取录入的信息..."}
                rows="1"
                style={{ minHeight: '20px' }}
              />
            </div>
            
            <button 
              onClick={handleSend} 
              disabled={!inputValue.trim() || isLoading}
              className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                isLoading 
                  ? 'bg-transparent text-[#007AFF] cursor-wait' 
                  : !inputValue.trim()
                    ? 'bg-transparent text-[#86868b] cursor-not-allowed' 
                    : 'bg-[#007AFF] text-white hover:bg-[#0071e3] active:scale-95 shadow-md shadow-blue-500/20'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </footer>
        )}
      </main>

      <aside className="w-[300px] bg-white/30 border-l border-white/50 p-6 hidden xl:flex flex-col shrink-0 z-20">
         <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="bg-white/50 backdrop-blur-2xl p-5 rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] border border-white/80 shrink-0 hover:-translate-y-1 transition-transform duration-500 ease-out relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007AFF]/15 to-transparent rounded-full blur-2xl -z-10" />
               <div className="text-[11px] text-[#424245] font-extrabold uppercase mb-4 tracking-wider flex items-center gap-2">
                 <Activity className="w-3.5 h-3.5 text-[#007AFF]" /> 今日概览
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100/50 rounded-2xl p-3.5 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_16px_rgba(249,115,22,0.1)] group">
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-500 group-hover:scale-105 transition-transform">{currentUser.pending}</div>
                    <div className="text-[11px] font-bold text-orange-600/80 mt-1.5 uppercase tracking-wide">待处理</div>
                 </div>
                 <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100/50 rounded-2xl p-3.5 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_16px_rgba(0,122,255,0.1)] group">
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#007AFF] to-[#0051e3] group-hover:scale-105 transition-transform">{currentUser.completed}</div>
                    <div className="text-[11px] font-bold text-[#007AFF]/80 mt-1.5 uppercase tracking-wide">已完成</div>
                 </div>
               </div>
            </div>

            <div className="bg-white/50 backdrop-blur-2xl p-5 rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] border border-white/80 flex flex-col min-h-0 flex-1 hover:-translate-y-1 transition-transform duration-500 ease-out relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-2xl -z-10" />
               <div className="text-[11px] text-[#424245] font-extrabold uppercase mb-4 tracking-wider flex items-center gap-2 shrink-0">
                 <Bell className="w-3.5 h-3.5 text-orange-500" /> 待处理工单
               </div>
               <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-1">
                 {/* 核心修改：利用 sort 将工单按时间升序排列（越早越靠前） */}
                 {currentUser.recentPending?.length > 0 ? [...currentUser.recentPending].sort((a, b) => new Date(a.report_time.replace('T', ' ').replace(/-/g, '/')).getTime() - new Date(b.report_time.replace('T', ' ').replace(/-/g, '/')).getTime()).map(order => {
                   // 计算是否超过 24 小时 (毫秒)
                   const isUrgent = (new Date() - new Date(order.report_time.replace('T', ' ').replace(/-/g, '/'))) > 24 * 60 * 60 * 1000;
                   return (
                     <div key={order.id} onClick={() => {
                         setTargetRepairRoom(order.building_room); 
                         setMode('repair_manage');
                     }} className={`p-3.5 rounded-[1.2rem] border shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:scale-95 group relative overflow-hidden ${isUrgent ? 'bg-gradient-to-br from-red-50 to-white border-red-100' : 'bg-white/80 border-black/[0.03] hover:border-blue-100'}`}>
                        {isUrgent && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                        {!isUrgent && <div className="absolute top-0 left-0 w-1 h-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        <div className="flex justify-between items-start mb-2 pl-1">
                          <span className={`font-bold text-[13px] ${isUrgent ? 'text-red-700' : 'text-[#1d1d1f]'}`}>{order.building_room}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm ${isUrgent ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200/50'}`}>{order.status}</span>
                        </div>
                        <div className={`text-[12px] font-semibold mb-2.5 truncate pl-1 ${isUrgent ? 'text-red-600' : 'text-[#424245]'}`}>{order.item}</div>
                        <div className={`text-[10px] flex items-center justify-between pl-1 ${isUrgent ? 'text-red-500 font-medium' : 'text-[#86868b]'}`}>
                          <div className="flex items-center gap-1.5">
                            {isUrgent ? <AlertTriangle className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                            {order.report_time.replace('T', ' ')}
                          </div>
                          {isUrgent && <span className="text-[9px] font-bold tracking-wider">超24H</span>}
                        </div>
                     </div>
                   );
                 }) : (
                   <div className="text-center text-xs text-[#86868b] py-8 flex flex-col items-center justify-center gap-2 bg-black/[0.02] rounded-2xl border border-dashed border-black/5">
                     <CheckCircle className="w-6 h-6 text-green-500/50" />
                     暂无待处理工单
                   </div>
                 )}
               </div>
            </div>

            <div className={`p-5 rounded-3xl text-white shadow-lg relative overflow-hidden group shrink-0 transition-all duration-500 ${
              systemStatus === 'normal' ? 'bg-[#1d1d1f] shadow-black/10' :
              systemStatus === 'expired' ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/20' :
              systemStatus === 'checking' ? 'bg-slate-700 shadow-slate-700/20' :
              'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20'
            }`}>
               <div className="flex items-start gap-3">
                  <div className="bg-white/10 p-2 rounded-lg shrink-0">
                    {systemStatus === 'normal' ? <Shield className="w-5 h-5 text-white/80" /> : 
                     systemStatus === 'checking' ? <Loader2 className="w-5 h-5 text-white/80 animate-spin" /> : 
                     <AlertTriangle className="w-5 h-5 text-white/90" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">
                      {systemStatus === 'checking' ? '检测系统中...' :
                       systemStatus === 'normal' ? '系统状态正常' :
                       systemStatus === 'expired' ? '登录凭证已过期' : '系统连接异常'}
                    </h3>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      {systemStatus === 'checking' ? '正在与核心组件握手...' :
                       systemStatus === 'normal' ? <><span className="text-green-400 mr-1 text-[10px]">●</span>AI 引擎在线<br/><span className="text-green-400 mr-1 text-[10px]">●</span>数据库连接稳定</> :
                       systemStatus === 'expired' ? '安全凭证已失效，为了您的数据安全，请重新登录。' : '无法连接到后台服务器，或数据库无响应。'}
                    </p>
                    {systemStatus === 'expired' && (
                      <button onClick={handleLogout} className="mt-3 text-xs bg-white text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-xl transition-colors font-bold w-full shadow-sm active:scale-95 flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> 立即重新登录
                      </button>
                    )}
                    {(systemStatus === 'disconnected' || systemStatus === 'error') && (
                      <button onClick={() => checkSystemStatus(true)} className="mt-3 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl transition-colors font-medium w-full shadow-sm active:scale-95">
                        重新尝试连接
                      </button>
                    )}
                  </div>
               </div>
            </div>
         </div>

         <button 
           onClick={handleLogout}
           className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all font-medium text-sm mt-4 shrink-0"
         >
           <LogOut className="w-4 h-4" /> 退出登录
         </button>
      </aside>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto">
          <div className="m-auto bg-white/70 backdrop-blur-[60px] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-white/80 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/40">
              <h3 className="font-semibold text-lg text-[#1d1d1f]">系统设置</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5 text-[#86868b]"/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#007AFF] text-white rounded-lg"><Bell className="w-5 h-5"/></div>
                  <div><div className="font-medium text-[#1d1d1f]">消息通知</div><div className="text-xs text-[#86868b]">接收新消息提醒</div></div>
                </div>
                <div className="w-11 h-6 bg-[#34C759] rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"/></div>
              </div>
            </div>
            <div className="p-5 bg-white/40 text-right border-t border-white/50">
              <button onClick={() => setShowSettings(false)} className="px-6 py-2 bg-[#007AFF] text-white rounded-full font-medium hover:bg-[#0071e3] transition-colors">完成</button>
            </div>
          </div>
        </div>
      )}

      {showAdminAuth && (
        <AdminAuthModal 
          onClose={() => setShowAdminAuth(false)}
          onSuccess={handleAdminAuthSuccess}
        />
      )}

      {globalSelectedRecord && (
        <OwnerDetailModal 
          record={globalSelectedRecord} 
          onClose={() => setGlobalSelectedRecord(null)} 
          onAIAnalyze={handleAIAnalysis}
          showHistory={mode === 'admin'}
          hideAIButton={mode === 'admin'}
        />
      )}
    </div>
  );
}

function RepairManagePage({ onUpdate, initialRoom }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [toast, setToast] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(initialRoom || null);

  useEffect(() => {
    setSelectedRoom(initialRoom || null);
  }, [initialRoom]);

  const fetchRecords = async () => {
    const token = localStorage.getItem('butler_auth_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/repair_records/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRecords(data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // 將工單依照房號分組，提取出左側的業主列表
  const groupedRecords = records.reduce((acc, curr) => {
    const roomName = curr.building_room || '未知房号';
    if (!acc[roomName]) acc[roomName] = [];
    acc[roomName].push(curr);
    return acc;
  }, {});

  const roomList = Object.keys(groupedRecords).map(room => ({
    room,
    owner_name: groupedRecords[room][0].owner_name || '未知业主',
    count: groupedRecords[room].length
  })).sort((a, b) => sortRoomsByNumber(a.room, b.room));

  const lowerSearchTerm = searchTerm.toLowerCase();
  // 优化：左侧列表支持跨维度搜索（包含报修日期和项目）
  const filteredRooms = roomList.filter(r => {
    const matchRoom = r.room && r.room.toLowerCase().includes(lowerSearchTerm);
    const matchOwner = r.owner_name && r.owner_name.toLowerCase().includes(lowerSearchTerm);
    const matchRecords = groupedRecords[r.room].some(record => 
      (record.report_time && record.report_time.toLowerCase().includes(lowerSearchTerm)) ||
      (record.item && record.item.toLowerCase().includes(lowerSearchTerm))
    );
    return matchRoom || matchOwner || matchRecords;
  });

  // 优化：右侧列表同步过滤。如果是通过搜房间号/姓名搜出来的，显示该人全部工单；如果是搜日期/项目搜出来的，只显示匹配的工单
  const displayedRecords = selectedRoom ? (groupedRecords[selectedRoom] || []).filter(record => {
    if (!searchTerm) return true;
    const matchRoomOrOwner = 
      (selectedRoom.toLowerCase().includes(lowerSearchTerm)) || 
      ((groupedRecords[selectedRoom][0]?.owner_name || '').toLowerCase().includes(lowerSearchTerm));
    if (matchRoomOrOwner) return true;
    return (record.report_time && record.report_time.toLowerCase().includes(lowerSearchTerm)) ||
           (record.item && record.item.toLowerCase().includes(lowerSearchTerm));
  }) : [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden flex flex-col md:flex-row flex-1 min-h-[80vh] md:min-h-[600px] transition-all duration-500">
        
        {/* 左侧：有报修记录的业主列表 */}
        <div className={`w-full md:w-1/3 border-b md:border-b-0 border-white/30 flex flex-col bg-white/10 shrink-0 transition-all relative z-0 ${selectedRoom ? 'hidden md:flex' : 'flex-1 md:h-auto'}`}>
          <div className="p-5 border-b border-white/20 bg-white/10">
            <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                <Wrench className="w-4 h-4" />
              </div>
              按业主查看工单
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="搜索房号/姓名/日期/项目..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/40 border border-white/50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors hover:bg-white/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <div className="text-center text-xs text-[#86868b] py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/>加载业主列表...</div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map(r => (
                <button 
                  key={r.room}
                  onClick={() => setSelectedRoom(r.room)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between group ${selectedRoom === r.room ? 'bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white/80 text-[#007AFF] scale-[1.02] translate-x-2' : 'hover:bg-white/40 hover:translate-x-1 text-[#424245] border border-transparent'}`}
                >
                  <div>
                    <div className={`font-semibold text-sm ${selectedRoom === r.room ? 'text-[#1d1d1f]' : ''}`}>{r.room}</div>
                    <div className={`text-xs mt-0.5 ${selectedRoom === r.room ? 'text-[#007AFF]' : 'text-[#86868b]'}`}>{r.owner_name} <span className="ml-1 opacity-60">({r.count} 工单)</span></div>
                  </div>
                  <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoom === r.room ? 'opacity-100 text-[#007AFF]' : 'text-[#86868b]'}`} />
                </button>
              ))
            ) : (
              <div className="text-center text-xs text-[#86868b] py-4">未找到匹配的业主</div>
            )}
          </div>
        </div>

        {/* 右侧：报修记录详情表格 */}
        <div className={`w-full md:w-2/3 flex flex-col bg-gradient-to-br from-white/95 to-white/70 shadow-[0_-16px_48px_-16px_rgba(0,0,0,0.15),-24px_0_48px_-16px_rgba(0,0,0,0.15),inset_1px_1px_0_rgba(255,255,255,1)] relative z-10 flex-1 min-w-0 min-h-0 ${!selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          {selectedRoom ? (
            <>
              <div className="p-5 border-b border-white/80 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedRoom(null)} className="md:hidden p-1.5 -ml-2 hover:bg-black/5 rounded-lg text-[#86868b] active:scale-95 transition-all"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                  <h3 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                    {selectedRoom} 的报修工单
                  </h3>
                </div>
                <div className="text-xs text-[#86868b] bg-[#F2F2F7] px-2.5 py-1 rounded-md font-medium">
                  {displayedRecords.length} 项记录
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* 全端統一：卡片式佈局，徹底解決寬度擠壓與向右滾動的問題 */}
                <div className="grid grid-cols-1 gap-4">
                  {displayedRecords.map((record) => (
                    <div key={record.id} className={`p-5 rounded-[1.5rem] border shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,122,255,0.08)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${record.status === '已完成' ? 'bg-white/30 backdrop-blur-md border-white/40 opacity-90' : 'bg-white/60 backdrop-blur-xl border-white/80'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-sm text-[#86868b] font-medium">#{record.id}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${record.status === '已完成' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{record.status}</span>
                      </div>
                      <div className="font-semibold text-[#1d1d1f] text-base mb-4">{record.item}</div>
                      
                      <div className="space-y-2 text-sm text-[#86868b] bg-black/[0.02] p-3.5 rounded-xl mb-4 border border-black/5 flex-1">
                        <div className="flex items-center gap-2"><span className="font-medium text-[#424245]">报事:</span> {record.report_time.replace('T', ' ')}</div>
                        {record.completion_time && (
                          <div className="text-green-600 flex items-center gap-2 flex-wrap">
                            <span><span className="font-medium text-green-700">完成:</span> {record.completion_time.replace('T', ' ')}</span>
                            <span className="bg-green-100/80 text-green-700 px-1.5 py-[1px] rounded text-xs font-medium">历时 {calculateDuration(record.report_time, record.completion_time)}</span>
                          </div>
                        )}
                        <div className="border-t border-black/5 my-2 pt-2 flex items-center gap-4 flex-wrap">
                           <div><span className="font-medium text-[#424245]">录入人:</span> {record.operator || localStorage.getItem('butler_username') || '未知'}</div>
                           <div><span className="font-medium text-[#007AFF]">接单人:</span> {record.handler || '-'}</div>
                        </div>
                        {record.process_detail && <div className="text-[#424245] line-clamp-3 leading-relaxed"><span className="font-medium">详情:</span> {record.process_detail}</div>}
                      </div>
                      
                      <div className="flex justify-end">
                        <button onClick={() => setEditingRecord(record)} className="px-4 py-2.5 text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-xl transition-colors flex items-center justify-center text-sm font-semibold active:scale-95 shadow-sm" title="编辑工单详情">
                          <Edit className="w-4 h-4 mr-2" /> 处理 / 编辑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#86868b] p-6">
              <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] border border-white/80">
                <Wrench className="w-8 h-8 text-orange-400" />
              </div>
              <p className="font-medium text-[#424245] text-base">请在左侧选择一个业主</p>
              <p className="text-sm mt-2">查看其专属的报修工单记录</p>
            </div>
          )}
        </div>
      </div>

      {editingRecord && (
        <RepairEditModal 
          record={editingRecord} 
          onClose={() => setEditingRecord(null)} 
          onSuccess={() => { 
            setEditingRecord(null); 
            fetchRecords(); 
            if(onUpdate) onUpdate(); 
            setToast('工单记录已成功更新');
            setTimeout(() => setToast(''), 3000);
          }} 
        />
      )}

      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-xl text-green-700 px-6 py-3 rounded-2xl shadow-[0_12px_40px_rgba(52,199,89,0.25)] border border-green-200 flex items-center gap-3 animate-in fade-in zoom-in-95 slide-in-from-top-6 duration-500">
           <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
             <CheckCircle className="w-4 h-4 text-green-600" />
           </div>
           <span className="font-semibold text-sm tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
}

function RepairEditModal({ record, onClose, onSuccess }) {
  const [status, setStatus] = useState(record.status || '处理中');
  const [handler, setHandler] = useState(record.handler || '');
  const [processDetail, setProcessDetail] = useState(record.process_detail || '');
  const [callbackResult, setCallbackResult] = useState(record.callback_result || '');
  const [completionRecord, setCompletionRecord] = useState(record.completion_record || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('butler_auth_token');
      const res = await fetch(`${API_BASE_URL}/api/repair_records/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, handler: handler || undefined, process_detail: processDetail || undefined, callback_result: callbackResult || undefined, completion_record: completionRecord || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || '更新失败');
      onSuccess();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto">
      <div className="m-auto bg-white/70 backdrop-blur-[60px] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-white/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/40">
          <h3 className="font-semibold text-lg text-[#1d1d1f] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" /> 更新报修记录
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5 text-[#86868b]"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
            {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
            
            <div className="bg-[#F2F2F7] p-3 rounded-xl mb-4 text-sm flex flex-col gap-2 text-[#1d1d1f]">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <div><span className="text-[#86868b] mr-1">房号:</span><span className="font-medium">{record.building_room}</span></div>
                {record.owner_name && <div><span className="text-[#86868b] mr-1">业主:</span><span className="font-medium">{record.owner_name}</span></div>}
                {record.phone && <div><span className="text-[#86868b] mr-1">电话:</span><span className="font-medium">{record.phone}</span></div>}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <div><span className="text-[#86868b] mr-1">项目:</span><span className="font-medium">{record.item}</span></div>
                <div><span className="text-[#86868b] mr-1">录入人:</span><span className="font-medium">{record.operator || localStorage.getItem('butler_username') || '未知'}</span></div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">最新状态</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)} 
                disabled={record.status === '已完成'}
                className={`w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ${record.status === '已完成' ? 'opacity-60 cursor-not-allowed bg-black/5' : ''}`}
              >
                <option value="处理中">处理中</option>
                <option value="已完成">已完成</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">接单人 (维修人)</label>
              <input type="text" value={handler} onChange={e => setHandler(e.target.value)} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="输入负责维修此工单的接单人姓名..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">补充处理详情</label>
              <textarea value={processDetail} onChange={e => setProcessDetail(e.target.value)} rows="3" className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="输入最新的处理进展..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">完成记录</label>
              <textarea value={completionRecord} onChange={e => setCompletionRecord(e.target.value)} rows="2" className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="如已完成，请输入完成详情..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#424245] mb-2">回访结果</label>
              <textarea value={callbackResult} onChange={e => setCallbackResult(e.target.value)} rows="2" className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm text-[#1d1d1f] resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="输入回访记录..." />
            </div>
          </div>
          <div className="p-5 bg-white/40 flex justify-end gap-3 border-t border-white/50 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-[#1d1d1f] rounded-xl font-medium hover:bg-black/5 transition-colors">取消</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 用于翻译数据字段并进行格式化的辅助函数
const fieldLabels = {
  area: '建筑面积', delivery_standard: '交房标准', owner_name: '业主姓名',
  age: '年龄', gender: '性别', phone: '手机号', wechat: '微信号',
  political_status: '政治面貌', is_resident: '是否常住', pets: '宠物情况',
  car_plate: '车牌号', is_new_energy: '新能源车', use_charging_pile: '使用充电桩',
  ebike_count: '电动车', tricycle_count: '三轮车', stroller_count: '儿童车',
  contact_person: '对接人', relationship: '关系', contact_phone: '对接电话',
  payer: '缴费人', payment_method: '缴费方式', payment_cycle: '缴费周期',
  customer_level: '客户等级', opinion_tags: '舆论标签', negative_info: '负向/敏感信息'
};
const formatVal = (val, key) => {
  if (val === true || (val === 1 && key && key.startsWith('is_'))) return '是';
  if (val === false || (val === 0 && key && key.startsWith('is_'))) return '否';
  if (val === null || val === undefined || val === '') return '无';
  return String(val);
};

function OwnerDynamicsPage() {
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomHistory, setRoomHistory] = useState([]);
  const [selectedOwnerDetails, setSelectedOwnerDetails] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedHistId, setExpandedHistId] = useState(null); // 控制展开的卡片
  const [expandedField, setExpandedField] = useState(null); // 控制展开的具体字段小卡片

  // 1. 获取所有业主列表
  useEffect(() => {
    const token = localStorage.getItem('butler_auth_token');
    fetch(`${API_BASE_URL}/api/records/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        let fetchedOwners = Array.isArray(data.records) ? data.records : [];
        fetchedOwners.sort((a, b) => sortRoomsByNumber(a.building_room, b.building_room));
        setOwners(fetchedOwners);
        setLoadingOwners(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingOwners(false);
      });
  }, []);

  // 2. 监听选中的业主，获取该业主的专属动态
  useEffect(() => {
    if (!selectedRoom) return;
    setLoadingHistory(true);
    setExpandedHistId(null);
    setSelectedOwnerDetails(null);
    setExpandedField(null);
    const token = localStorage.getItem('butler_auth_token');
    fetch(`${API_BASE_URL}/api/records/${encodeURIComponent(selectedRoom)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRoomHistory(data.profile_history || []);
        setSelectedOwnerDetails(data);
        setLoadingHistory(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingHistory(false);
      });
  }, [selectedRoom]);

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredOwners = owners.filter(o => 
    (o.building_room && o.building_room.toLowerCase().includes(lowerSearchTerm)) || 
    (o.owner_name && o.owner_name.toLowerCase().includes(lowerSearchTerm))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="bg-white/40 backdrop-blur-[40px] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden flex flex-col md:flex-row flex-1 min-h-[80vh] md:min-h-[600px] transition-all duration-500">
        
        {/* 左侧：业主列表 */}
        <div className={`w-full md:w-1/3 border-b md:border-b-0 border-white/30 flex flex-col bg-white/10 shrink-0 transition-all relative z-0 ${selectedRoom ? 'hidden md:flex' : 'flex-1 md:h-auto'}`}>
          <div className="p-5 border-b border-white/20 bg-white/10">
            <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#007AFF]">
                <Activity className="w-4 h-4" />
              </div>
              按业主查看动态
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="搜索房号 / 姓名..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/40 border border-white/50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-colors hover:bg-white/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loadingOwners ? (
              <div className="text-center text-xs text-[#86868b] py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/>加载业主列表...</div>
            ) : filteredOwners.length > 0 ? (
              filteredOwners.map(owner => (
                <button 
                  key={owner.building_room}
                  onClick={() => setSelectedRoom(owner.building_room)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between group ${selectedRoom === owner.building_room ? 'bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white/80 text-[#007AFF] scale-[1.02] translate-x-2' : 'hover:bg-white/40 hover:translate-x-1 text-[#424245] border border-transparent'}`}
                >
                  <div>
                    <div className={`font-semibold text-sm ${selectedRoom === owner.building_room ? 'text-[#1d1d1f]' : ''}`}>{owner.building_room}</div>
                    <div className={`text-xs mt-0.5 ${selectedRoom === owner.building_room ? 'text-[#007AFF]' : 'text-[#86868b]'}`}>{owner.owner_name || '未知业主'}</div>
                  </div>
                  <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoom === owner.building_room ? 'opacity-100 text-[#007AFF]' : 'text-[#86868b]'}`} />
                </button>
              ))
            ) : (
              <div className="text-center text-xs text-[#86868b] py-4">未找到匹配的业主</div>
            )}
          </div>
        </div>

        {/* 右侧：动态轨迹 */}
        <div className={`w-full md:w-2/3 flex flex-col bg-gradient-to-br from-white/95 to-white/70 shadow-[0_-16px_48px_-16px_rgba(0,0,0,0.15),-24px_0_48px_-16px_rgba(0,0,0,0.15),inset_1px_1px_0_rgba(255,255,255,1)] relative z-10 flex-1 min-w-0 min-h-0 ${!selectedRoom ? 'hidden md:flex' : 'flex'}`}>
          {selectedRoom ? (
            <>
              <div className="p-5 border-b border-white/80 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedRoom(null)} className="md:hidden p-1.5 -ml-2 hover:bg-black/5 rounded-lg text-[#86868b] active:scale-95 transition-all"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                  <h3 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                    {selectedRoom} 的动态
                  </h3>
                </div>
                <div className="text-xs text-[#86868b] bg-[#F2F2F7] px-2.5 py-1 rounded-md font-medium">
                  {roomHistory.length} 条记录
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {loadingHistory ? (
                  <div className="text-center text-[#86868b] text-sm py-10 flex flex-col items-center">
                    <Loader2 className="w-6 h-6 animate-spin mb-3 text-[#007AFF]"/>
                    正在加载数据...
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500">
                    {/* 优化：分类分组显示业主全部最新信息，排版更加精美 */}
                    {selectedOwnerDetails && (
                      <div className="bg-white/40 backdrop-blur-3xl border border-white/80 p-5 sm:p-7 rounded-[2rem] mb-8 shadow-[0_12px_40px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] relative">
                        <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none -z-10">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#007AFF]/10 to-purple-500/10 rounded-full blur-3xl" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/60">
                          <h4 className="text-base font-extrabold text-[#1d1d1f] flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#007AFF] to-[#0051e3] flex items-center justify-center shadow-lg text-white">
                              <User className="w-5 h-5" />
                            </div>
                            业主全维档案
                          </h4>
                          <div className="text-xs font-bold text-[#007AFF] bg-white px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-blue-50/50">
                             {selectedOwnerDetails.building_room}
                          </div>
                        </div>

                        <div className="space-y-5">
                          {[
                            {
                              title: "基础与联系", icon: User, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200/50",
                              keys: ['owner_name', 'phone', 'age', 'gender', 'political_status', 'wechat', 'contact_person', 'relationship', 'contact_phone']
                            },
                            {
                              title: "房产与生活", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200/50",
                              keys: ['area', 'delivery_standard', 'is_resident', 'pets', 'payer', 'payment_method', 'payment_cycle']
                            },
                            {
                              title: "车辆与出行", icon: Activity, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200/50",
                              keys: ['car_plate', 'is_new_energy', 'use_charging_pile', 'ebike_count', 'tricycle_count', 'stroller_count']
                            },
                            {
                              title: "画像特征", icon: Sparkles, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200/50",
                              keys: ['customer_level', 'opinion_tags', 'negative_info']
                            }
                          ].map(group => (
                            <div key={group.title} className="bg-white/50 p-4 sm:p-5 rounded-[1.5rem] border border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:bg-white/70">
                               <div className="flex items-center gap-2.5 mb-4">
                                 <div className={`w-7 h-7 rounded-lg ${group.bg} flex items-center justify-center border ${group.border}`}>
                                    <group.icon className={`w-4 h-4 ${group.color}`} />
                                 </div>
                                 <h5 className="text-[13px] font-bold text-[#424245] uppercase tracking-wider">{group.title}</h5>
                               </div>
                               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                 {group.keys.map(key => {
                                    const val = selectedOwnerDetails[key];
                                    const displayVal = formatVal(val, key);
                                    const isEmpty = displayVal === '无' || displayVal === '0';
                                    const isNegative = key === 'negative_info';
                                    const isCustomerLevel = key === 'customer_level';
                                    const isExpanded = expandedField === key;
                                    
                                    let colSpanClass = 'col-span-1';
                                    if (isNegative) colSpanClass = 'col-span-2 sm:col-span-3 lg:col-span-4';
                                    else if (key === 'opinion_tags') colSpanClass = 'col-span-2 sm:col-span-2 lg:col-span-3';
                                    
                                    return (
                                        <div key={key} className={`relative ${colSpanClass}`}>
                                            {/* 常规占位卡片：始终占据文档流位置，不影响原排版 */}
                                            <div 
                                              onClick={() => setExpandedField(isExpanded ? null : key)}
                                              className={`flex flex-col bg-white/90 backdrop-blur-sm px-3.5 py-3 rounded-[1rem] border transition-all duration-300 cursor-pointer w-full h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 z-10 ${isNegative && val ? 'border-red-200 bg-red-50' : 'border-black/[0.03]'}`} 
                                              title="点击展开完整信息"
                                            >
                                                <span className={`text-[11px] font-bold mb-1.5 tracking-wide ${isNegative && val ? 'text-red-500' : 'text-[#86868b]'}`}>{fieldLabels[key]}</span>
                                                {isCustomerLevel ? (
                                                    <span className={`w-fit px-2.5 py-0.5 rounded-md text-[12px] font-bold shadow-sm ${
                                                      val === 'S' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200/50' :
                                                      val === 'A' ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-200/50' :
                                                      val === 'B' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200/50' :
                                                      'bg-[#F2F2F7] text-[#424245] border border-black/5'
                                                    }`}>{displayVal}</span>
                                                ) : (
                                                    <span className={`text-[13px] ${isNegative && val ? 'text-red-700 font-bold' : isEmpty ? 'text-[#86868b]/40 font-medium' : 'text-[#1d1d1f] font-semibold'} ${(isNegative || key === 'opinion_tags') ? 'line-clamp-2 leading-relaxed' : 'truncate'} block`}>
                                                      {displayVal}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* 绝对悬浮层：跨越格子高度但不推挤其他元素，通过透明度控制丝滑淡入淡出 */}
                                            <div 
                                              onClick={() => setExpandedField(null)} 
                                              className={`absolute top-0 left-0 w-[calc(100%+16px)] -translate-x-[8px] -translate-y-[8px] flex flex-col bg-white/95 backdrop-blur-3xl px-4 py-3.5 rounded-[1.2rem] border border-[#007AFF]/40 shadow-[0_32px_80px_rgba(0,122,255,0.25)] ring-4 ring-[#007AFF]/15 h-auto min-h-full z-[100] cursor-pointer transition-all duration-300 origin-top-left ${isExpanded ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-95 pointer-events-none invisible'}`}
                                              title="点击折叠"
                                            >
                                               <span className={`text-[11px] font-bold mb-1.5 tracking-wide ${isNegative && val ? 'text-red-500' : 'text-[#007AFF]'}`}>{fieldLabels[key]}</span>
                                               {isCustomerLevel ? (
                                                   <span className={`w-fit px-2.5 py-0.5 rounded-md text-[12px] font-bold shadow-sm ${
                                                     val === 'S' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200/50' :
                                                     val === 'A' ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-200/50' :
                                                     val === 'B' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200/50' :
                                                     'bg-[#F2F2F7] text-[#424245] border border-black/5'
                                                   }`}>{displayVal}</span>
                                               ) : (
                                                   <span className={`text-[14px] leading-relaxed break-words whitespace-pre-wrap ${isNegative && val ? 'text-red-700 font-bold' : isEmpty ? 'text-[#86868b]/40 font-medium' : 'text-[#1d1d1f] font-semibold'} block`}>
                                                     {displayVal}
                                                   </span>
                                               )}
                                            </div>
                                        </div>
                                    )
                                 })}
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <h4 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#007AFF]" />
                      历史变更轨迹与字段记录
                    </h4>
                    
                    {roomHistory.length > 0 ? (
                      <div className="relative border-l border-[#007AFF]/20 ml-4 space-y-8">
                    {roomHistory.map((hist, idx) => {
                      let snapshot = {};
                      let prevSnapshot = {};
                      try { snapshot = JSON.parse(hist.data_snapshot); } catch(e){}
                      try { if (roomHistory[idx + 1]) prevSnapshot = JSON.parse(roomHistory[idx + 1].data_snapshot); } catch(e){}

                      // 对比当前快照与上一次的快照
                      const changes = [];
                      Object.keys(fieldLabels).forEach(key => {
                        const oldVal = formatVal(prevSnapshot[key], key);
                        const newVal = formatVal(snapshot[key], key);
                        if (oldVal !== newVal) {
                          changes.push({ key, label: fieldLabels[key], oldVal, newVal });
                        }
                      });
                      
                      const isExpanded = expandedHistId === (hist.id || idx);

                      return (
                        <div key={hist.id || idx} className="relative pl-6 animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${idx * 50}ms`}}>
                          <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-white border-2 border-[#007AFF] rounded-full shadow-sm"></div>
                          <div className="text-xs text-[#86868b] font-mono mb-2">{hist.created_at}</div>
                          <div 
                            onClick={() => setExpandedHistId(isExpanded ? null : (hist.id || idx))}
                            className={`bg-white/60 backdrop-blur-2xl border p-5 rounded-[1.5rem] text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none ${isExpanded ? 'border-[#007AFF]/40 shadow-[0_20px_48px_rgba(0,122,255,0.2),inset_0_1px_2px_rgba(255,255,255,0.9)] -translate-y-1.5 scale-[1.02] z-10 relative' : 'border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_40px_rgba(0,122,255,0.08)] hover:-translate-y-1'}`}
                          >
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-[#424245]"><span className="text-[#86868b] text-xs block mb-1">操作人</span> <span className="font-medium">{snapshot.updated_by || localStorage.getItem('butler_username') || '未知'}</span></div>
                              <div className="text-[#424245]"><span className="text-[#86868b] text-xs block mb-1">客户等级</span>
                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                                   snapshot.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' :
                                   snapshot.customer_level === 'A' ? 'bg-red-100 text-red-800' :
                                   snapshot.customer_level === 'B' ? 'bg-blue-100 text-blue-800' :
                                   'bg-[#F2F2F7] text-[#1d1d1f]'
                                 }`}>{snapshot.customer_level || 'C'}</span>
                              </div>
                            </div>
                            <div className="text-[#424245] mb-3"><span className="text-[#86868b] text-xs block mb-1">舆论标签</span> {snapshot.opinion_tags || '-'}</div>
                            <div className="text-red-600 bg-red-50/50 p-3 rounded-xl border border-red-100/50"><span className="text-red-500 text-xs block mb-1 font-medium">负向/敏感信息</span> {snapshot.negative_info || '-'}</div>

                            {/* 折叠/展开箭头 */}
                            <div className="mt-3 flex flex-col items-center justify-center text-[#86868b]/50 hover:text-[#007AFF] transition-colors gap-1">
                               {!isExpanded && <span className="text-[10px] font-medium tracking-wide">点击查看变更字段</span>}
                               <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#007AFF]' : ''}`}>
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                               </div>
                            </div>

                            {/* 变动详情对比区 */}
                            {isExpanded && (
                               <div className="mt-2 pt-4 border-t border-black/5 animate-in slide-in-from-top-2 duration-300">
                                  <h5 className="text-xs font-bold text-[#424245] mb-3 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> 变更字段对比
                                  </h5>
                                  {changes.length > 0 ? (
                                    <div className="space-y-2">
                                      {changes.map(c => (
                                        <div key={c.key} className="flex items-center text-xs bg-black/[0.03] px-3 py-2.5 rounded-xl">
                                          <span className="w-20 text-[#86868b] font-medium shrink-0">{c.label}</span>
                                          <span className="text-red-500/70 line-through truncate flex-1 min-w-0 text-right" title={c.oldVal}>{c.oldVal}</span>
                                          <ArrowRight className="w-3.5 h-3.5 text-[#86868b]/40 mx-3 shrink-0" />
                                          <span className="text-green-600 font-medium truncate flex-1 min-w-0" title={c.newVal}>{c.newVal}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-[#86868b] bg-black/[0.02] p-3 rounded-xl text-center">没有检测到数据字段的实质性修改。</div>
                                  )}
                               </div>
                             )}
                          </div>
                        </div>
                      )
                    })}
                          </div>
                        ) : (
                          <div className="text-center text-sm text-[#86868b] bg-white/50 py-10 rounded-2xl border border-black/5 border-dashed">
                            该业主暂无历史变动记录
                          </div>
                        )}
                      </div>
                    )}
                  </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#86868b] p-6">
              <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] border border-white/80">
                <Activity className="w-8 h-8 text-[#007AFF]/60" />
              </div>
              <p className="font-medium text-[#424245] text-base">请在左侧选择一个业主</p>
              <p className="text-sm mt-2">查看其专属的动态变更轨迹</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function AdminAuthModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('butler_auth_token');
      const response = await fetch(`${API_BASE_URL}/api/verify-admin-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password }),
      });

      if (response.status === 403) {
        throw new Error('管理员密码错误');
      }
      if (!response.ok) {
        throw new Error('验证失败，请稍后重试');
      }
      
      onSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto">
      <div className="m-auto bg-white/70 backdrop-blur-[60px] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-white/80 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/40">
          <h3 className="font-semibold text-lg text-[#1d1d1f] flex items-center gap-2"><Shield className="w-5 h-5 text-[#86868b]"/> 管理员验证</h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5 text-[#86868b]"/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-[#424245]">访问后台记录需要输入管理员密码进行二次验证。</p>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 ml-1">管理员密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#86868b]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" placeholder="请输入管理员密码" autoFocus />
              </div>
            </div>
            {error && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
          </div>
          <div className="p-5 bg-white/40 flex justify-end gap-2 border-t border-white/50">
            <button type="button" onClick={onClose} className="px-5 py-2 text-[#1d1d1f] rounded-full font-medium hover:bg-black/5 transition-colors">取消</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-[#007AFF] text-white rounded-full font-medium hover:bg-[#0071e3] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? '验证中...' : '确认'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 401) {
        throw new Error('用户名或密码错误');
      }
      if (!response.ok) {
        throw new Error('登录失败，请检查网络或联系管理员');
      }

      const data = await response.json();
      if (data.token) {
        onLogin(data.token, data.username);
      } else {
        throw new Error('登录凭证无效');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 overflow-hidden z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-400/50 to-indigo-400/40 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-1" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-teal-400/40 to-blue-500/30 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-2" />
      <div className="bg-white/40 backdrop-blur-[60px] p-10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.15),inset_0_2px_6px_rgba(255,255,255,0.8)] max-w-sm w-full border border-white/70 relative z-10 flex flex-col min-h-0 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">Butler AI</h1>
          <p className="text-[#86868b] text-sm mt-1">智能管家系统</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 ml-1">用户名</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-[#86868b]" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                placeholder="请输入用户名"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 ml-1">访问密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#86868b]" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:bg-white transition-all text-base sm:text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                placeholder="请输入密码"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#007AFF] text-white font-medium py-3.5 rounded-full hover:bg-[#0071e3] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? '正在登录...' : '进入系统'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminPage({ onViewRecord }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('butler_auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/records/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then(data => {
        setRecords(Array.isArray(data.records) ? data.records : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredRecords = records.filter(r => 
    (r.building_room && r.building_room.toLowerCase().includes(lowerSearchTerm)) ||
    (r.owner_name && r.owner_name.toLowerCase().includes(lowerSearchTerm)) ||
    (r.phone && r.phone.toLowerCase().includes(lowerSearchTerm)) ||
    (r.opinion_tags && r.opinion_tags.toLowerCase().includes(lowerSearchTerm)) ||
    (r.updated_by && r.updated_by.toLowerCase().includes(lowerSearchTerm))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="bg-white/40 backdrop-blur-[40px] rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden transition-all duration-500">
        <div className="p-5 sm:p-6 border-b border-white/50 bg-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F2F2F7] rounded-xl flex items-center justify-center text-[#1d1d1f]">
                <FileText className="w-5 h-5" />
              </div>
              业主档案总览
            </h2>
            <div className="text-xs font-medium text-[#86868b] bg-[#F2F2F7] px-3 py-1 rounded-full">
              共 {filteredRecords.length} 条记录
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="检索房号/姓名/电话/标签/操作人..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/50 border border-white/60 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto overflow-x-hidden">
          {/* 桌面端：傳統表格視圖 */}
          <table className="hidden md:table w-full text-sm text-left table-fixed">
            <thead className="bg-white/40 text-[#86868b] font-medium border-b border-white/50 backdrop-blur-md">
              <tr>
                <th className="p-4 pl-6 text-center w-16">序号</th>
                <th className="p-4 w-[20%]">房产信息</th>
                <th className="p-4 w-[20%]">业主联系</th>
                <th className="p-4 w-[25%]">画像特征</th>
                <th className="p-4 w-[20%]">系统更新</th>
                <th className="p-4 w-20 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? <tr><td colSpan="6" className="p-8 text-center text-[#86868b]"><Loader2 className="w-5 h-5 animate-spin inline mr-2"/>正在读取数据库...</td></tr> : 
                filteredRecords.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-[#86868b]">未找到匹配的档案记录</td></tr> : 
                filteredRecords.map((record, index) => (
                <tr key={record.building_room + index} className="hover:bg-white/50 transition-colors group cursor-pointer" onClick={() => onViewRecord(record)}>
                  <td className="p-4 pl-6 text-center font-mono text-xs text-[#86868b]">#{index + 1}</td>
                  <td className="p-4 truncate">
                    <div className="font-semibold text-[#1d1d1f] truncate">{record.building_room}</div>
                    <div className="text-[11px] text-[#86868b] mt-0.5 truncate">{record.area ? `${record.area}㎡` : '面积未知'} · {record.is_resident ? '常住' : '非常住'}</div>
                  </td>
                  <td className="p-4 truncate">
                    <div className="font-medium text-[#424245] flex items-center gap-1 truncate">
                      <span className="truncate">{record.owner_name || '未知业主'}</span>
                      {record.negative_info && <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 shrink-0" title={`敏感信息: ${record.negative_info}`} />}
                    </div>
                    <div className="text-[11px] text-[#86868b] mt-0.5 font-mono truncate">{record.phone || '无电话'}</div>
                  </td>
                  <td className="p-4 truncate">
                    <div className="flex items-center gap-2 mb-1 truncate">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        record.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' :
                        record.customer_level === 'A' ? 'bg-red-100 text-red-800' :
                        record.customer_level === 'B' ? 'bg-blue-100 text-blue-800' :
                        'bg-[#F2F2F7] text-[#1d1d1f]'
                      }`}>{record.customer_level || 'C'}</span>
                    </div>
                    <div className="text-[11px] text-[#424245] truncate" title={record.opinion_tags}>{record.opinion_tags || '暂无标签'}</div>
                  </td>
                  <td className="p-4 truncate">
                    <div className="text-xs text-[#424245] mb-0.5 truncate">{record.updated_by || localStorage.getItem('butler_username') || '未知'}</div>
                    <div className="text-[10px] text-[#86868b] font-mono truncate">{new Date(record.updated_at).toLocaleString('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td className="p-4 text-center">
                     <button 
                       className="text-[#007AFF] bg-[#007AFF]/5 hover:bg-[#007AFF]/15 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                       onClick={(e) => { e.stopPropagation(); onViewRecord(record); }}
                     >
                       详情
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 移動端：卡片式列表視圖 */}
          <div className="md:hidden p-4 space-y-4">
            {loading ? <div className="py-8 text-center text-[#86868b]"><Loader2 className="w-5 h-5 animate-spin inline mr-2"/>正在读取...</div> : 
              filteredRecords.length === 0 ? <div className="py-8 text-center text-[#86868b]">未找到匹配的档案记录</div> : 
              filteredRecords.map((record, index) => (
              <div key={record.building_room + index} className="bg-white/80 p-4 rounded-2xl shadow-sm border border-white/60 relative cursor-pointer active:scale-[0.98] transition-all" onClick={() => onViewRecord(record)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-[#1d1d1f] text-base">{record.building_room}</div>
                    <div className="text-xs text-[#86868b] mt-0.5">{record.area ? `${record.area}㎡` : '面积未知'} · {record.is_resident ? '常住' : '非常住'}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                    record.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' :
                    record.customer_level === 'A' ? 'bg-red-100 text-red-800' :
                    record.customer_level === 'B' ? 'bg-blue-100 text-blue-800' :
                    'bg-[#F2F2F7] text-[#1d1d1f]'
                  }`}>{record.customer_level || 'C'}</span>
                </div>
                
                <div className="bg-black/[0.03] p-3 rounded-xl space-y-2 text-sm mb-3">
                  <div className="flex items-center gap-2 text-[#424245]">
                    <User className="w-4 h-4 text-[#86868b]" />
                    <span className="font-medium">{record.owner_name || '未知业主'}</span>
                    <span className="text-xs font-mono opacity-80">{record.phone || '无电话'}</span>
                    {record.negative_info && <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 ml-auto" />}
                  </div>
                  <div className="flex items-start gap-2 text-[#424245]">
                    <FileText className="w-4 h-4 text-[#86868b] shrink-0 mt-0.5" />
                    <span className="text-xs line-clamp-2 leading-relaxed">{record.opinion_tags || '暂无舆论标签'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-[#86868b]">
                   <div className="flex items-center gap-1.5">更新人: {record.updated_by || localStorage.getItem('butler_username') || '未知'}</div>
                   <div className="text-[#007AFF] bg-[#007AFF]/10 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">查看详情 <ArrowRight className="w-3 h-3" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerDetailModal({ record, onClose, onAIAnalyze, showHistory, hideAIButton }) {
  const [details, setDetails] = useState(record);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [expandedHistId, setExpandedHistId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('butler_auth_token');
    fetch(`${API_BASE_URL}/api/records/${encodeURIComponent(record.building_room)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if(data && data.building_room) {
         setDetails(data);
      }
    })
    .catch(err => console.error(err))
    .finally(() => setLoadingExtra(false));
  }, [record.building_room]);

  return (
    <div className="fixed inset-0 z-50 flex p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto">
      <div className="m-auto bg-white/70 backdrop-blur-[60px] rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-white/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-[0.95] slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="p-5 border-b border-white/50 flex justify-between items-center bg-white/40 shrink-0">
          <h3 className="font-semibold text-lg text-[#1d1d1f] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#007AFF]" /> 业主档案详情
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-5 h-5 text-[#86868b]"/></button>
        </div>
        
        {showHistory && (
          <div className="flex border-b border-black/5 bg-white/40 px-6 pt-3 gap-6 shrink-0">
            <button onClick={() => setActiveTab('details')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#007AFF] text-[#007AFF]' : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'}`}>基础档案</button>
            <button onClick={() => setActiveTab('history')} className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#007AFF] text-[#007AFF]' : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'}`}>操作日志</button>
          </div>
        )}

        {activeTab === 'details' ? (
          <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-white space-y-6">
            <div>
              <h4 className="text-sm font-bold text-[#1d1d1f] mb-3 uppercase tracking-wider border-b border-black/5 pb-2">基础与房产信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">房号</span><span className="font-medium text-[#1d1d1f]">{details.building_room}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">业主姓名</span><span className="font-medium text-[#1d1d1f]">{details.owner_name || '-'}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">手机号</span><span className="text-[#424245]">{details.phone || '-'}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">最后操作人</span><span className="font-medium text-[#007AFF]">{details.updated_by || localStorage.getItem('butler_username') || '未知'}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">客户等级</span>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      details.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' :
                      details.customer_level === 'A' ? 'bg-red-100 text-red-800' :
                      details.customer_level === 'B' ? 'bg-blue-100 text-blue-800' :
                      'bg-[#F2F2F7] text-[#1d1d1f]'
                    }`}>{details.customer_level || 'C'}</span>
                 </div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">建筑面积 (㎡)</span><span className="text-[#424245]">{details.area || '-'}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">交房标准</span><span className="text-[#424245]">{details.delivery_standard || '-'}</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#1d1d1f] mb-3 uppercase tracking-wider border-b border-black/5 pb-2">生活与车辆</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">宠物情况</span><span className="text-[#424245]">{details.pets || '-'}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">车牌号</span><span className="text-[#424245]">{details.car_plate || '-'}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">是否常住</span><span className="text-[#424245]">{details.is_resident ? '是' : '否'}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">电动车数量</span><span className="text-[#424245]">{details.ebike_count || 0}</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#1d1d1f] mb-3 uppercase tracking-wider border-b border-black/5 pb-2">客户画像标签</h4>
              <div className="grid grid-cols-1 gap-4 text-sm">
                 <div><span className="text-[#86868b] block mb-0.5 text-xs">舆论标签</span><span className="text-[#424245]">{details.opinion_tags || '-'}</span></div>
                 <div><span className="text-[#86868b] block mb-0.5 text-xs text-red-500">负向/敏感信息</span><span className="text-red-600 font-medium">{details.negative_info || '-'}</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#1d1d1f] mb-3 uppercase tracking-wider border-b border-black/5 pb-2 flex items-center gap-2">
                历史报修记录
              </h4>
              {loadingExtra ? (
                 <div className="text-center text-[#86868b] text-sm py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/> 加载关联记录...</div>
              ) : details.repair_history && details.repair_history.length > 0 ? (
                 <div className="space-y-3">
                    {details.repair_history.map(rh => (
                       <div key={rh.id} className="bg-[#F9F9F9] p-4 rounded-xl text-sm border border-black/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-[#1d1d1f]">{rh.item}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${rh.status === '已完成' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{rh.status}</span>
                          </div>
                          <div className="text-[#86868b] text-xs mb-2 flex items-center flex-wrap gap-x-2 gap-y-1">
                            <span>报事: {rh.report_time.replace('T', ' ')}</span> 
                            {rh.completion_time && (
                              <span className="text-green-600 flex items-center gap-1.5">
                                完成: {rh.completion_time.replace('T', ' ')}
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-medium">历时 {calculateDuration(rh.report_time, rh.completion_time)}</span>
                              </span>
                            )} 
                            <span className="text-black/10">|</span>
                            <span>录入: {rh.operator || '-'}</span>
                            <span className="text-black/10">|</span>
                            <span>接单: {rh.handler || '-'}</span>
                          </div>
                          {rh.process_detail && <div className="text-[#424245] text-xs bg-white p-2 rounded border border-black/5 mt-2"><span className="font-medium">详情:</span> {rh.process_detail}</div>}
                          {rh.completion_record && <div className="text-[#424245] text-xs bg-white p-2 rounded border border-black/5 mt-1"><span className="font-medium">完成记录:</span> {rh.completion_record}</div>}
                          {rh.callback_result && <div className="text-[#424245] text-xs bg-white p-2 rounded border border-black/5 mt-1"><span className="font-medium">回访:</span> {rh.callback_result}</div>}
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="text-center text-sm text-[#86868b] bg-[#F9F9F9] py-6 rounded-xl border border-black/5 border-dashed">
                    暂无关联报修记录
                 </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-white">
            {loadingExtra ? (
               <div className="text-center text-[#86868b] text-sm py-4"><Loader2 className="w-4 h-4 animate-spin inline mr-2"/> 加载日志中...</div>
            ) : details.profile_history && details.profile_history.length > 0 ? (
               <div className="relative border-l border-[#007AFF]/20 ml-3 space-y-6 my-2">
                 {details.profile_history.map((hist, idx) => {
                   let snapshot = {};
                   let prevSnapshot = {};
                   try { snapshot = JSON.parse(hist.data_snapshot); } catch(e){}
                   try { if (details.profile_history[idx + 1]) prevSnapshot = JSON.parse(details.profile_history[idx + 1].data_snapshot); } catch(e){}

                   const changes = [];
                   Object.keys(fieldLabels).forEach(key => {
                     const oldVal = formatVal(prevSnapshot[key], key);
                     const newVal = formatVal(snapshot[key], key);
                     if (oldVal !== newVal) {
                       changes.push({ key, label: fieldLabels[key], oldVal, newVal });
                     }
                   });
                   
                   const isExpanded = expandedHistId === (hist.id || idx);

                   return (
                     <div key={hist.id || idx} className="relative pl-6 animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 50}ms`}}>
                       <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-white border-2 border-[#007AFF] rounded-full shadow-sm"></div>
                       <div className="text-xs text-[#86868b] font-mono mb-2">{hist.created_at}</div>
                       <div 
                         onClick={() => setExpandedHistId(isExpanded ? null : (hist.id || idx))}
                        className={`bg-[#F2F2F7]/50 border p-4 rounded-2xl text-sm transition-all duration-300 cursor-pointer select-none ${isExpanded ? 'border-[#007AFF]/30 shadow-[0_12px_32px_rgba(0,122,255,0.15)] bg-white -translate-y-1 scale-[1.01] z-10 relative' : 'border-black/5 shadow-sm hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-0.5'}`}
                       >
                         <div className="flex items-center justify-between mb-3 border-b border-black/5 pb-2">
                           <div className="text-[#424245] font-medium flex items-center gap-2">
                             <User className="w-4 h-4 text-[#007AFF]" />
                             操作人：{snapshot.updated_by || localStorage.getItem('butler_username') || '未知'}
                           </div>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${snapshot.customer_level === 'S' ? 'bg-yellow-100 text-yellow-800' : snapshot.customer_level === 'A' ? 'bg-red-100 text-red-800' : snapshot.customer_level === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-[#E9E9EB] text-[#1d1d1f]'}`}>{snapshot.customer_level || 'C'}</span>
                         </div>
                         <div className="text-[#424245] mb-2"><span className="text-[#86868b] text-xs block mb-0.5">舆论标签</span> {snapshot.opinion_tags || '-'}</div>
                         {snapshot.negative_info && <div className="text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100/50 mb-2"><span className="text-red-500 text-xs block mb-0.5 font-medium">负向/敏感信息</span> {snapshot.negative_info}</div>}

                         <div className="mt-1 flex justify-center text-[#86868b]/40 hover:text-[#007AFF] transition-colors">
                            <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#007AFF]' : ''}`}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                         </div>

                         {isExpanded && (
                            <div className="mt-2 pt-3 border-t border-black/5 animate-in slide-in-from-top-2 duration-300">
                               <h5 className="text-[11px] font-bold text-[#424245] mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> 字段修改记录</h5>
                               {changes.length > 0 ? (
                                 <div className="space-y-1.5">
                                   {changes.map(c => (
                                     <div key={c.key} className="flex items-center text-xs bg-black/[0.03] px-3 py-2 rounded-lg"><span className="w-16 text-[#86868b] font-medium shrink-0">{c.label}</span><span className="text-red-500/70 line-through truncate flex-1 min-w-0 text-right" title={c.oldVal}>{c.oldVal}</span><ArrowRight className="w-3 h-3 text-[#86868b]/40 mx-2 shrink-0" /><span className="text-green-600 font-medium truncate flex-1 min-w-0" title={c.newVal}>{c.newVal}</span></div>
                                   ))}
                                 </div>
                               ) : (
                                 <div className="text-[11px] text-[#86868b] bg-black/[0.02] p-2 rounded-lg text-center">本次更新无实质性字段变动。</div>
                               )}
                            </div>
                          )}
                       </div>
                     </div>
                   )
                 })}
               </div>
            ) : (<div className="text-center text-sm text-[#86868b] bg-[#F9F9F9] py-6 rounded-xl border border-black/5 border-dashed">暂无历史操作日志</div>)}
          </div>
        )}

        <div className={`p-5 bg-white/40 flex ${hideAIButton ? 'justify-end' : 'justify-between'} border-t border-white/50 shrink-0`}>
          {!hideAIButton && (
            <button onClick={() => onAIAnalyze(details.building_room)} className="px-5 py-2.5 bg-gradient-to-r from-[#007AFF] to-[#0051e3] text-white rounded-xl font-medium hover:opacity-90 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95">
              <Sparkles className="w-4 h-4"/> 🧠 讓 AI 分析並草擬回覆
            </button>
          )}
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-black/10 text-[#1d1d1f] rounded-xl font-medium hover:bg-black/5 transition-colors">關閉</button>
        </div>
      </div>
    </div>
  );
}