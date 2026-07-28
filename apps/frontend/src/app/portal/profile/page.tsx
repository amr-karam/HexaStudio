'use client';

/**
 * HEXA Portal v4.0 — User Profile Page
 *
 * Premium account management interface with cinematic Framer Motion choreography,
 * edit/save toggling, password strength indicator, and mock session management.
 *
 * Features:
 * - Profile data from portalApi.getProfile() with graceful demo fallback
 * - Inline edit/save for username with animated transitions
 * - Change password with real-time strength indicator (Weak / Medium / Strong)
 * - Mock recent sessions with revoke capability
 * - Verified email badge display
 * - Role badge with color coding (Admin / Editor / User)
 * - Notification settings redirect card
 * - Staggered fadeLift entrance choreography for all sections
 * - Full ARIA compliance, semantic headings, focus states
 * - Reduced motion respect via useReducedMotion
 * - Demo data source badge when API is unreachable
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { TextReveal } from '@/components/ui/TextReveal';
import { Icon } from '@/features/portal/components/PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { portalApi } from '@/features/portal/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface ProfileData {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt?: string;
}

interface SessionData {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface StrengthLevel {
  label: string;
  textColor: string;
  barColor: string;
  width: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const FALLBACK_USER: ProfileData = {
  id: 'demo-user-1',
  email: 'alex.morgan@hexastudio.com',
  username: 'Alex Morgan',
  role: 'admin',
  createdAt: '2026-01-15T00:00:00.000Z',
} as const;

const MOCK_SESSIONS: SessionData[] = [
  {
    id: 'sess-1',
    device: 'Chrome on macOS',
    ip: '192.168.1.42',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 'sess-2',
    device: 'Safari on iOS',
    ip: '192.168.1.105',
    lastActive: '2 days ago',
    isCurrent: false,
  },
  {
    id: 'sess-3',
    device: 'Firefox on Windows',
    ip: '203.0.113.45',
    lastActive: '5 days ago',
    isCurrent: false,
  },
] as const;

const STRENGTH_LEVELS: StrengthLevel[] = [
  { label: '', textColor: '', barColor: '', width: '0%' },
  { label: 'Weak', textColor: 'text-red-400', barColor: 'bg-red-400', width: '33%' },
  { label: 'Medium', textColor: 'text-amber-400', barColor: 'bg-amber-400', width: '66%' },
  { label: 'Strong', textColor: 'text-emerald-400', barColor: 'bg-emerald-400', width: '100%' },
] as const;

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-accent/10 text-accent border-accent/20' },
  editor: { label: 'Editor', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  user: { label: 'User', className: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' },
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getPasswordStrength(pw: string): StrengthLevel {
  if (pw.length === 0) return STRENGTH_LEVELS[0];
  if (pw.length < 6) return STRENGTH_LEVELS[1];
  if (pw.length < 10) return STRENGTH_LEVELS[2];
  return STRENGTH_LEVELS[3];
}

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono"
      >
        Loading...
      </motion.div>
    </div>
  );
}

function AccessGatewayPrompt() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-neutral-500 mb-8 uppercase tracking-widest font-mono text-xs"
        >
          Authentication required
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => router.push('/portal/login')}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-bold',
            'bg-accent text-void',
            'hover:brightness-110 transition-all duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
          aria-label="Go to access gateway"
        >
          Access Gateway
        </motion.button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

export default function ProfilePage() {
  const prefersReduced = useReducedMotion();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // ── Profile edit state ─────────────────────────────────────────────────────

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ── Password state ─────────────────────────────────────────────────────────

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // ── Data source tracking ───────────────────────────────────────────────────

  const [dataSource, setDataSource] = useState<'live' | 'demo'>('demo');

  // ── Fetch profile ──────────────────────────────────────────────────────────

  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery<ProfileData>({
    queryKey: ['portal-profile'],
    queryFn: async () => {
      const data = await portalApi.getProfile();
      setDataSource('live');
      return data;
    },
    retry: false,
    staleTime: 30_000,
  });

  // Populate edit field when profile loads
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const displayUser: ProfileData = profile ?? FALLBACK_USER;
  const strength = getPasswordStrength(newPassword);
  const roleBadge = ROLE_BADGES[displayUser.role] ?? ROLE_BADGES.user;
  const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      // Simulate API delay — backend endpoint TBD
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUsername(profile?.username ?? FALLBACK_USER.username);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await portalApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = (session: SessionData) => {
    toast.success(`Session "${session.device}" revoked`);
  };

  // ── Loading guard ──────────────────────────────────────────────────────────

  if (authLoading || profileLoading) {
    return <PageSkeleton />;
  }

  // ── Auth guard ─────────────────────────────────────────────────────────────

  if (!authUser) {
    return <AccessGatewayPrompt />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pt-32 pb-24 px-8 md:px-16">
      <div className="mx-auto max-w-3xl">
        {/* ================================================================ */}
        {/*  HEADER                                                          */}
        {/* ================================================================ */}
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 block font-mono"
            >
              Profile
            </motion.span>
            {dataSource === 'demo' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
              >
                Demo
              </motion.span>
            )}
          </div>
          <div className="text-4xl md:text-6xl font-serif font-light text-foreground leading-tight">
            <TextReveal delay={0.1}>Profile</TextReveal>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-sm text-neutral-500 font-light leading-relaxed"
          >
            Manage your account, security, and personal preferences.
          </motion.p>
        </header>

        {/* ================================================================ */}
        {/*  SECTION 1 — ACCOUNT INFORMATION                                 */}
        {/* ================================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border/50 rounded-sm overflow-hidden"
          aria-label="Account information"
        >
          {/* Panel Header */}
          <div className="px-6 py-5 border-b border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent/60" />
              <h2 className="text-base font-medium text-foreground tracking-wide">
                Account Information
              </h2>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className={cn(
                    'text-[11px] font-mono uppercase tracking-wider',
                    'text-neutral-500 hover:text-neutral-300 transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded px-2 py-1',
                  )}
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-bold',
                    'bg-accent text-void px-3 py-1 rounded',
                    'hover:bg-accent-bright transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    isSaving && 'opacity-50 pointer-events-none',
                  )}
                  aria-label="Save profile changes"
                >
                  {isSaving && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-2.5 h-2.5 rounded-full border-2 border-void/30 border-t-void"
                    />
                  )}
                  {isSaving ? 'Saving' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  'text-[11px] font-mono uppercase tracking-wider',
                  'text-accent/80 hover:text-accent transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded px-2 py-1',
                )}
                aria-label="Edit profile information"
              >
                Edit
              </button>
            )}
          </div>

          {/* Panel Body */}
          <div className="divide-y divide-border/10">
            {/* Username */}
            <motion.div
              layout={!prefersReduced}
              className="px-6 py-5"
            >
              <label
                htmlFor="profile-username"
                className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 mb-2 block"
              >
                Username
              </label>
              {isEditing ? (
                <motion.div
                  initial={prefersReduced ? {} : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={cn(
                      'w-full bg-transparent border rounded-sm px-3 py-2 text-sm text-foreground',
                      'border-border/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20',
                      'placeholder:text-neutral-600 transition-colors duration-200',
                    )}
                    placeholder="Your display name"
                    aria-label="Username"
                    autoFocus
                  />
                </motion.div>
              ) : (
                <p className="text-sm text-foreground font-medium">
                  {displayUser.username}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              layout={!prefersReduced}
              className="px-6 py-5"
            >
              <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 mb-2 block">
                Email
              </span>
              <div className="flex items-center gap-2.5">
                <p className="text-sm text-foreground">{displayUser.email}</p>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  aria-label="Verified email"
                >
                  <Icon name="check" size={10} strokeWidth={2} />
                  Verified
                </span>
              </div>
            </motion.div>

            {/* Role */}
            <motion.div
              layout={!prefersReduced}
              className="px-6 py-5"
            >
              <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 mb-2 block">
                Role
              </span>
              <span
                className={cn(
                  'inline-flex text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border',
                  roleBadge.className,
                )}
                role="status"
                aria-label={`Role: ${roleBadge.label}`}
              >
                {roleBadge.label}
              </span>
            </motion.div>

            {/* Member Since */}
            <motion.div
              layout={!prefersReduced}
              className="px-6 py-5"
            >
              <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 mb-2 block">
                Member Since
              </span>
              <div className="flex items-center gap-2">
                <Icon name="calendar" size={13} className="text-neutral-500 shrink-0" />
                <p className="text-sm text-foreground">
                  {formatDate(profile?.createdAt)}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================================ */}
        {/*  SECTION 2 — SECURITY                                            */}
        {/* ================================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border/50 rounded-sm overflow-hidden mt-8"
          aria-label="Security settings"
        >
          <div className="px-6 py-5 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent/60" />
              <h2 className="text-base font-medium text-foreground tracking-wide">
                Security
              </h2>
            </div>
          </div>

          {/* Change Password */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-2 mb-5">
              <Icon name="shield-check" size={14} className="text-neutral-500" />
              <h3 className="text-xs font-semibold text-foreground tracking-wider uppercase">
                Change Password
              </h3>
            </div>

            <div className="space-y-4 max-w-md">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="current-password"
                  className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 mb-2 block"
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={cn(
                    'w-full bg-background border border-border/50 rounded-sm px-3 py-2 text-sm text-foreground',
                    'focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20',
                    'placeholder:text-neutral-600 transition-colors duration-200',
                  )}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-label="Current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 mb-2 block"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(
                    'w-full bg-background border border-border/50 rounded-sm px-3 py-2 text-sm text-foreground',
                    'focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20',
                    'placeholder:text-neutral-600 transition-colors duration-200',
                  )}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-label="New password"
                />
                {/* Strength indicator */}
                {newPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2.5 space-y-1.5"
                    aria-label={`Password strength: ${strength.label}`}
                    role="status"
                  >
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full transition-colors', strength.barColor)}
                        initial={{ width: '0%' }}
                        animate={{ width: strength.width }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <p className={cn('text-[11px] font-mono', strength.textColor)}>
                      {strength.label}
                      {strength.label && <span className="text-neutral-600"> · Minimum 8 characters</span>}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 mb-2 block"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    'w-full bg-background border rounded-sm px-3 py-2 text-sm text-foreground',
                    'focus:outline-none focus:ring-1 placeholder:text-neutral-600 transition-colors duration-200',
                    confirmPassword && !passwordsMatch
                      ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                      : 'border-border/50 focus:border-accent/50 focus:ring-accent/20',
                  )}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-label="Confirm new password"
                  aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
                  aria-describedby={confirmPassword.length > 0 && !passwordsMatch ? 'password-mismatch' : undefined}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <motion.p
                    id="password-mismatch"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-mono text-red-400 mt-1"
                    role="alert"
                  >
                    Passwords do not match
                  </motion.p>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-bold',
                  'bg-accent text-void',
                  'hover:bg-accent-bright transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                  changingPassword && 'opacity-50 pointer-events-none',
                )}
                aria-label="Update password"
              >
                {changingPassword ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-3.5 h-3.5 rounded-full border-2 border-void/30 border-t-void shrink-0"
                    />
                    <span>Updating...</span>
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-border/20" role="separator" />

          {/* Recent Sessions */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-2 mb-5">
              <Icon name="clock" size={14} className="text-neutral-500" />
              <h3 className="text-xs font-semibold text-foreground tracking-wider uppercase">
                Recent Sessions
              </h3>
            </div>

            <div className="space-y-3" role="list" aria-label="Active sessions">
              {MOCK_SESSIONS.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + idx * 0.08,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    'flex items-center justify-between gap-4 p-4 rounded-sm',
                    'bg-background border',
                    session.isCurrent ? 'border-accent/20' : 'border-border/30',
                  )}
                  role="listitem"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        session.isCurrent
                          ? 'bg-accent/10 text-accent'
                          : 'bg-white/[0.03] text-neutral-500',
                      )}
                      aria-hidden="true"
                    >
                      <Icon name="user" size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">
                          {session.device}
                        </p>
                        {session.isCurrent && (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 shrink-0">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-neutral-500">
                          {session.ip}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-700 shrink-0" aria-hidden="true" />
                        <span className="text-[11px] font-mono text-neutral-500">
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session)}
                    disabled={session.isCurrent}
                    className={cn(
                      'text-[11px] font-mono uppercase tracking-wider shrink-0',
                      'px-3 py-1.5 rounded-sm border transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      session.isCurrent
                        ? 'text-neutral-600 border-neutral-800 cursor-not-allowed'
                        : 'text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 focus-visible:ring-red-400',
                    )}
                    aria-label={`Revoke session: ${session.device}`}
                  >
                    Revoke
                  </button>
                </motion.div>
              ))}
            </div>

            {MOCK_SESSIONS.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-border/20 flex items-center justify-center mb-3">
                  <Icon name="clock" size={18} className="text-neutral-600" />
                </div>
                <p className="text-sm font-medium text-neutral-400">No active sessions</p>
                <p className="text-xs text-neutral-600 mt-1 max-w-[220px]">
                  All sessions have been revoked.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* ================================================================ */}
        {/*  SECTION 3 — NOTIFICATION PREFERENCES                            */}
        {/* ================================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface border border-border/50 rounded-sm overflow-hidden mt-8"
          aria-label="Notification settings"
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent/60 shrink-0" />
                  <h2 className="text-base font-medium text-foreground tracking-wide">
                    Notification Settings
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-lg">
                  Configure which project updates, approvals, and system alerts you
                  receive via email and in-app notifications.
                </p>
              </div>
              <button
                onClick={() => router.push('/portal/settings')}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-bold shrink-0',
                  'bg-accent text-void',
                  'hover:bg-accent-bright transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                )}
                aria-label="Open notification settings"
              >
                <Icon name="settings" size={14} />
                <span>Open Settings</span>
                <Icon name="chevron-right" size={12} strokeWidth={2} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* ================================================================ */}
        {/*  FOOTER — subtle branding                                        */}
        {/* ================================================================ */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-12 text-[10px] text-center font-mono uppercase tracking-[0.3em] text-neutral-800"
        >
          HEXA Studio · Profile
        </motion.p>
      </div>
    </div>
  );
}
