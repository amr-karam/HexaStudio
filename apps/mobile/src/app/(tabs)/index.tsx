/**
 * HEXA Studio — Premium Home Dashboard Screen
 *
 * Luxury mobile dashboard with:
 * - SectionHeader with gold divider
 * - GlassCard project summary
 * - Gold progress ring for milestones
 * - Premium invoice cards with StatusBadges
 * - ShimmerSkeleton placeholder states
 * - Haptic feedback on interactions
 *
 * @module screens/HomeScreen
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { GoldButton } from '@/components/GoldButton';
import { GlassCard } from '@/components/GlassCard';
import { ShimmerSkeleton, SkeletonCard } from '@/components/ShimmerSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressRing } from '@/components/ProgressRing';
import { SectionHeader } from '@/components/SectionHeader';
import { hapticLight } from '@/lib/haptics';
import { fetchPortalDashboard, PortalDashboard } from '@/lib/api';

function formatAmount(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

export default function HomeScreen() {
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPortalDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) { load(); } else { setIsLoading(false); }
  }, [user, load]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    load();
  }, [load]);

  const handleCardPress = () => {
    hapticLight();
  };

  // ─── Loading ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
            <ShimmerSkeleton width="50%" height={28} />
            <ShimmerSkeleton width="80%" height={14} />
          </View>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Error ───────────────────────────────────────────────────

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Empty ───────────────────────────────────────────────────

  if (!dashboard) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.centered}>
          <Text style={{ color: colors.muted }}>Sign in to view your dashboard.</Text>
        </SafeAreaView>
      </SafeAreaView>
    );
  }

  const { project, timeline, invoices } = dashboard;
  const completedMilestones = timeline.filter((t) => t.status === 'completed').length;
  const totalMilestones = timeline.length;
  const pendingInvoices = invoices.filter((i) => i.status !== 'paid');
  const totalDue = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
  const progress = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;

  // ─── Content ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          user ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />
          ) : undefined
        }
      >
        {/* Greeting */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
          <Text style={{
            ...typography.display,
            color: colors.textPrimary,
          }}>
            Welcome{user?.email ? `, ${user.email}` : ''}
          </Text>
          <Text style={{
            ...typography.bodyS,
            color: colors.muted,
            marginTop: spacing.xs,
          }}>
            HEXA Studio — your projects, on the go.
          </Text>
        </View>

        {/* ── Project Card ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
          <GlassCard goldAccent onPress={handleCardPress}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.monoLabel, color: colors.gold }}>Current Project</Text>
                <Text style={{
                  ...typography.h2,
                  color: colors.textPrimary,
                  marginTop: spacing.xs,
                }}>
                  {project.title}
                </Text>
                <Text style={{
                  ...typography.bodyS,
                  color: colors.muted,
                  marginTop: spacing.sm,
                }}>
                  {project.category} · {project.status}
                </Text>
              </View>
              {totalMilestones > 0 && (
                <ProgressRing progress={progress} size={56} strokeWidth={3} showText />
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* ── Milestones ───────────────────────────────────────── */}
        {timeline.length > 0 && (
          <Animated.View entering={FadeInDown.duration(600).delay(200)} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
            <SectionHeader kicker="TIMELINE" title="Milestones" />
            <View style={{ paddingVertical: spacing.sm }}>
              {timeline.slice(0, 5).map((t, i) => (
                <GlassCard key={i} style={{ padding: spacing.md, marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <View style={{
                      width: 10, height: 10, borderRadius: 5,
                      backgroundColor: t.status === 'completed' ? colors.gold : colors.border,
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        ...typography.body,
                        color: colors.textPrimary,
                      }}>
                        {t.phase}
                      </Text>
                      {t.description ? (
                        <Text style={{
                          ...typography.bodyS,
                          color: colors.muted,
                          marginTop: 2,
                        }}>
                          {t.description}
                        </Text>
                      ) : null}
                    </View>
                    <StatusBadge
                      label={t.status === 'completed' ? 'Done' : 'Upcoming'}
                      status={t.status === 'completed' ? 'success' : 'pending'}
                      size="sm"
                    />
                  </View>
                </GlassCard>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── Invoices ─────────────────────────────────────────── */}
        {invoices.length > 0 && (
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
            <SectionHeader
              kicker="FINANCE"
              title="Invoices"
              subtitle={`${pendingInvoices.length} pending · ${formatAmount(totalDue)} due`}
            />
            <View style={{ paddingVertical: spacing.sm }}>
              {invoices.slice(0, 4).map((inv) => {
                const isPaid = inv.status === 'paid';
                return (
                  <GlassCard key={inv.id} style={{ padding: spacing.md, marginBottom: spacing.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...typography.h3, color: colors.textPrimary }}>{`Invoice ${inv.id}`}</Text>
                        <Text style={{ ...typography.bodyS, color: colors.muted, marginTop: 2 }}>
                          {inv.date ? `${inv.date} · ` : ''}{formatAmount(inv.amount)}
                        </Text>
                      </View>
                      <StatusBadge
                        label={isPaid ? 'Paid' : 'Pending'}
                        status={isPaid ? 'paid' : 'pending'}
                        size="sm"
                      />
                    </View>
                  </GlassCard>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ── Gold CTA ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl5 }}>
          <GoldButton
            label="View All Projects"
            size="lg"
            onPress={() => hapticLight()}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});