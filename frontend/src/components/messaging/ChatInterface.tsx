import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Info, Check, CheckCheck } from 'lucide-react';
import messagingService, { Message as ChatMessage } from '../../services/messagingService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ChatInterfaceProps {
  conversationId: string;
  otherParticipant: {
    name: string;
    avatar?: string;
    id: string;
    role?: string;
  };
  listingId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId, otherParticipant, listingId }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    setupRealTimeMessaging();
    return () => {
      // Cleanup real-time handlers
      messagingService.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupRealTimeMessaging = () => {
    messagingService.connect();

    // Handle new messages
    const unsubscribeMessage = messagingService.onNewMessage((message) => {
      if (message.conversation_id === conversationId) {
        setMessages(prev => [...prev, message]);
        // Mark as read if we're the receiver
        if (message.sender_id !== user?.user_id) {
          markMessageAsRead();
        }
      }
    });

    // Handle typing indicators
    const unsubscribeTyping = messagingService.onTyping((data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.isTyping);
      }
    });

    // Handle read receipts
    const unsubscribeReadReceipt = messagingService.onReadReceipt((data) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.sender_id === user?.user_id ? { ...msg, is_read: true } : msg
          )
        );
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeReadReceipt();
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageText: newMessage.trim(),
          messageType: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        
        // Send via real-time
        messagingService.sendMessage(conversationId, newMessage.trim(), otherParticipant.id, listingId);
        
        // Mark as read
        markMessageAsRead();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markMessageAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicators
    if (e.target.value.length > 0) {
      messagingService.startTyping(conversationId, otherParticipant.id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        messagingService.stopTyping(conversationId, otherParticipant.id);
      }, 1000);
    } else {
      messagingService.stopTyping(conversationId, otherParticipant.id);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      toast.success('File upload feature coming soon!');
    }
  };

  const isOwnMessage = (message: ChatMessage) => message.sender_id === user?.user_id;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Chat Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {otherParticipant.avatar ? (
                <img 
                  src={otherParticipant.avatar} 
                  alt={otherParticipant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                otherParticipant.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{otherParticipant.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {otherParticipant.role === 'owner' ? 'Property Owner' : 'Tenant'}
              </span>
              <span className="text-green-500 text-xs">● Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Info className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.message_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                  {!isOwnMessage(message) && (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {message.sender_avatar ? (
                        <img 
                          src={message.sender_avatar} 
                          alt={message.sender_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        message.sender_name.charAt(0).toUpperCase()
                      )}
                    </div>
                  )}
                  
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      isOwnMessage(message)
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.message_text}</p>
                    <div className={`flex items-center justify-between mt-2 space-x-2 ${
                      isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {formatTime(message.created_at)}
                      </span>
                      {isOwnMessage(message) && (
                        <div className="flex items-center space-x-1">
                          {message.is_read ? (
                            <CheckCheck className="w-4 h-4 text-blue-200" />
                          ) : (
                            <Check className="w-4 h-4 text-blue-200" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-gray-500">typing...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={sendMessage} 
        className="p-4 border-t border-gray-200 bg-white shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
      </motion.form>
    </div>
  );
};

export default ChatInterface;
