import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Input, Spinner } from '../components/common/UIComponents';
import { Send, MessageSquare } from 'lucide-react';

const ChatPage = () => {
  const { user } = useSelector(state => state.auth);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    
    try {
      // API call to send message
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Chat List */}
      <div className="md:col-span-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedChat?._id === chat._id
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <p className="font-semibold text-gray-900">{chat.otherUser?.name}</p>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-600">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p>No chats yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary-50 to-secondary-50">
              <h3 className="font-bold text-gray-900">{selectedChat.otherUser?.name}</h3>
              <p className="text-sm text-gray-600">{selectedChat.otherUser?.role}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages?.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === user._id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || loading}
                className="flex items-center gap-2"
              >
                {loading ? <Spinner size="sm" /> : <Send size={20} />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
