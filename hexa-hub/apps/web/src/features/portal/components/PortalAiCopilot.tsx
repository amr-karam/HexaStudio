'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/providers/SocketProvider';
import { toast } from 'sonner';
import { Mic, Send, Paperclip, X, Bot, User, Image as ImageIcon } from 'lucide-react';
import { usePresence } from '@/lib/hooks/use-presence';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  tags?: string[];
}

export function PortalAiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { onlineUsers } = usePresence();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      toast.error('Speech recognition error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      SpeechRecognition.prototype.stop();
    }
    setIsListening(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      sources: selectedImage ? ['image'] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/portal/copilot/multimodal-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text: inputValue,
          imageUrl: imagePreview,
          context: {
            projectId: 'current-project-id',
          },
        }),
      });

      const data = await response.json();

      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
        tags: data.tags,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setIsProcessing(false);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[400px] bg-[#0D0D0D] border border-[#1F1F1F] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Portal AI Copilot</h3>
                  <p className="text-[11px] text-neutral-500">Ask about projects, documents, or anything in your portal</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/[0.05] transition-colors">
                <X size={16} className="text-neutral-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Bot size={48} className="text-purple-500/20 mb-4" />
                  <p className="text-sm text-neutral-500 text-center">
                    Hi! I'm your AI assistant. Ask me about:
                    <br />- "What's the status of Project Alpha?"
                    <br />- "Show me the latest renderings"
                    <br />- "Summarize the client feedback"
                    <br />- Upload an image to analyze it
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${message.role === 'user' ? 'bg-[#D4A843]/20 text-white' : 'bg-[#1F1F1F] text-neutral-300'}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <p className="text-[10px] text-neutral-500 mt-2">Sources: {message.sources.join(', ')}</p>
                      )}
                      {message.tags && message.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-neutral-600 mt-2 text-right">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="p-4 border-t border-[#1F1F1F] bg-[#141414]">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-[#1F1F1F]">
              <div className="flex gap-2">
                <label className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? 'Listening...' : 'Ask AI Copilot...'}
                    className="w-full bg-[#1F1F1F] border border-[#2F2F2F] rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4A843]"
                    disabled={isProcessing}
                  />
                  {selectedImage && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-12 flex items-center gap-2">
                      <span className="text-[10px] bg-[#D4A843]/20 px-2 py-0.5 rounded text-[#D4A843]" >
                        {selectedImage.name}
                      </span>
                    </div>
                  )}
                </label>
                <button
                  onClick={selectedImage ? handleRemoveImage : () => document.getElementById('image-upload')?.click()}
                  className="p-3 bg-[#1F1F1F] border border-[#2F2F2F] rounded-lg hover:bg-[#2F2F2F] transition-colors disabled:opacity-50"
                  disabled={isProcessing}
                >
                  <Paperclip size={18} className="text-neutral-400" />
                </button>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 border border-red-500/50' : 'bg-[#D4A843]/20 border border-[#D4A843]/50'} hover:bg-opacity-30`}
                  disabled={isProcessing}
                >
                  <Mic size={18} className={isListening ? 'text-red-400' : 'text-[#D4A843]'} />
                </button>
                <button
                  onClick={sendMessage}
                  className="p-3 bg-[#D4A843] rounded-lg hover:bg-[#D4A843]/80 transition-colors disabled:opacity-50"
                  disabled={!inputValue.trim() && !selectedImage || isProcessing}
                >
                  <Send size={18} className="text-black" />
                </button>
              </div>
              <p className="text-[10px] text-neutral-600 mt-2 text-center">
                AI may produce inaccurate information. Consider verifying important facts.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(147,51,234,0.4)] hover:shadow-[0_12px_32px_rgba(147,51,234,0.6)] transition-all duration-300"
          >
            <Bot size={24} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Online users indicator */}
      <div className="absolute bottom-full right-0 mb-2">
        <AnimatePresence>
          {onlineUsers.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 bg-[#1F1F1F]/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#2F2F2F]"
            >
              <div className="flex -space-x-2">
                {[...onlineUsers].slice(0, 3).map((userId) => (
                  <div key={userId} className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-[#0D0D0D]" />
                ))}
              </div>
              <span className="text-[11px] text-neutral-400">
                {onlineUsers.size} online
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
