'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'sonner';
import { Mic, Send, Paperclip, X, Bot, User } from 'lucide-react';
import { usePresence } from '@/lib/hooks/use-presence';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  tags?: string[];
}

// Minimal typings for the Web Speech API (not in the standard lib DOM yet).
interface SpeechRecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
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
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    const recognition = new Ctor();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
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
    const Ctor = getSpeechRecognitionCtor();
    if (Ctor) {
      const instance = new Ctor();
      instance.stop();
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/ai/agents/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          query: inputValue,
          context: {
            projectId: 'current-project-id',
          },
        }),
      });

      const data = await response.json() as { response: string; metadata?: { sources?: string[]; agentName?: string } };

      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.metadata?.sources,
        tags: data.metadata?.agentName ? [data.metadata.agentName] : undefined,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch {
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
            className="w-[400px] bg-void-deep border border-border rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-info to-metricTeal flex items-center justify-center">
                  <Bot size={16} className="text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Portal AI Copilot</h3>
                  <p className="text-[11px] text-tertiary">Ask about projects, documents, or anything in your portal</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/[0.05] transition-colors">
                <X size={16} className="text-tertiary" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Bot size={48} className="text-info/20 mb-4" />
                  <p className="text-sm text-tertiary text-center">
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-info to-metricTeal flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${message.role === 'user' ? 'bg-gold/20 text-white' : 'bg-border text-secondary'}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <p className="text-[10px] text-tertiary mt-2">Sources: {message.sources.join(', ')}</p>
                      )}
                      {message.tags && message.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] bg-surface px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-tertiary mt-2 text-right">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-info to-metricTeal flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-foreground" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="p-4 border-t border-border bg-surface">
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={128}
                    height={128}
                    unoptimized
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-void/50 rounded-full hover:bg-void"
                  >
                    <X size={14} className="text-foreground" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <label className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? 'Listening...' : 'Ask AI Copilot...'}
                    className="w-full bg-border border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-tertiaryfocus:outline-none focus:border-gold"
                    disabled={isProcessing}
                  />
                  {selectedImage && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-12 flex items-center gap-2">
                      <span className="text-[10px] bg-gold/20 px-2 py-0.5 rounded text-gold" >
                        {selectedImage.name}
                      </span>
                    </div>
                  )}
                </label>
                <button
                  onClick={selectedImage ? handleRemoveImage : () => document.getElementById('image-upload')?.click()}
                  className="p-3 bg-border border border-border rounded-lg hover:bg-border transition-colors disabled:opacity-50"
                  disabled={isProcessing}
                >
                  <Paperclip size={18} className="text-tertiary" />
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
                  className={`p-3 rounded-lg transition-colors ${isListening ? 'bg-error/20 border border-red-500/50' : 'bg-gold/20 border border-gold/50'} hover:bg-opacity-30`}
                  disabled={isProcessing}
                >
                  <Mic size={18} className={isListening ? 'text-error' : 'text-gold'} />
                </button>
                <button
                  onClick={sendMessage}
                  className="p-3 bg-gold rounded-lg hover:bg-gold/80 transition-colors disabled:opacity-50"
                  disabled={!inputValue.trim() && !selectedImage || isProcessing}
                >
                  <Send size={18} className="text-black" />
                </button>
              </div>
              <p className="text-[10px] text-tertiary mt-2 text-center">
                AI may produce inaccurate information. Consider verifying important facts.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-gradient-to-br from-info to-metricTeal rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(96,165,250,0.4)] hover:shadow-[0_12px_32px_rgba(96,165,250,0.6)] transition-all duration-300"
          >
            <Bot size={24} className="text-foreground" />
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
              className="flex items-center gap-2 bg-border backdrop-blur-sm px-3 py-2 rounded-lg border border-border"
            >
              <div className="flex -space-x-2">
                {[...onlineUsers].slice(0, 3).map((userId) => (
                  <div key={userId} className="w-6 h-6 rounded-full bg-gradient-to-r from-info to-metricTeal border-2 border-void-deep" />
                ))}
              </div>
              <span className="text-[11px] text-tertiary">
                {onlineUsers.size} online
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
