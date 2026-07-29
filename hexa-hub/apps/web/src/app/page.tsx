'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, UserCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4A843]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4A843]/3 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-2xl px-6"
      >
        <h1 className="text-6xl md:text-7xl font-serif font-light mb-6 tracking-tight">
          Welcome to{' '}
          <span className="text-[#D4A843]">HEXA</span>{' '}
          <span className="text-white">Hub</span>
        </h1>

        <p className="text-lg text-[#888] font-light mb-12 leading-relaxed max-w-xl mx-auto">
          The central operational system for HEXA Studio. Manage projects,
          track leads, collaborate with your team, and access financial
          reports — all in one premium workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-8 py-4 bg-[#D4A843] text-[#0A0A0A] rounded-xl text-sm font-medium tracking-wide uppercase hover:bg-[#D4A843]/90 transition-colors hover:shadow-[0_0_30px_rgba(212,168,67,0.2)]"
            >
              <LayoutDashboard size={18} />
              Enter Workspace
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <Link href="/client">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-8 py-4 bg-transparent border border-[#1F1F1F] text-white rounded-xl text-sm font-light tracking-wide hover:border-[#333] transition-all"
            >
              <UserCircle size={18} />
              Client Portal
            </motion.button>
          </Link>
        </div>

        {/* Bottom gold accent */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 h-px bg-gradient-to-r from-transparent via-[#D4A843]/30 to-transparent"
        />

        <p className="mt-8 text-xs text-[#444] font-light tracking-widest uppercase">
          HEXA Studio · Enterprise Architecture & Design
        </p>
      </motion.div>
    </div>
  );
}
