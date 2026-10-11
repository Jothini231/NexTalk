import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useWebSocket from '../context/WebSocketContext';
import OnlineStatus from '../components/OnlineStatus';
import api from '../api/axios';

const getAvatarUrl = (fullName, username) => {
  const name = fullName || username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5E9&color=fff&bold=true&size=128`;
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateDivider = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const ChatPage = () => {
  const { user: currentUser } = useAuth();
  const { connected, sendMessage, addMessageListener, addReadReceiptListener } = useWebSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserIdParam = searchParams.get('userId');

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // If URL has ?userId=123, fetch that user's profile and set them active
  useEffect(() => {
    if (!targetUserIdParam) return;
    const targetId = Number(targetUserIdParam);

    const selectUserFromParam = async () => {
      try {
        const userRes = await api.get(`/users/${targetId}`);
        const userData = userRes.data;
        // If chatting with yourself, always reflect current online state
        if (userData.id === currentUser?.id) {
          userData.isOnline = true;
        } else {
          userData.isOnline = Boolean(userData.isOnline);
        }
        setActiveUser(userData);
      } catch (err) {
        console.error('Failed to load target user', err);
      }
    };

    selectUserFromParam();
  }, [targetUserIdParam, currentUser?.id]);

  // When activeUser changes, fetch conversation history
  useEffect(() => {
    if (!activeUser?.id) {
      setMessages([]);
      return;
    }

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/messages/${activeUser.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load message history', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [activeUser?.id]);

  // Scroll on message change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket incoming message handler
  useEffect(() => {
    const unsubscribe = addMessageListener((newMsg) => {
      // If belongs to the currently opened conversation
      if (
        activeUser &&
        (newMsg.senderId === activeUser.id || newMsg.recipientId === activeUser.id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Update conversations sidebar thread preview
      setConversations((prev) => {
        const otherId =
          newMsg.senderId === currentUser?.id ? newMsg.recipientId : newMsg.senderId;
        const otherUsername =
          newMsg.senderId === currentUser?.id
            ? newMsg.recipientUsername
            : newMsg.senderUsername;
        const otherFullName =
          newMsg.senderId === currentUser?.id
            ? newMsg.recipientFullName
            : newMsg.senderFullName;
        const otherAvatar =
          newMsg.senderId === currentUser?.id
            ? newMsg.recipientAvatarUrl
            : newMsg.senderAvatarUrl;

        const filtered = prev.filter((c) => c.otherUserId !== otherId);
        return [
          {
            otherUserId: otherId,
            otherUsername: otherUsername,
            otherFullName: otherFullName,
            otherAvatarUrl: otherAvatar,
            otherUserOnline: true,
            lastMessage: newMsg.content,
            lastMessageTimestamp: newMsg.timestamp,
            lastMessageSenderId: newMsg.senderId,
          },
          ...filtered,
        ];
      });
    });

    return () => unsubscribe();
  }, [addMessageListener, activeUser, currentUser?.id]);

  // WebSocket read receipt listener (updates ticks in real time)
  useEffect(() => {
    if (!addReadReceiptListener) return;
    const unsubscribe = addReadReceiptListener((receipt) => {
      if (activeUser && receipt.readerId === activeUser.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUser?.id ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    return () => unsubscribe();
  }, [addReadReceiptListener, activeUser, currentUser?.id]);

  // Send message handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser) return;

    const content = inputText.trim();
    setInputText('');

    const sentViaWs = sendMessage(activeUser.id, content);

    // REST fallback if WebSocket is temporarily disconnected
    if (!sentViaWs) {
      try {
        const res = await api.post('/messages', {
          recipientId: activeUser.id,
          content,
        });
        setMessages((prev) => [...prev, res.data]);
        fetchConversations();
      } catch (err) {
        console.error('Failed to send message via REST', err);
      }
    }
  };

  const selectConversation = (conv) => {
    setActiveUser({
      id: conv.otherUserId,
      username: conv.otherUsername,
      fullName: conv.otherFullName,
      avatarUrl: conv.otherAvatarUrl,
      isOnline: Boolean(conv.otherUserOnline),
    });
    setSearchParams({ userId: conv.otherUserId });
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-app-bg flex overflow-hidden">
      {/* Sidebar: Conversations List */}
      <div className="w-80 md:w-96 bg-app-sidebar border-r border-app-border flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-app-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-msg-charcoal">Messages</h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-success' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs text-textSecondary font-medium">
                {connected ? 'Live connection' : 'Connecting…'}
              </span>
            </div>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-app-border/60">
          {loadingConversations ? (
            <div className="p-6 text-center text-textSecondary text-sm">
              Loading conversations…
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-msg-charcoal">No chats yet</p>
              <p className="text-xs text-textSecondary mt-1">
                Search for someone to start a conversation!
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeUser?.id === conv.otherUserId;
              const isOtherOnline = Boolean(
                conv.otherUserId === currentUser?.id ? true : conv.otherUserOnline
              );

              return (
                <button
                  key={conv.otherUserId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex items-center space-x-3 text-left transition-colors ${
                    isActive ? 'bg-brand-light' : 'hover:bg-brand-soft'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.otherAvatarUrl || getAvatarUrl(conv.otherFullName, conv.otherUsername)}
                      alt={conv.otherFullName || conv.otherUsername}
                      className="w-12 h-12 rounded-full object-cover border border-app-border"
                      onError={(e) => {
                        e.target.src = getAvatarUrl(conv.otherFullName, conv.otherUsername);
                      }}
                    />
                    {isOtherOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-msg-charcoal truncate">
                        {conv.otherFullName || conv.otherUsername}
                      </h4>
                      <span className="text-[11px] text-textSecondary flex-shrink-0">
                        {formatTime(conv.lastMessageTimestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-textSecondary truncate">
                      {conv.lastMessageSenderId === currentUser?.id ? 'You: ' : ''}
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-app-bg">
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-app-sidebar border-b border-app-border px-6 flex items-center justify-between shadow-soft">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={activeUser.avatarUrl || getAvatarUrl(activeUser.fullName, activeUser.username)}
                    alt={activeUser.fullName || activeUser.username}
                    className="w-10 h-10 rounded-full object-cover border border-app-border"
                    onError={(e) => {
                      e.target.src = getAvatarUrl(activeUser.fullName, activeUser.username);
                    }}
                  />
                  {activeUser.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-msg-charcoal">
                    {activeUser.fullName || activeUser.username}
                  </h3>
                  <OnlineStatus isOnline={activeUser.isOnline} size="xs" />
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 rounded-full border-4 border-brand-light border-t-brand animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 bg-brand-soft rounded-2xl flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-msg-charcoal">Say hello to {activeUser.fullName || activeUser.username}!</h4>
                  <p className="text-xs text-textSecondary mt-1">Start your conversation right now.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isSentByMe = msg.senderId === currentUser?.id;
                  const showDateDivider =
                    index === 0 ||
                    new Date(msg.timestamp).toDateString() !==
                      new Date(messages[index - 1].timestamp).toDateString();

                  return (
                    <React.Fragment key={msg.id || index}>
                      {showDateDivider && (
                        <div className="flex items-center justify-center my-3">
                          <span className="px-3 py-1 bg-white border border-app-border rounded-full text-[11px] font-medium text-textSecondary shadow-sm">
                            {formatDateDivider(msg.timestamp)}
                          </span>
                        </div>
                      )}

                      <div className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-end space-x-2 max-w-[75%]">
                          {!isSentByMe && (
                            <img
                              src={msg.senderAvatarUrl || getAvatarUrl(msg.senderFullName, msg.senderUsername)}
                              alt={msg.senderFullName || msg.senderUsername}
                              className="w-7 h-7 rounded-full object-cover border border-app-border flex-shrink-0"
                              onError={(e) => {
                                e.target.src = getAvatarUrl(msg.senderFullName, msg.senderUsername);
                              }}
                            />
                          )}

                          <div className={isSentByMe ? 'bubble-sent' : 'bubble-received'}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                          </div>
                        </div>

                        {/* Timestamp & Sender */}
                        <div
                          className={`flex items-center space-x-1 mt-1 px-1 text-[11px] text-textSecondary ${
                            isSentByMe ? 'justify-end mr-1' : 'justify-start ml-9'
                          }`}
                        >
                          <span>{formatTime(msg.timestamp)}</span>
                          {isSentByMe && (
                            (msg.isRead || msg.senderId === msg.recipientId) ? (
                              /* Compact double tick with negative overlap */
                              <span className="inline-flex items-center text-brand leading-none" title="Read">
                                <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <svg className="w-3 h-3 stroke-current -ml-2" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              /* Single compact tick */
                              <span className="inline-flex items-center text-gray-400 leading-none" title="Sent">
                                <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="bg-app-sidebar border-t border-app-border p-4 flex items-center space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeUser.fullName || activeUser.username}…`}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="btn-primary !px-5 !py-2.5 flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center mb-4 shadow-soft border border-sky-100">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-msg-charcoal">Select a conversation</h3>
            <p className="text-sm text-textSecondary mt-1 max-w-sm">
              Choose a contact from the left sidebar or search for someone new to start chatting instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
