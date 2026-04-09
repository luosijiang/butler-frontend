import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Upload, User, CheckCircle, Sparkles, Lock, ArrowRight, 
  MessageSquare, Settings, LogOut, Plus, X, FileText, AlertTriangle, Search,
  Shield, Trash2, Loader2, Bell, Moon, PanelLeft, Wrench, Edit, Activity, DollarSign,
  ChevronDown, ChevronUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import OwnerRecordForm from './OwnerRecordForm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import ThinkingIndicator from './components/ThinkingIndicator';
import AdminAuthModal from './components/AdminAuthModal';
import OwnerDetailModal from './components/OwnerDetailModal';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import RepairManagePage from './pages/RepairManagePage';
import OwnerDynamicsPage from './pages/OwnerDynamicsPage';
import FinanceManagePage from './pages/FinanceManagePage';
import request from './utils/request';
import useDebounce from './useDebounce';

// 优先读取 Vercel 的环境变量，如果没有则回退到本地地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

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
  
  // --- 控制更多菜单的展开与收起 ---
  const [showMoreMenus, setShowMoreMenus] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // --- 新增：全域搜尋與目標房號狀態 ---
  const [globalSelectedRecord, setGlobalSelectedRecord] = useState(null);
  const [activeTargetRoom, setActiveTargetRoom] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const debouncedSearch = useDebounce(globalSearch, 400); // 增加 400ms 防抖
  const [searchDropdown, setSearchDropdown] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showContextWarning, setShowContextWarning] = useState(false); // 新增：上下文超载警告状态
  const [systemStatus, setSystemStatus] = useState('checking'); // 新增：系统连接真实状态

  // --- 新增：全局监听登录过期事件 ---
  useEffect(() => {
    const handleAuthExpired = () => handleLogout();
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const checkSystemStatus = async (isManual = false) => {
    if (isManual) setSystemStatus('checking');
    try {
      await request.get('/api/system/status');
      setSystemStatus('normal');
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setSystemStatus('expired');
      } else {
        setSystemStatus('disconnected');
      }
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
      request.post('/api/history/sync', [activeChat])
        .catch(err => console.error("自动保存失败:", err));
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
    try {
      const data = await request.get('/api/stats/overview');
      setCurrentUser(prev => ({ 
        ...prev, 
        pending: data.pending ?? 0, 
        completed: data.completed ?? 0,
        recentPending: data.recent_pending || []
      }));
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

  const handleGlobalSearchChange = (e) => {
    setGlobalSearch(e.target.value);
  };

  // 监听防抖后的值，控制网络请求
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setShowSearchDropdown(false);
      setSearchDropdown([]);
      return;
    }
    setShowSearchDropdown(true);
    setIsSearching(true);
    
    request.get(`/api/records/search?q=${encodeURIComponent(debouncedSearch)}`)
      .then(data => setSearchDropdown(data.records || []))
      .catch(err => console.error(err))
      .finally(() => setIsSearching(false));
  }, [debouncedSearch]);

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
        setMessages(prev => [...prev, { role: 'ai', content: '⚠️ **AI 引擎未能生成有效回复**\n可能是由于多轮对话导致上下文过长，模型自动中断了生成。建议您点击左侧的【新建对话】来清理历史记忆。' }]);
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
        
        <div className="p-4 border-t border-black/5 flex flex-col gap-1.5">
           <button onClick={() => { setMode('chat'); if (window.innerWidth <= 768) setIsSidebarOpen(false); }} 
             className={`flex items-center gap-3 text-sm transition-all duration-300 w-full px-4 py-3 rounded-xl ${mode === 'chat' ? 'bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#007AFF] font-bold border border-white/60' : 'text-[#424245] hover:bg-white/50 border border-transparent'}`}>
             <MessageSquare className="w-4 h-4" /> AI 档案分析
           </button>
           <button onClick={() => { setMode('upload'); if (window.innerWidth <= 768) setIsSidebarOpen(false); }} 
             className={`flex items-center gap-3 text-sm transition-all duration-300 w-full px-4 py-3 rounded-xl ${mode === 'upload' ? 'bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#007AFF] font-bold border border-white/60' : 'text-[#424245] hover:bg-white/50 border border-transparent'}`}>
             <Upload className="w-4 h-4" /> 信息录入
           </button>

           <div className={`flex flex-col gap-1.5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showMoreMenus || ['repair_manage', 'owner_dynamics', 'finance', 'admin'].includes(mode) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
               <button onClick={() => { setTargetRepairRoom(null); setMode('repair_manage'); if (window.innerWidth <= 768) setIsSidebarOpen(false); }} 
                 className={`flex items-center gap-3 text-sm transition-all duration-300 w-full px-4 py-3 rounded-xl ${mode === 'repair_manage' ? 'bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-orange-600 font-bold border border-white/60' : 'text-[#424245] hover:bg-white/50 border border-transparent'}`}>
                 <Wrench className="w-4 h-4" /> 报修管理
               </button>
               <button onClick={() => { setMode('owner_dynamics'); if (window.innerWidth <= 768) setIsSidebarOpen(false); }} 
                 className={`flex items-center gap-3 text-sm transition-all duration-300 w-full px-4 py-3 rounded-xl ${mode === 'owner_dynamics' ? 'bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#007AFF] font-bold border border-white/60' : 'text-[#424245] hover:bg-white/50 border border-transparent'}`}>
                 <Activity className="w-4 h-4" /> 业主动态
               </button>
               <button onClick={() => { setMode('finance'); if (window.innerWidth <= 768) setIsSidebarOpen(false); }} 
                 className={`flex items-center gap-3 text-sm transition-all duration-300 w-full px-4 py-3 rounded-xl ${mode === 'finance' ? 'bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-emerald-600 font-bold border border-white/60' : 'text-[#424245] hover:bg-white/50 border border-transparent'}`}>
                 <DollarSign className="w-4 h-4" /> 财务概览
               </button>
               <button onClick={() => { setShowAdminAuth(true); if (window.innerWidth <= 768) setIsSidebarOpen(false); }} 
                 className={`flex items-center gap-3 text-sm transition-all duration-300 w-full px-4 py-3 rounded-xl ${mode === 'admin' ? 'bg-white/80 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#007AFF] font-bold border border-white/60' : 'text-[#424245] hover:bg-white/50 border border-transparent'}`}>
                 <FileText className="w-4 h-4" /> 后台记录
               </button>
           </div>

           {!['repair_manage', 'owner_dynamics', 'finance', 'admin'].includes(mode) && (
             <button onClick={() => setShowMoreMenus(!showMoreMenus)} className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#86868b] hover:text-[#007AFF] hover:bg-[#007AFF]/5 py-2 rounded-lg transition-all mx-2 mt-1">
               {showMoreMenus ? <>收起更多 <ChevronUp className="w-3.5 h-3.5" /></> : <>展开更多 <ChevronDown className="w-3.5 h-3.5" /></>}
             </button>
           )}

           <div className="pt-2 mt-1 border-t border-black/5">
             <button 
               onClick={() => setShowSettings(true)}
               className="flex items-center gap-3 text-sm text-[#424245] hover:text-[#1d1d1f] transition-all duration-300 w-full px-4 py-3 rounded-xl hover:bg-white/40 border border-transparent"
             >
               <Settings className="w-4 h-4" /> 系统设置
             </button>
           </div>
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
             {mode === 'chat' ? 'AI 档案分析' : mode === 'upload' ? '信息录入' : mode === 'repair_manage' ? '工单报修管理' : mode === 'owner_dynamics' ? '全局业主动态' : mode === 'finance' ? '财务概览' : '后台记录管理'}
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

            {messages.map((msg, idx) => {
              let isThinking = false;
              let finalContent = msg.content;
              let hasClosedThink = false;
              if (msg.role === 'ai' && msg.content && typeof msg.content === 'string') {
                 if (msg.content.includes('<think>')) {
                    const thinkStartIndex = msg.content.indexOf('<think>');
                    const thinkEndIndex = msg.content.indexOf('</think>');
                    if (thinkEndIndex !== -1) {
                         finalContent = msg.content.substring(thinkEndIndex + 8).trim();
                         hasClosedThink = true;
                    } else {
                         isThinking = true;
                         finalContent = ''; 
                    }
                 }
              }
              
              return (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                {msg.role === 'ai' && !isThinking && (
                  <div className="w-8 h-8 rounded-full bg-[#F2F2F7] flex items-center justify-center mr-2 shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-[#86868b]"/>
                  </div>
                )}
                
                {isThinking ? (
                    <div className="w-full pl-2">
                        <ThinkingIndicator targetRoom={activeTargetRoom} />
                    </div>
                ) : (
                    <div className={`max-w-[85%] sm:max-w-[75%] break-words px-5 py-3.5 rounded-3xl text-[15px] interactive-bubble animate-pop-in ${
                      msg.role === 'user'
                        ? 'chat-bubble-user rounded-br-sm' 
                        : 'chat-bubble-ai rounded-bl-sm'
                    }`}>
                      {hasClosedThink ? (
                          <>
                             <div className="text-xs text-[#86868b] mb-3 flex items-center gap-1.5 opacity-80 border-b border-black/5 pb-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> 深度推理完成</div>
                             {renderMessageContent(finalContent, false, idx)}
                          </>
                      ) : (
                          renderMessageContent(finalContent, msg.role === 'user', idx)
                      )}
                    </div>
                )}
              </div>
            )})}
            
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
          ) : mode === 'finance' ? (
            <FinanceManagePage />
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