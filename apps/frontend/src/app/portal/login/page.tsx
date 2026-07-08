'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/inputs/Input';
import { TextReveal } from '@/components/ui/TextReveal';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ identifier: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form.identifier, form.password);
      toast.success('Welcome back to HexaStudio.');
      router.push('/portal');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-surface border border-border/50 p-8 md:p-16 rounded-sm shadow-2xl"
      >
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Secure Access
          </motion.span>
          <div className="text-4xl md:text-5xl font-serif font-light text-foreground leading-tight">
            <TextReveal delay={0.1}>
              Client <span className="italic text-accent">Portal</span>
            </TextReveal>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Input 
            label="Identifier" 
            placeholder="Email or Username" 
            required 
            value={form.identifier}
            onChange={(e) => setForm({...form, identifier: e.target.value})}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            required 
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
          />
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Enter Gateway'}
          </Button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-neutral-500 text-xs font-light">
            Having trouble accessing your account? <br />
            <a href="mailto:info@hexastudio.net" className="text-accent hover:underline">Contact your project lead.</a>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
