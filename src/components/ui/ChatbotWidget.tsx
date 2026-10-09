import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { processChatQuery, ChatMessage } from '../../services/chatbotService';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Heart,
  Clock,
  Phone,
} from 'lucide-react';

export const ChatbotWidget: React.FC = () => {
  const { navigate, currentPath } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Assalam-o-Alaikum! Welcome to Lady Doctor Clinic. I am your automated clinic assistant. How may I assist you with doctor schedules, booking an appointment, or viewing our virtual hospital tour?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '📅 Book Appointment', action: () => navigate('/appointment') },
        { label: '🔍 Track My Appointment', action: () => navigate('/lookup') },
        { label: '📹 Virtual Video Tour', action: () => navigate('/tour') },
        { label: '🖼️ 5 Clinic Posters', action: () => navigate('/posters') },
        { label: '⏰ Timings & Location', action: () => navigate('/contact') },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Don't render chatbot on admin pages to keep staff workflow clean
  if (currentPath.startsWith('/admin')) {
    return null;
  }

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate realistic typing delay
    setTimeout(async () => {
      const response = await processChatQuery(text, navigate);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: response.quickActions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'bot',
        text: 'Chat history cleared. How may I help you with Lady Doctor Clinic services today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: '📅 Book Appointment', action: () => navigate('/appointment') },
          { label: '🔍 Track Appointment', action: () => navigate('/lookup') },
          { label: '📹 Watch Tour', action: () => navigate('/tour') },
        ],
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none print:hidden">
      {/* Trigger Floating Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-rose-700 to-rose-800 text-white rounded-full shadow-2xl hover:shadow-rose-900/40 hover:scale-105 transition-all duration-200 cursor-pointer border border-rose-400/30"
          aria-label="Open clinic AI assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <MessageCircle className="w-5 h-5 group-hover:rotate-6 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Ask Clinic AI</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-[92vw] sm:w-[410px] h-[540px] max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Lady Doctor Clinic AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <span className="text-[10px] text-slate-300 block">
                  Virtual Receptionist · 24/7 Information
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="px-3.5 py-1.5 bg-rose-50/80 border-b border-rose-100 text-[10px] text-rose-900 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-rose-600 shrink-0" />
              <span>General clinic assistance only · Not a medical doctor</span>
            </span>
            <span className="text-rose-700 font-bold">Confidential</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-2xs whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-rose-700 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Quick Action Chips attached to bot message */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                    {msg.quickActions.map((action, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          action.action();
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>{action.label}</span>
                        <ChevronRight className="w-3 h-3 text-rose-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 max-w-[100px] rounded-2xl bg-white border border-slate-200 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-bounce delay-200"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Bar */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-1.5 text-[11px] whitespace-nowrap">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Ask:</span>
            <button
              type="button"
              onClick={() => handleSend('How to book an appointment?')}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              How to book?
            </button>
            <button
              type="button"
              onClick={() => handleSend('Clinic timings and location')}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Timings & Map
            </button>
            <button
              type="button"
              onClick={() => handleSend('Hospital virtual video tour')}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Video tour
            </button>
            <button
              type="button"
              onClick={() => handleSend('Show 5 clinic posters')}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              5 Posters
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about doctors, booking, tour, posters..."
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
