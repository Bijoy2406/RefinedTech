import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App.jsx';
import axios from 'axios';
import LottieLoading from './LottieLoading';
import '../css/Conversations.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

function Conversations() {
  const navigate = useNavigate();
  const { user, authLoading } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [isActiveTab, setIsActiveTab] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  useEffect(() => {
    // Wait for auth loading to complete before checking authentication
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Buyer' && user.role !== 'Seller') {
      navigate('/');
      return;
    }

    fetchConversations();
    
    // Set up intervals for real-time updates
    const conversationsInterval = setInterval(() => {
      if (isActiveTab) {
        fetchConversations();
      }
    }, 10000); // Refresh conversations every 10 seconds

    return () => {
      clearInterval(conversationsInterval);
    };
  }, [user, authLoading, navigate, isActiveTab]);

  // Handle browser tab visibility for optimized polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActiveTab(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Real-time message polling for active conversation
  useEffect(() => {
    let messageInterval;
    
    if (selectedConversation && isActiveTab) {
      messageInterval = setInterval(() => {
        fetchNewMessages(selectedConversation.id);
      }, 30); // Check for new messages every 3 seconds
    }

    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [selectedConversation, isActiveTab]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('rt_token');
      const response = await axios.get(`${API_BASE}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const token = localStorage.getItem('rt_token');
      const response = await axios.get(`${API_BASE}/api/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const messageData = response.data.messages.data || [];
        setMessages(messageData);
        setSelectedConversation(response.data.conversation);
        
        // Track the last message ID for polling
        if (messageData.length > 0) {
          setLastMessageId(messageData[messageData.length - 1].id);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch only new messages since the last known message
  const fetchNewMessages = async (conversationId) => {
    try {
      setConnectionStatus('connected');
      const token = localStorage.getItem('rt_token');
      const url = lastMessageId 
        ? `${API_BASE}/api/conversations/${conversationId}/messages?after=${lastMessageId}`
        : `${API_BASE}/api/conversations/${conversationId}/messages`;
        
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const newMessages = response.data.messages.data || [];
        
        if (newMessages.length > 0) {
          setMessages(prev => {
            // If we have lastMessageId, append new messages
            if (lastMessageId) {
              const filteredNew = newMessages.filter(msg => msg.id > lastMessageId);
              if (filteredNew.length > 0) {
                setLastMessageId(filteredNew[filteredNew.length - 1].id);
                return [...prev, ...filteredNew];
              }
              return prev;
            } else {
              // If no lastMessageId, replace all messages
              setLastMessageId(newMessages[newMessages.length - 1].id);
              return newMessages;
            }
          });
          
          // Also refresh conversations to update timestamps and unread counts
          fetchConversations();
        }
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
      setConnectionStatus('error');
      // Don't show error for background polling
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('rt_token');
      const response = await axios.post(
        `${API_BASE}/api/conversations/${selectedConversation.id}/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newMsg = response.data.data;
        setMessages(prev => [...prev, newMsg]);
        setLastMessageId(newMsg.id);
        setNewMessage('');
        
        // Refresh conversations to update last message time
        fetchConversations();
        
        // Auto-scroll to bottom
        setTimeout(() => {
          const messagesContent = document.querySelector('.messages-content');
          if (messagesContent) {
            messagesContent.scrollTop = messagesContent.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setLastMessageId(null); // Reset for new conversation
    fetchMessages(conversation.id);
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const messagesContent = document.querySelector('.messages-content');
    if (messagesContent && messages.length > 0) {
      messagesContent.scrollTop = messagesContent.scrollHeight;
    }
  }, [messages]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return <LottieLoading message="Loading conversations..." />;
  }

  return (
    <div className="conversations-container">
      <div className="conversations-header">
        <h1>💬 My Conversations</h1>
        <p>Messages with {user.role === 'Buyer' ? 'sellers' : 'buyers'} about products</p>
        <div className={`live-indicator ${connectionStatus === 'error' ? 'error' : connectionStatus === 'connecting' ? 'connecting' : ''}`}>
          <div className="live-dot"></div>
          {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No conversations yet</h3>
          <p>
            {user.role === 'Buyer' 
              ? 'Start chatting with sellers by visiting product pages and clicking "Contact Seller"'
              : 'Conversations will appear here when buyers contact you about your products'
            }
          </p>
        </div>
      ) : (
        <div className="conversations-layout">
          {/* Conversations List */}
          <div className="conversations-list">
            <h3>Conversations ({conversations.length})</h3>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="conversation-avatar">
                  <span>
                    {user.role === 'Buyer' 
                      ? (conversation.seller?.shop_username?.charAt(0) || 'S')
                      : (conversation.buyer?.username?.charAt(0) || 'B')
                    }
                  </span>
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>
                      {user.role === 'Buyer' 
                        ? (conversation.seller?.shop_username || 'Seller')
                        : (conversation.buyer?.username || 'Buyer')
                      }
                    </h4>
                    <span className="conversation-time">
                      {formatDate(conversation.last_message_at)}
                    </span>
                  </div>
                  <div className="conversation-product">
                    📦 {conversation.product?.title}
                  </div>
                  {conversation.latest_message?.[0] && (
                    <div className="conversation-preview">
                      {conversation.latest_message[0].message.substring(0, 50)}
                      {conversation.latest_message[0].message.length > 50 ? '...' : ''}
                    </div>
                  )}
                  {conversation.unread_count > 0 && (
                    <div className="unread-badge">{conversation.unread_count}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Messages Panel */}
          <div className="messages-panel">
            {selectedConversation ? (
              <>
                <div className="messages-header">
                  <div className="seller-info">
                    <div className="seller-avatar">
                      <span>
                        {user.role === 'Buyer' 
                          ? (selectedConversation.seller?.shop_username?.charAt(0) || 'S')
                          : (selectedConversation.buyer?.username?.charAt(0) || 'B')
                        }
                      </span>
                    </div>
                    <div>
                      <h3>
                        {user.role === 'Buyer' 
                          ? (selectedConversation.seller?.shop_username || 'Seller')
                          : (selectedConversation.buyer?.username || 'Buyer')
                        }
                      </h3>
                      <p>📦 {selectedConversation.product?.title}</p>
                    </div>
                  </div>
                </div>

                <div className="messages-content">
                  {messagesLoading ? (
                    <div className="loading">Loading messages...</div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender_type === (user.role === 'Buyer' ? 'buyer' : 'seller') ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.message}</p>
                          <span className="message-time">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  {sendingMessage && (
                    <div className="message sent sending">
                      <div className="message-content">
                        <p>{newMessage}</p>
                        <span className="message-time">Sending...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="message-input">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows="3"
                    maxLength="2000"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <div className="input-footer">
                    <small>{newMessage.length}/2000 characters</small>
                    <button
                      className="btn primary"
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                    >
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-conversation-selected">
                <div className="empty-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Conversations;