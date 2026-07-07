import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { messageAPI } from '../services/api';
import { Send, X, MessageSquare, Loader2, Sparkles } from 'lucide-react';

const ChatSessionModal = ({ appointment, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Retrieve matching receiver ID based on role
  const receiverId = currentUser.role === 'patient' 
    ? (appointment.doctor?._id || appointment.doctor) 
    : (appointment.patient?._id || appointment.patient);

  const recipientName = currentUser.role === 'patient'
    ? `Dr. ${appointment.doctor?.name || 'Doctor'}`
    : (appointment.patient?.name || 'Patient');

  // Load message history & connect socket
  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      try {
        const res = await messageAPI.getMessages(appointment._id);
        if (res.data.success && active) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err.message);
        if (active) setError('Failed to load message history.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHistory();

    // Establish Socket.io connection
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket room:', appointment._id);
      socket.emit('join_room', appointment._id);
    });

    // Listen for incoming messages
    socket.on('receive_message', (message) => {
      if (active) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [appointment._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    const messageData = {
      appointmentId: appointment._id,
      senderId: currentUser._id,
      receiverId,
      text: inputText.trim(),
    };

    // Emit message to socket server
    socketRef.current.emit('send_message', messageData);
    setInputText('');
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/30 flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Live Consultation</h3>
              <p className="text-[11px] text-indigo-100/90 font-medium">Chatting with {recipientName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-400">Loading consultation messages...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 rounded-2xl text-xs">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-700 dark:text-slate-350 font-bold text-sm">No messages yet</p>
                <p className="text-slate-400 text-xs mt-1 max-w-xs">
                  Type a message below to start your real-time consultation session with {recipientName}.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
              return (
                <div 
                  key={msg._id || Math.random()} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] space-y-1`}>
                    <p className={`text-[10px] text-slate-450 dark:text-slate-400 font-semibold ${isMe ? 'text-right' : 'text-left'}`}>
                      {isMe ? 'You' : (msg.sender?.name || recipientName)}
                    </p>
                    <div 
                      className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-850'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      <p className={`text-[9px] mt-1.5 text-right font-medium ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form 
          onSubmit={handleSendMessage} 
          className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/30 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Send message to ${recipientName}...`}
            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 transition-colors dark:text-white"
            disabled={loading || !!error}
          />
          <button
            type="submit"
            disabled={loading || !!error || !inputText.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-2xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatSessionModal;
