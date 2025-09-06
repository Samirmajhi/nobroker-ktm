import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ChatInterface from '../components/messaging/ChatInterface';
import NewConversationButton from '../components/messaging/NewConversationButton';
import { MessageSquare, Search, Plus } from 'lucide-react';

interface Conversation {
  conversation_id: string;
  listing_id: string;
  listing_title: string;
  listing_price: number;
  other_participant_name: string;
  other_participant_id: string;
  other_participant_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  last_message_sender_id?: string;
  unread_count: number;
}

const MessagesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listing_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a conversation about a property</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.conversation_id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation?.conversation_id === conversation.conversation_id
                          ? 'bg-blue-50 border-r-2 border-blue-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          {conversation.other_participant_avatar ? (
                            <img
                              src={conversation.other_participant_avatar}
                              alt={conversation.other_participant_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 font-medium">
                              {conversation.other_participant_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.other_participant_name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatLastMessageTime(conversation.last_message_time)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.listing_title}
                          </p>
                          {conversation.last_message && (
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {conversation.last_message_sender_id === user?.user_id ? 'You: ' : ''}
                              {conversation.last_message}
                            </p>
                          )}
                          {conversation.unread_count > 0 && (
                            <div className="flex justify-end mt-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
                          {selectedConversation ? (
                <ChatInterface
                  conversationId={selectedConversation.conversation_id}
                  otherParticipant={{
                    name: selectedConversation.other_participant_name,
                    avatar: selectedConversation.other_participant_avatar,
                    id: selectedConversation.other_participant_id
                  }}
                  listingId={selectedConversation.listing_id}
                />
              ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <NewConversationButton />
    </div>
  );
};

export default MessagesPage;
