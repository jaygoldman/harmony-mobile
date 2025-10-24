import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import type { ChatSessionSummary } from '@harmony/data';
import { dataClient } from '../../state/stores';
import { useAsyncList } from '../../hooks/useAsyncList';
import { LoadingState } from '../../components/LoadingState';
import { StateMessage } from '../../components/StateMessage';

type HarmonySessionItem = ChatSessionSummary & {
  preview: string | null;
};

const baseStyles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minWidth: 28,
  },
  badgeLabel: {
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {},
  container: {
    flex: 1,
  },
  favorite: {},
  listContent: {
    paddingBottom: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {},
  preview: {},
});

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const HarmonyScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const styles = useMemo(
    () => ({
      badge: StyleSheet.compose(baseStyles.badge, {
        borderColor: colors.border,
        borderRadius: spacing.sm,
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xxs,
      }),
      badgeLabel: StyleSheet.compose(baseStyles.badgeLabel, {
        color: colors.textSecondary,
        fontFamily: typography.fontFamilies.sans.medium,
        fontSize: typography.fontSizes.xs,
      }),
      card: StyleSheet.compose(baseStyles.card, {
        backgroundColor: colors.surface,
        marginBottom: spacing.md,
        padding: spacing.lg,
      }),
      cardHeader: baseStyles.cardHeader,
      cardTitle: StyleSheet.compose(baseStyles.cardTitle, {
        color: colors.textPrimary,
        fontFamily: typography.fontFamilies.sans.medium,
        fontSize: typography.fontSizes.lg,
      }),
      container: StyleSheet.compose(baseStyles.container, {
        backgroundColor: colors.background,
      }),
      favorite: StyleSheet.compose(baseStyles.favorite, {
        color: colors.callout,
        fontFamily: typography.fontFamilies.sans.medium,
        fontSize: typography.fontSizes.lg,
      }),
      listContent: StyleSheet.compose(baseStyles.listContent, {
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
      }),
      metaRow: StyleSheet.compose(baseStyles.metaRow, {
        marginTop: spacing.sm,
      }),
      metaText: StyleSheet.compose(baseStyles.metaText, {
        color: colors.textSecondary,
        fontFamily: typography.fontFamilies.sans.regular,
        fontSize: typography.fontSizes.sm,
      }),
      preview: StyleSheet.compose(baseStyles.preview, {
        color: colors.textSecondary,
        fontFamily: typography.fontFamilies.sans.regular,
        fontSize: typography.fontSizes.md,
        marginTop: spacing.sm,
      }),
    }),
    [
      colors.background,
      colors.border,
      colors.callout,
      colors.surface,
      colors.textPrimary,
      colors.textSecondary,
      spacing.lg,
      spacing.md,
      spacing.sm,
      spacing.xs,
      spacing.xxl,
      spacing.xxs,
      typography.fontFamilies.sans.medium,
      typography.fontFamilies.sans.regular,
      typography.fontSizes.lg,
      typography.fontSizes.md,
      typography.fontSizes.sm,
      typography.fontSizes.xs,
    ]
  );

  const fetchSessions = useCallback(async () => {
    const sessions = await dataClient.chat.sessions.list();
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const messages = await dataClient.chat.messages(session.id);
        const lastMessage = messages[messages.length - 1];
        return {
          ...session,
          preview: lastMessage?.content ?? null,
        } satisfies HarmonySessionItem;
      })
    );
    return enriched.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, []);

  const { data, loading, refreshing, error, refresh } = useAsyncList(fetchSessions);

  const renderItem = useCallback(
    ({ item }: { item: HarmonySessionItem }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.isFavorite ? <Text style={styles.favorite}>★</Text> : null}
        </View>
        {item.preview ? <Text style={styles.preview}>{item.preview}</Text> : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatTimestamp(item.lastMessageAt)}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{item.unreadCount} new</Text>
          </View>
        </View>
      </View>
    ),
    [styles]
  );

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading conversations…" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <StateMessage title="Unable to load conversations" description={error} variant="error" />
      ) : null}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <StateMessage
            title="No conversations yet"
            description="Start a session from the Harmony desktop app to sync messages here."
          />
        }
        onRefresh={refresh}
        refreshing={refreshing}
        renderItem={renderItem}
      />
    </View>
  );
};
