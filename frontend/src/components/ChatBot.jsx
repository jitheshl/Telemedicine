import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { MessageSquare, X, Send, Sparkles, AlertCircle } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "Hello! I'm Aura, your AI Health Companion. How can I help you today?\n\n*Suggestions:*\n- Explain my migraine symptoms\n- Guide me on how to book an appointment\n- What are standard flu symptoms?",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');

    // Append user message
    const updatedMessages = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map history format: { role: 'user' | 'model', content }
      const history = updatedMessages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await aiAPI.chatbot(history, text);
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'model', content: res.data.reply }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error.message);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetText) => {
    handleSendMessage(presetText);
  };

  // Helper to format messages with lists and bolding
  const formatContent = (content) => {
    return content.split('\n').map((line, index) => {
      // Bold mapping
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const italicRegex = /\*(.*?)\*/g;

      // Replace bold markdown
      formattedLine = formattedLine.replace(boldRegex, '<strong>$1</strong>');
      // Replace italic markdown
      formattedLine = formattedLine.replace(italicRegex, '<em>$1</em>');

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li 
            key={index} 
            className="ml-4 list-disc mt-1 text-slate-700 dark:text-slate-350"
            dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }}
          />
        );
      }
      return (
        <p 
          key={index} 
          className="mt-1 text-slate-700 dark:text-slate-300"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded chat portal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[390px] h-[500px] rounded-3xl glass shadow-2xl border border-slate-200/50 dark:border-slate-800/30 flex flex-col overflow-hidden mb-4 animate-float-short">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Aura Health Assistant</h4>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] text-indigo-100">AI Active Now</span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Disclaimer Banner */}
          <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 text-[10px] flex items-center space-x-1 border-b border-amber-100/50 dark:border-amber-900/10">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>AI responses are educational, not official diagnoses.</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="space-y-1">{formatContent(msg.content)}</div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl rounded-bl-none px-4 py-3.5 text-sm shadow-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-650 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-650 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-650 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Chips */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-2 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200/50 dark:border-slate-850">
              <button
                onClick={() => handlePresetClick('What is migraine?')}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 border border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                Migraine info
              </button>
              <button
                onClick={() => handlePresetClick('How to book doctor?')}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 border border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                How to Book?
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-850 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Aura anything about your health..."
              className="flex-1 px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              disabled={loading}
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
              disabled={loading || !inputText.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating circular button */}
      <button
        onClick={toggleChat}
        className={`p-4 rounded-full text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl transition-transform hover:scale-105 active:scale-95 duration-200 group flex items-center justify-center ${
          isOpen ? 'rotate-90' : 'animate-float shadow-indigo-600/30'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatBot;
