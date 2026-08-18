'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/providers/AuthProvider';
import { hexaEasing, hexaDuration } from '@/lib/motion/tokens';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      login(response.data.access_token, response.data.user);
      const role = response.data.user.role;
      router.push(role === 'CLIENT' ? '/client' : '/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full animate-pulse-gold" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/3 blur-[120px] rounded-full animate-pulse-gold-slow"
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      {/* Cinematic grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 cinematic-grid opacity-30"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: hexaDuration.component,
          ease: hexaEasing.entrance,
        }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo + Tagline */}
        <div className="text-center mb-12">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-xl bg-gold/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-xl border border-gold/30">
                <span className="font-mono text-xs font-bold text-gold tracking-widest">
                  HX
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-serif font-light text-foreground">
              Welcome to <span className="text-gold">HUB</span>
            </h1>
          </div>
          <p className="text-tertiary font-light text-sm tracking-widest uppercase">
            Enterprise Workspace
          </p>
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleLogin}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: hexaDuration.component, ease: hexaEasing.entrance }}
        >
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@hexastudio.net"
            required
            autoComplete="email"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-error text-center font-light"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full tracking-widest"
            aria-label="Sign in to HEXA Hub"
          >
            {isLoading ? 'Authenticating…' : 'Enter Workspace'}
          </Button>
        </motion.form>

        {/* Footer */}
        <p className="text-center mt-8 text-xs text-tertiary font-light">
          HEXA Studio &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
