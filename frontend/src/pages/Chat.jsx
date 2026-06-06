import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Bot, 
  User, 
  Sparkles,
  Search,
  ChevronLeft
} from 'lucide-react';

const Chat = () => {
  const { getAuthHeaders } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/ai/conversations', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convoId) => {
    try {
      const response = await fetch(`/api/ai/conversations/${convoId}/messages`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvo) {
      fetchMessages(activeConvo._id);
    } else {
      setMessages([]);
    }
  }, [activeConvo]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCreateConvo = async () => {
    try {
      const response = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: 'New Conversation' })
      });
      const data = await response.json();
      if (data.success) {
        setConversations([data.conversation, ...conversations]);
        setActiveConvo(data.conversation);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleDeleteConvo = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat history?')) return;

    try {
      const response = await fetch(`/api/ai/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setConversations(conversations.filter(c => c._id !== id));
        if (activeConvo?._id === id) {
          setActiveConvo(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const messageContent = inputText;
    setInputText('');
    setLoading(true);

    // Optimistic UI update
    const tempUserMessage = {
      _id: 'temp-' + Date.now(),
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          conversationId: activeConvo?._id,
          content: messageContent
        })
      });
      const data = await response.json();
      if (data.success) {
        // Replace temp messages with actual models
        setMessages(prev => prev.filter(m => !m._id.toString().startsWith('temp')));
        setMessages(prev => [...prev, data.userMessage, data.aiMessage]);
        
        // Update convo list if it was a new chat
        if (!activeConvo) {
          setConversations([data.conversation, ...conversations]);
          setActiveConvo(data.conversation);
        } else {
          // Move active convo to top and update title if needed
          setConversations(prev => {
            const updated = prev.filter(c => c._id !== data.conversation._id);
            return [data.conversation, ...updated];
          });
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to format code blocks and text
  const renderMessageContent = (content) => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex} className="whitespace-pre-line leading-relaxed">
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add code block
      const lang = match[1] || 'code';
      const code = match[2];
      parts.push(
        <div key={match.index} className="my-4 rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 shadow-inner">
          <div className="bg-slate-900 px-4 py-2 text-xs text-slate-400 flex items-center justify-between border-b border-white/5 uppercase font-mono font-semibold">
            <span>{lang}</span>
          </div>
          <pre className="p-4 text-sm font-mono overflow-x-auto text-emerald-300 bg-black/40">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={lastIndex} className="whitespace-pre-line leading-relaxed">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-line">{content}</span>;
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden h-[calc(100vh-140px)] flex border border-white/5 relative">
      {/* Sidebar Panel */}
      <div className={`
        ${sidebarOpen ? 'w-80' : 'w-0'} 
        shrink-0 bg-[#0c0d14] border-r border-white/5 flex flex-col transition-all duration-300 overflow-hidden
        absolute inset-y-0 left-0 z-20 md:static md:h-full
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-2">
          <button
            onClick={handleCreateConvo}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brandPurple to-brandViolet hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/10"
          >
            <Plus size={16} />
            New Assistant Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all"
            />
          </div>
        </div>

        {/* Convo List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <div
                key={convo._id}
                onClick={() => {
                  setActiveConvo(convo);
                  // Close on mobile
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-sm font-medium transition-all
                  ${activeConvo?._id === convo._id
                    ? 'bg-brandPurple/15 text-indigo-300 border border-brandPurple/20 shadow-md shadow-brandPurple/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <MessageSquare size={16} className={activeConvo?._id === convo._id ? 'text-indigo-400' : 'text-slate-500'} />
                  <span className="truncate">{convo.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConvo(convo._id, e)}
                  className="p-1 rounded hover:bg-white/15 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0e0f18]/40 overflow-hidden relative h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0d0e15]/60 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <ChevronLeft size={20} className={`transform transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
            </button>
            <div>
              <h3 className="font-bold text-white text-base truncate">
                {activeConvo ? activeConvo.title : 'AI Chat Workspace'}
              </h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium tracking-wide">
                <Sparkles size={10} className="text-indigo-400" />
                POWERED BY OPENAI GPT-4O-MINI
              </p>
            </div>
          </div>
        </div>

        {/* Message Window */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!activeConvo && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brandPurple to-brandViolet flex items-center justify-center text-white text-2xl shadow-lg ring-4 ring-indigo-500/10">
                🤖
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Ask Antigravity Assistant</h3>
                <p className="text-slate-400 text-sm">
                  How can I help you today? Send a message to start a new thread. Ask for code, layout explanations, copy rewrites, or database analysis.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => {
                    setInputText('Write an Express JS route handling file deletion from MongoDB');
                    handleCreateConvo();
                  }}
                  className="p-4 text-left rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brandPurple/30 transition-all text-xs font-medium text-slate-300"
                >
                  💡 Route for File Deletion
                </button>
                <button 
                  onClick={() => {
                    setInputText('Explain the difference between JWT and Session-based Authentication');
                    handleCreateConvo();
                  }}
                  className="p-4 text-left rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brandPurple/30 transition-all text-xs font-medium text-slate-300"
                >
                  💡 JWT vs Session auth differences
                </button>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div 
                key={m._id} 
                className={`flex gap-4 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shrink-0 shadow font-semibold
                  ${m.role === 'user' 
                    ? 'bg-indigo-600' 
                    : 'bg-gradient-to-tr from-brandPurple to-brandViolet border border-indigo-400/20'
                  }
                `}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Content Panel */}
                <div className={`px-5 py-3.5 rounded-2xl border text-sm max-w-full overflow-hidden shadow-md
                  ${m.role === 'user'
                    ? 'bg-indigo-600/15 border-indigo-500/20 text-indigo-100 rounded-tr-none'
                    : 'bg-[#0f111a] border-white/5 text-slate-200 rounded-tl-none'
                  }
                `}>
                  {renderMessageContent(m.content)}
                  <span className="text-[9px] text-slate-500 block mt-2 text-right">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* AI Reply loader */}
          {loading && (
            <div className="flex gap-4 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brandPurple to-brandViolet flex items-center justify-center text-white shrink-0 shadow">
                <Bot size={14} />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-[#0f111a] border border-white/5 text-slate-300 rounded-tl-none shadow-md flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#0d0e15]/40 flex gap-3 items-center">
          <input
            type="text"
            placeholder={loading ? 'Please wait for reply...' : 'Type your prompt message...'}
            disabled={loading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all disabled:opacity-50 text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-brandPurple to-brandViolet hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
