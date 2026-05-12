import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chatAPI } from '../services/api';
import {
  setChats,
  setCurrentChat,
  setMessages,
  prependMessages,
  appendMessage,
  setPagination,
  updateChatLastMessage,
  setLoadingChats,
  setLoadingMessages,
  setSendingMessage,
  setError,
} from '../redux/slices/chatSlice';
import { Spinner, Badge } from '../components/common/UIComponents';
import {
  MessageSquare,
  Send,
  RefreshCw,
  FolderOpen,
  ChevronUp,
  Search,
  Plus,
  X,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const avatarChar = (name) => (name ? name.charAt(0).toUpperCase() : '?');

// ── Chat list item ────────────────────────────────────────────────────────────
const ChatListItem = ({ chat, isActive, onClick }) => (
  <button
    id={`chat-item-${chat._id}`}
    onClick={onClick}
    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0
      ${isActive ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
  >
    {/* Avatar */}
    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm
      ${chat.isProjectChat ? 'bg-gradient-to-br from-accent-500 to-accent-700' : 'bg-gradient-to-br from-primary-400 to-primary-600'}`}>
      {chat.isProjectChat ? <FolderOpen size={18} /> : avatarChar(chat.otherUser?.name)}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <p className="font-semibold text-gray-900 text-sm truncate">
          {chat.isProjectChat ? '📁 Project Chat' : (chat.otherUser?.name || 'Unknown')}
        </p>
        <span className="text-[10px] text-gray-400 shrink-0">{formatTime(chat.lastMessageAt)}</span>
      </div>
      <div className="flex items-center justify-between gap-1 mt-0.5">
        <p className="text-xs text-gray-500 truncate">
          {chat.lastMessage || 'No messages yet'}
        </p>
        {chat.isProjectChat && (
          <Badge variant="accent" className="text-[9px] shrink-0">Project</Badge>
        )}
      </div>
    </div>
  </button>
);

// ── Single message bubble ────────────────────────────────────────────────────
const MessageBubble = ({ msg, isOwn }) => (
  <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
    {!isOwn && (
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        ?
      </div>
    )}
    <div className={`max-w-[72%] px-3.5 py-2 rounded-2xl shadow-sm
      ${isOwn
        ? 'bg-gradient-brand text-white rounded-br-sm'
        : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'
      }`}
    >
      <p className={`text-sm leading-relaxed break-words ${isOwn ? 'text-white' : 'text-gray-900'}`}>
        {msg.content}
      </p>
      <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60 text-right' : 'text-gray-400'}`}>
        {formatTime(msg.sentAt)}
      </p>
    </div>
  </div>
);

// ── New Direct Chat modal ─────────────────────────────────────────────────────
const NewChatModal = ({ onClose, onChatCreated }) => {
  const [userId, setUserId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!userId.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await chatAPI.createDirectChat(userId.trim());
      onChatCreated(res.data?.chat);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start chat.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">New Direct Message</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Enter the User ID of the person you want to message. You can find this from their public profile URL.
        </p>
        <input
          id="new-chat-user-id-input"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Paste user ID…"
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-sm mb-3"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        {error && <p className="text-xs text-error mb-3">{error}</p>}
        <button
          id="create-direct-chat-btn"
          onClick={handleCreate}
          disabled={busy || !userId.trim()}
          className="w-full py-2.5 bg-gradient-brand text-white rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy ? <Spinner size="sm" /> : <MessageSquare size={15} />}
          Start Chat
        </button>
      </div>
    </div>
  );
};

// ── Main ChatPage ─────────────────────────────────────────────────────────────
const ChatPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const {
    chats,
    currentChat,
    messages,
    pagination,
    loadingChats,
    loadingMessages,
    sendingMessage,
    error,
  } = useSelector((s) => s.chats);

  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const inputRef = useRef(null);

  const userId = user?.id || user?._id;

  // ── Load chat list ──────────────────────────────────────────────────────────
  const loadChats = useCallback(async () => {
    dispatch(setLoadingChats(true));
    try {
      const res = await chatAPI.getMyChats();
      dispatch(setChats(res.data?.chats || []));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to load chats.'));
    } finally {
      dispatch(setLoadingChats(false));
    }
  }, [dispatch]);

  useEffect(() => { loadChats(); }, [loadChats]);

  // ── Load messages for selected chat ─────────────────────────────────────────
  const loadMessages = useCallback(async (chatId, page = 1, prepend = false) => {
    dispatch(setLoadingMessages(true));
    try {
      const res = await chatAPI.getChatById(chatId, page);
      const { messages: msgs, pagination: pag } = res.data;
      if (prepend) {
        dispatch(prependMessages(msgs));
      } else {
        dispatch(setMessages(msgs));
      }
      dispatch(setPagination(pag));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to load messages.'));
    } finally {
      dispatch(setLoadingMessages(false));
    }
  }, [dispatch]);

  // ── Select a chat ────────────────────────────────────────────────────────────
  const selectChat = useCallback((chat) => {
    dispatch(setCurrentChat(chat));
    loadMessages(chat._id, 1, false);
    setMobileSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [dispatch, loadMessages]);

  // ── Scroll to bottom on new messages ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Load more (older) messages ───────────────────────────────────────────────
  const loadMore = () => {
    if (!currentChat || !pagination.hasMore || loadingMessages) return;
    loadMessages(currentChat._id, pagination.page + 1, true);
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !currentChat || sendingMessage) return;

    const optimistic = {
      _id: `temp-${Date.now()}`,
      senderId: userId,
      content: trimmed,
      sentAt: new Date().toISOString(),
    };

    setInput('');
    dispatch(appendMessage(optimistic));
    dispatch(setSendingMessage(true));

    try {
      if (currentChat.isProjectChat) {
        await chatAPI.addProjectMessage(currentChat.projectChat?._id || currentChat._id, trimmed);
      } else {
        await chatAPI.addDirectMessage(currentChat._id, trimmed);
      }
      dispatch(updateChatLastMessage({
        chatId: currentChat._id,
        content: trimmed,
        sentAt: optimistic.sentAt,
      }));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Message failed to send.'));
    } finally {
      dispatch(setSendingMessage(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Filter chat list by search ───────────────────────────────────────────────
  const filteredChats = chats.filter((c) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const name = c.otherUser?.name?.toLowerCase() || '';
    const last = c.lastMessage?.toLowerCase() || '';
    return name.includes(q) || last.includes(q);
  });

  const directChats = filteredChats.filter((c) => !c.isProjectChat);
  const projectChats = filteredChats.filter((c) => c.isProjectChat);

  // ── "Start chat" from new-chat modal ────────────────────────────────────────
  const handleChatCreated = (newChat) => {
    loadChats();
    if (newChat) {
      selectChat({ _id: newChat._id, isProjectChat: false, otherUser: null });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col shrink-0 border-r border-gray-100 bg-white transition-all duration-300
          ${mobileSidebarOpen ? 'w-full md:w-80' : 'hidden md:flex md:w-80'}`}
      >
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary-500" /> Messages
            </h2>
            <div className="flex items-center gap-1">
              <button
                id="refresh-chats-btn"
                onClick={loadChats}
                disabled={loadingChats}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={15} className={loadingChats ? 'animate-spin' : ''} />
              </button>
              <button
                id="new-chat-btn"
                onClick={() => setShowNewChat(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="New direct message"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="chat-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats…"
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-gray-400">
              <MessageSquare size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start one by clicking the + button</p>
            </div>
          ) : (
            <>
              {/* Direct Chats */}
              {directChats.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Direct Messages
                  </p>
                  {directChats.map((chat) => (
                    <ChatListItem
                      key={chat._id}
                      chat={chat}
                      isActive={currentChat?._id === chat._id}
                      onClick={() => selectChat(chat)}
                    />
                  ))}
                </div>
              )}

              {/* Project Chats */}
              {projectChats.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Project Chats
                  </p>
                  {projectChats.map((chat) => (
                    <ChatListItem
                      key={chat._id}
                      chat={chat}
                      isActive={currentChat?._id === chat._id}
                      onClick={() => selectChat(chat)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ── Chat View ───────────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-w-0 ${mobileSidebarOpen ? 'hidden md:flex' : 'flex'}`}>
        {currentChat ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-100 shrink-0">
              {/* Mobile back button */}
              <button
                className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-white/60 transition-colors"
                onClick={() => setMobileSidebarOpen(true)}
              >
                ←
              </button>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0
                ${currentChat.isProjectChat ? 'bg-gradient-to-br from-accent-500 to-accent-700' : 'bg-gradient-brand'}`}>
                {currentChat.isProjectChat ? <FolderOpen size={16} /> : avatarChar(currentChat.otherUser?.name)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                  {currentChat.isProjectChat ? 'Project Chat' : (currentChat.otherUser?.name || 'Direct Message')}
                </p>
                <p className="text-xs text-gray-500 leading-tight truncate">
                  {currentChat.isProjectChat
                    ? `Status: ${currentChat.projectChat?.status || 'working'} · Payment: $${currentChat.projectChat?.payment || 0}`
                    : currentChat.otherUser?.role || ''}
                </p>
              </div>

              <button
                id="refresh-messages-btn"
                onClick={() => loadMessages(currentChat._id, 1, false)}
                disabled={loadingMessages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-white/60 transition-colors"
                title="Refresh messages"
              >
                <RefreshCw size={14} className={loadingMessages ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" ref={messagesTopRef}>
              {/* Load more button */}
              {pagination.hasMore && (
                <div className="flex justify-center pb-2">
                  <button
                    id="load-more-messages-btn"
                    onClick={loadMore}
                    disabled={loadingMessages}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-primary-600 bg-white border border-primary-200 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                  >
                    {loadingMessages
                      ? <><Spinner size="sm" /> Loading…</>
                      : <><ChevronUp size={13} /> Load older messages ({pagination.totalMessages - messages.length} more)</>
                    }
                  </button>
                </div>
              )}

              {/* Loading state for first load */}
              {loadingMessages && messages.length === 0 && (
                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
              )}

              {/* No messages */}
              {!loadingMessages && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-400">
                  <MessageSquare size={36} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1">Send a message to start the conversation!</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg._id || i}
                  msg={msg}
                  isOwn={String(msg.senderId) === String(userId)}
                />
              ))}

              {/* Error inline */}
              {error && (
                <div className="flex justify-center">
                  <p className="text-xs text-error bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  id="chat-message-input"
                  rows={1}
                  placeholder={`Message ${currentChat.isProjectChat ? 'project chat' : (currentChat.otherUser?.name || '')}…`}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={sendingMessage}
                  className="flex-1 resize-none overflow-hidden text-sm px-4 py-2.5 border-2 border-gray-200
                    rounded-xl focus:border-primary-500 focus:outline-none transition-colors
                    disabled:opacity-50 min-h-[44px] max-h-[120px] leading-relaxed"
                />
                <button
                  id="send-message-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || sendingMessage}
                  className="shrink-0 w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center
                    text-white shadow-sm disabled:opacity-40 hover:shadow-brand transition-all duration-200
                    disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {sendingMessage ? <Spinner size="sm" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6 bg-gray-50">
            <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand">
              <MessageSquare size={36} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Messages</h2>
              <p className="text-gray-500 text-sm mt-1 max-w-xs leading-relaxed">
                Select a conversation from the left, or start a new one by clicking the{' '}
                <span className="font-semibold text-primary-600">+</span> button.
              </p>
            </div>
            <button
              id="start-chat-empty-btn"
              onClick={() => setShowNewChat(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white rounded-xl font-semibold text-sm shadow-brand hover:shadow-lg transition-all"
            >
              <Plus size={16} /> New Message
            </button>
          </div>
        )}
      </main>

      {/* New chat modal */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onChatCreated={handleChatCreated}
        />
      )}
    </div>
  );
};

export default ChatPage;
