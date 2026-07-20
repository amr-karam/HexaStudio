import { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { fetchInvoices, ClientInvoice } from '@/lib/api';

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function paymentLabel(invoice: ClientInvoice): { text: string; paid: boolean } {
  if (invoice.paymentState === 'paid') return { text: 'Paid', paid: true };
  if (invoice.paymentState === 'partial') return { text: 'Partially paid', paid: false };
  if (invoice.residual > 0) return { text: `Due ${formatAmount(invoice.residual)}`, paid: false };
  return { text: invoice.state, paid: false };
}

export default function InvoicesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [user, load]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    load();
  }, [load]);

  const renderContent = () => {
    if (!user) {
      return (
        <Text style={[styles.body, { color: colors.muted }]}>
          Sign in from the Profile tab to view your invoices.
        </Text>
      );
    }
    if (isLoading) {
      return <ActivityIndicator color={colors.foreground} style={styles.spinner} />;
    }
    if (error) {
      return <Text style={[styles.body, { color: colors.muted }]}>{error}</Text>;
    }
    if (invoices.length === 0) {
      return (
        <Text style={[styles.body, { color: colors.muted }]}>No invoices yet.</Text>
      );
    }
    return (
      <FlatList
        data={invoices}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.muted} />
        }
        renderItem={({ item }) => {
          const status = paymentLabel(item);
          return (
            <View
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.amount, { color: colors.foreground }]}>
                  {formatAmount(item.amount)}
                </Text>
              </View>
              <Text
                style={[styles.cardMeta, { color: status.paid ? colors.accent : colors.muted }]}
              >
                {status.text}
                {item.date ? ` · ${item.date}` : ''}
              </Text>
            </View>
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Invoices</Text>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, flex: 1 },
  title: { fontSize: 32, fontWeight: '300', marginBottom: 16 },
  body: { fontSize: 14, lineHeight: 22 },
  spinner: { marginTop: 32 },
  card: { padding: 20, borderRadius: 4, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 12 },
  amount: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 13, lineHeight: 20 },
});
