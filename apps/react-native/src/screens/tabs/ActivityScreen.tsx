/* eslint-disable react-native/no-unused-styles, react-native/sort-styles */
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import type { ActivityItem } from '@harmony/data';
import { dataClient } from '../../state/stores';
import { useAsyncList } from '../../hooks/useAsyncList';
import { LoadingState } from '../../components/LoadingState';
import { StateMessage } from '../../components/StateMessage';

type Priority = ActivityItem['priority'];

const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const createStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  typography: ReturnType<typeof useTheme>['typography']
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      paddingTop: spacing.md,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: spacing.md,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    title: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.lg,
    },
    description: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamilies.sans.regular,
      fontSize: typography.fontSizes.md,
      marginTop: spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    meta: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamilies.sans.regular,
      fontSize: typography.fontSizes.sm,
    },
    badge: {
      alignItems: 'center',
      borderRadius: spacing.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    badgeText: {
      color: colors.surface,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.xs,
    },
    priorityLow: {
      backgroundColor: colors.success,
    },
    priorityMedium: {
      backgroundColor: colors.warning,
    },
    priorityHigh: {
      backgroundColor: colors.danger,
    },
  });

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getPriorityStyle = (styles: ReturnType<typeof createStyles>, priority: Priority) => {
  switch (priority) {
    case 'low':
      return styles.priorityLow;
    case 'medium':
      return styles.priorityMedium;
    case 'high':
      return styles.priorityHigh;
    default:
      return styles.priorityLow;
  }
};

export const ActivityScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, typography),
    [colors, spacing, typography]
  );

  const fetchActivity = useCallback(async () => {
    const items = await dataClient.activity.list();
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  const { data, loading, refreshing, error, refresh } = useAsyncList(fetchActivity);

  const renderItem = useCallback(
    ({ item }: { item: ActivityItem }) => (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.meta}>
            {item.platform.toUpperCase()} • {formatTimestamp(item.timestamp)}
          </Text>
          <View style={[styles.badge, getPriorityStyle(styles, item.priority)]}>
            <Text style={styles.badgeText}>{priorityLabels[item.priority]}</Text>
          </View>
        </View>
      </View>
    ),
    [styles]
  );

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading activity…" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <StateMessage title="Activity unavailable" description={error} variant="error" />
      ) : null}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <StateMessage
            title="No updates yet"
            description="Check back soon to see new Conductor, Teams, and Jira activity."
          />
        }
      />
    </View>
  );
};
