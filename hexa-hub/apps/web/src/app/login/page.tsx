'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@hexastudio/ui';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      login(response.data.access_token, response.data.user);
      
      const role = response.data.user.role;
      if (role === 'CLIENT') {
        router.push('/client');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      alert('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-light text-white mb-2">Welcome to <span className="text-gold">HUB</span></h1>
          <p className="text-neutral-500 font-light text-sm tracking-widest uppercase">Enterprise Workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border p-4 rounded-lg text-white focus:border-gold/50 outline-none transition-all duration-300 font-light"
              placeholder="email@hexastudio.net"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border p-4 rounded-lg text-white focus:border-gold/50 outline-none transition-all duration-300 font-light"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-6 text-sm uppercase tracking-widest bg-gold text-obsidian rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Enter Workspace'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
