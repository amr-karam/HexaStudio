'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { Send, Search, User as UserIcon } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface Contact {
  id: string;
  fullName: string;
  lastMessage?: string;
}

export default function MessagesPage() {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (token) {
      fetchInbox();
    }
  }, [token]);

  const fetchInbox = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/messages/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Transform messages to contacts
      const contactsMap = new Map();
      res.data.forEach((msg: any) => {
        const sender = msg.sender;
        contactsMap.set(sender.id, {
          id: sender.id,
          fullName: sender.fullName,
          lastMessage: msg.content
        });
      });
      setContacts(Array.from(contactsMap.values()));
    } catch (e) {
      console.error('Failed to fetch inbox', e);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/messages/conversation/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !selectedContact) return;

    try {
      const msg = { receiverId: selectedContact.id, content: input };
      await axios.post('http://localhost:3000/api/messages/send', msg, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInput('');
      fetchMessages(selectedContact.id);
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-background/20">
        <div className="p-6 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input 
              className="w-full bg-surface border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-gold/50 transition-all"
              placeholder="Search contacts..."
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => { setSelectedContact(contact); fetchMessages(contact.id); }}
              className={`p-4 cursor-pointer transition-all border-b border-border/30 ${
                selectedContact?.id === contact.id ? 'bg-gold/10 text-gold' : 'hover:bg-white/5 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                  <UserIcon size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{contact.fullName}</p>
                  <p className="text-xs text-neutral-600 truncate">{contact.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedContact ? (
          <>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                  <UserIcon size={18} />
                </div>
                <h3 className="text-lg font-serif font-light">{selectedContact.fullName}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-2xl text-sm ${
                    msg.senderId === user?.id 
                      ? 'bg-gold text-obsidian rounded-tr-none' 
                      : 'bg-surface text-neutral-300 rounded-tl-none border border-border'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="p-6 border-t border-border flex gap-4">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-gold/50 transition-all"
                placeholder="Type a message..."
              />
              <button 
                type="submit"
                className="bg-gold text-obsidian p-3 rounded-xl hover:bg-gold/90 transition-all"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-600 font-light">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
