import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleChat,
  closeChat,
  addUserMessage,
  addAssistantMessage,
  setLoading,
  setError,
  clearError,
  clearHistory,
} from '../../redux/slices/agentSlice';
import { agentAPI } from '../../services/api';
import { Spinner } from './UIComponents';
import {
  Bot,
  X,
  Send,
  Trash2,
  Sparkles,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

// ── Markdown-lite renderer ──────────────────────────────────────────────────
// Converts **bold**, *italic*, and bullet lists from the AI response to JSX.
const renderMarkdown = (text) => {
  const lines = text.split('\n');
  const result = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      result.push(
        <ul key={`ul-${key++}`} className="list-disc list-inside space-y-0.5 my-1 pl-1">
          {listItems.map((li, i) => (
            <li key={i} className="text-sm leading-relaxed">{inlineStyles(li)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const inlineStyles = (str) => {
    // bold **text** and *italic*
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (/^[-•*]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-•*]\s+/, ''));
    } else {
      flushList();
      if (trimmed !== '') {
        result.push(
          <p key={key++} className="text-sm leading-relaxed">
            {inlineStyles(trimmed)}
          </p>
        );
      } else {
        result.push(<div key={key++} className="h-1" />);
      }
    }
  });
  flushList();
  return result;
};

// ── Single message bubble ────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-end gap-2 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center shadow-sm">
          <Bot size={14} className="text-white" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-gray-900 shadow-sm space-y-1 ${
          isUser
            ? 'bg-gradient-brand text-white rounded-br-sm'
            : 'bg-white border border-gray-100 rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed text-white">{message.content}</p>
        ) : (
          <div className="space-y-1">{renderMarkdown(message.content)}</div>
        )}
      </div>
    </div>
  );
};

// ── Thinking indicator ───────────────────────────────────────────────────────
const ThinkingIndicator = () => (
  <div className="flex items-end gap-2 animate-fade-in">
    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center shadow-sm">
      <Bot size={14} className="text-white" />
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// ── Welcome screen shown before first message ────────────────────────────────
const WelcomeScreen = ({ userName, role }) => (
  <div className="flex flex-col items-center justify-center h-full gap-4 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand">
      <Sparkles size={30} className="text-white" />
    </div>
    <div>
      <h3 className="font-bold text-gray-900 text-lg">
        Hi{userName ? `, ${userName}` : ''}! 👋
      </h3>
      <p className="text-gray-500 text-sm mt-1 leading-relaxed">
        I'm your Sponsorly AI assistant.
        {role === 'creator'
          ? ' Ask me about finding sponsors, campaign strategy, or pricing your work.'
          : role === 'sponsor'
          ? ' Ask me about discovering creators, campaign management, or ROI optimisation.'
          : ' Ask me anything about sponsorships and creator partnerships.'}
      </p>
    </div>
    <div className="flex flex-wrap justify-center gap-2">
      {(role === 'creator'
        ? ['How do I find sponsors?', 'How to price my rate?', 'Best campaign tags?']
        : role === 'sponsor'
        ? ['How to find the right creator?', 'What budget should I set?', 'How to write a brief?']
        : ['How does Sponsorly work?', 'Creator vs Sponsor?', 'What are campaigns?']
      ).map((hint) => (
        <SuggestionChip key={hint} label={hint} />
      ))}
    </div>
  </div>
);

// Small clickable chip (exported via prop drilling to avoid context)
const SuggestionChip = ({ label, onClick }) => (
  <button
    id={`ai-suggestion-${label.replace(/\s+/g, '-').toLowerCase()}`}
    onClick={onClick}
    className="text-xs px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors font-medium"
  >
    {label}
  </button>
);

// ── Main floating widget ─────────────────────────────────────────────────────
const AIChatBubble = () => {
  const dispatch = useDispatch();
  const { messages, isLoading, error, isOpen } = useSelector((s) => s.agent);
  const { user } = useSelector((s) => s.auth);

  const [input, setInput] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatPanelRef = useRef(null);

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // ── Focus input when panel opens ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // ── Click-outside to close ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        chatPanelRef.current &&
        !chatPanelRef.current.contains(e.target) &&
        !e.target.closest('#ai-chat-toggle-btn')
      ) {
        dispatch(closeChat());
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, dispatch]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || isLoading) return;

      setInput('');
      dispatch(clearError());
      dispatch(addUserMessage(trimmed));
      dispatch(setLoading(true));

      try {
        const res = await agentAPI.sendMessage(trimmed);
        dispatch(addAssistantMessage(res.data?.reply || "I couldn't generate a response. Please try again."));
      } catch (err) {
        dispatch(
          setError(
            err.response?.data?.message || 'Something went wrong. Please try again.'
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [input, isLoading, dispatch]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Clear history ─────────────────────────────────────────────────────────
  const handleClearHistory = async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
      return;
    }
    setClearConfirm(false);
    try {
      await agentAPI.clearHistory();
      dispatch(clearHistory());
    } catch {
      dispatch(setError('Failed to clear history.'));
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      <div
        ref={chatPanelRef}
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] max-w-[420px] flex flex-col
          bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
        style={{ height: isOpen ? '520px' : '0' }}
        role="dialog"
        aria-modal="true"
        aria-label="Sponsorly AI Assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-brand text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Sponsorly AI</p>
              <p className="text-white/70 text-xs leading-tight">
                {isLoading ? 'Thinking…' : 'Always here to help'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasMessages && (
              <button
                id="ai-clear-history-btn"
                onClick={handleClearHistory}
                title={clearConfirm ? 'Click again to confirm' : 'Clear chat history'}
                className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1
                  ${clearConfirm ? 'bg-red-500/80 text-white' : 'hover:bg-white/20 text-white/80'}`}
              >
                <Trash2 size={14} />
                {clearConfirm && <span className="text-xs font-medium">Confirm?</span>}
              </button>
            )}
            <button
              id="ai-chat-close-btn"
              onClick={() => dispatch(closeChat())}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80"
              aria-label="Close AI chat"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
          {!hasMessages ? (
            <WelcomeScreen userName={user?.name} role={user?.role} />
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          {isLoading && <ThinkingIndicator />}

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 animate-fade-in">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips — only shown when no messages yet */}
        {!hasMessages && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {(user?.role === 'creator'
              ? ['How do I find sponsors?', 'How to price my rate?']
              : user?.role === 'sponsor'
              ? ['How to find the right creator?', 'What budget should I set?']
              : ['How does Sponsorly work?']
            ).map((hint) => (
              <SuggestionChip key={hint} label={hint} onClick={() => sendMessage(hint)} />
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              id="ai-chat-input"
              rows={1}
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // auto-grow textarea
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 resize-none overflow-hidden text-sm px-3 py-2 border-2 border-gray-200
                rounded-xl focus:border-primary-500 focus:outline-none transition-colors
                disabled:opacity-50 min-h-[40px] max-h-[100px] leading-relaxed"
            />
            <button
              id="ai-chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center
                text-white shadow-sm disabled:opacity-40 hover:shadow-brand transition-all duration-200
                disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isLoading ? <Spinner size="sm" className="border-white/40 border-t-white" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
            AI may make mistakes — use your judgment.
          </p>
        </div>
      </div>

      {/* ── Floating Trigger Button ───────────────────────────────────────── */}
      <button
        id="ai-chat-toggle-btn"
        onClick={() => dispatch(toggleChat())}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        className={`fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'bg-gradient-dark rotate-0' : 'bg-gradient-brand rotate-0'}`}
      >
        <div className="relative">
          {isOpen ? (
            <X size={22} className="text-white transition-transform duration-200" />
          ) : (
            <Bot size={24} className="text-white transition-transform duration-200" />
          )}
          {/* Pulse ring when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-primary-400 opacity-30 animate-ping" />
          )}
        </div>
      </button>
    </>
  );
};

export default AIChatBubble;
