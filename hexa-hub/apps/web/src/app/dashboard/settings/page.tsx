'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Moon,
  Sun,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

// ─── Settings Section Component ──────────────────────────────────────────────

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  index: number;
}

function SettingsSection({ icon: Icon, title, description, children, index }: SettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 bg-surface border border-border rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
          <Icon size={18} className="text-gold" />
        </div>
        <div>
          <h3 className="text-base font-serif font-light text-white">{title}</h3>
          <p className="text-xs text-neutral-600 font-light">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Settings Field Component ────────────────────────────────────────────────

interface FieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function Field({ label, description, children }: FieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/30 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 font-light">{label}</p>
        {description && (
          <p className="text-xs text-neutral-600 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      aria-label={label}
      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
        enabled ? 'bg-gold' : 'bg-neutral-700'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

// ─── Settings Page ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth();

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save — in production, this would POST to a settings endpoint
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 md:p-12 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          <span className="text-gold">Settings</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Manage your account preferences and configuration.
        </p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <SettingsSection
          icon={User}
          title="Profile"
          description="Your personal information"
          index={0}
        >
          <Field label="Full Name" description="Your display name across HEXA Hub">
            <span className="text-sm text-white/70 font-light">{user?.fullName || '—'}</span>
          </Field>
          <Field label="Email Address" description="Used for notifications and login">
            <span className="text-sm text-white/70 font-light">{user?.email || '—'}</span>
          </Field>
          <Field label="Role" description="Your access level in the platform">
            <span className="text-[11px] uppercase tracking-widest text-gold font-medium">
              {user?.role || '—'}
            </span>
          </Field>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Control how you receive updates"
          index={1}
        >
          <Field label="Email Notifications" description="Receive updates via email">
            <Toggle
              enabled={emailNotifications}
              onChange={setEmailNotifications}
              label="Toggle email notifications"
            />
          </Field>
          <Field label="Push Notifications" description="Receive real-time push alerts">
            <Toggle
              enabled={pushNotifications}
              onChange={setPushNotifications}
              label="Toggle push notifications"
            />
          </Field>
          <Field label="Weekly Digest" description="A weekly summary of activity">
            <Toggle
              enabled={weeklyDigest}
              onChange={setWeeklyDigest}
              label="Toggle weekly digest"
            />
          </Field>
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Customize your interface"
          index={2}
        >
          <Field label="Theme" description="Choose between dark and light mode">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'text-neutral-600 hover:text-neutral-400 border border-transparent'
                }`}
                aria-label="Dark mode"
              >
                <Moon size={16} />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'text-neutral-600 hover:text-neutral-400 border border-transparent'
                }`}
                aria-label="Light mode"
              >
                <Sun size={16} />
              </button>
            </div>
          </Field>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection
          icon={Shield}
          title="Security"
          description="Manage your account security"
          index={3}
        >
          <Field label="Password" description="Last changed: Not available">
            <button className="px-3 py-1.5 text-xs text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-all">
              Change
            </button>
          </Field>
          <Field label="Sessions" description="Active login sessions">
            <button className="px-3 py-1.5 text-xs text-neutral-500 border border-border rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all">
              Revoke All
            </button>
          </Field>
        </SettingsSection>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-end gap-4 pt-4"
        >
          {saved && (
            <span className="text-xs text-emerald-400 font-light animate-pulse">
              Settings saved successfully.
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gold/10 text-gold border border-gold/30 rounded-xl hover:bg-gold/20 transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span className="text-sm font-light">
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}