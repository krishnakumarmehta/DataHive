import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { ChatEngine, getWelcomeMessage } from '../../utils/chatEngine';
import { Bot, X, Send, Sparkles, RotateCcw } from 'lucide-react';
import './ChatWidget.css';

const QUICK_PROMPTS = [
  'Business ka summary batao',
  'Kitne products hain?',
  'Pending orders dikhao',
  'Top customers kaun hain?',
  'Is mahine ki sales?',
  'Out of stock products',
];

const ChatWidget = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const { user }    = useAuth();
  const business    = useBusiness();

  // Keep a SINGLE engine instance alive for the component lifetime.
  // We call engine.update() before every response so it always has the latest data.
  const engineRef = useRef(null);
  if (!engineRef.current) {
    engineRef.current = new ChatEngine(
      { products: [], orders: [], customers: [], salesData: [], documents: [] },
      user
    );
  }

  // welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1, role: 'assistant',
        content: getWelcomeMessage(user?.name, user?.businessName),
        time: new Date(),
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback((text) => {
    if (!text?.trim()) return;

    // ✅ Inject freshest data RIGHT BEFORE generating response
    engineRef.current.update(
      {
        products:  business.products,
        orders:    business.orders,
        customers: business.customers,
        salesData: business.salesData,
        documents: business.documents,
      },
      user
    );

    const userMsg = { id: Date.now(), role: 'user', content: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // simulate a brief thinking delay
    const delay = 350 + Math.random() * 500;
    setTimeout(async () => {
      try {
        const response = await engineRef.current.getResponse(text.trim());
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant', content: response, time: new Date(),
        }]);
      } catch (error) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant', content: "⚠️ AI service error. Please check your API key.", time: new Date(),
        }]);
      }
      setIsTyping(false);
    }, delay);
  }, [business, user]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(), role: 'assistant',
      content: getWelcomeMessage(user?.name, user?.businessName),
      time: new Date(),
    }]);
  };

  // Render **bold** and *italic* markdown + line breaks
  const formatContent = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');

  const showQuickPrompts = messages.length <= 1;

  const apiKey = user?.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  const isAIActive = !!apiKey;

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button className="chat-fab" onClick={() => setIsOpen(true)}
          id="chat-widget-button" aria-label="Open AI Chat Assistant">
          <div className="chat-fab-inner"><Bot size={26} /></div>
          <span className="chat-fab-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window" id="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                <Bot size={20} />
                <span className="chat-online-dot"></span>
              </div>
              <div>
                <h3>DataHive AI</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <Sparkles size={11} style={{ color: isAIActive ? '#34d399' : 'var(--text-secondary)' }} />
                  <span>{user?.businessName || 'Business'} Assistant</span>
                  <span className={`badge ${isAIActive ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', cursor: 'default' }}>
                    {isAIActive ? 'Gemini Active' : 'Demo Mode'}
                  </span>
                </p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="chat-close-btn" onClick={clearChat} title="Clear chat">
                <RotateCcw size={15} />
              </button>
              <button className="chat-close-btn" onClick={() => setIsOpen(false)} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-msg-avatar"><Bot size={14} /></div>
                )}
                <div className="chat-msg-bubble">
                  <div className="chat-msg-content"
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                  <span className="chat-msg-time">
                    {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message assistant">
                <div className="chat-msg-avatar"><Bot size={14} /></div>
                <div className="chat-msg-bubble typing">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts — shown only at start */}
          {showQuickPrompts && (
            <div className="chat-quick-prompts">
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} className="quick-prompt-btn" onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kisi customer/product ka naam ya koi bhi sawal..."
              className="chat-input"
              id="chat-input"
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              id="chat-send-btn"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
