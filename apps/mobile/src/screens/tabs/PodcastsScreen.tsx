/* eslint-disable react-native/no-unused-styles, react-native/sort-styles */
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import type { PodcastEpisode } from '@harmony/data';
import { dataClient } from '../../state/stores';
import { useAsyncList } from '../../hooks/useAsyncList';
import { LoadingState } from '../../components/LoadingState';
import { StateMessage } from '../../components/StateMessage';

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
    downloadBadge: {
      borderRadius: spacing.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.callout,
    },
    downloadLabel: {
      color: colors.surface,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.xs,
    },
  });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${mins}m ${remainder.toString().padStart(2, '0')}s`;
};

export const PodcastsScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, typography),
    [colors, spacing, typography]
  );

  const fetchEpisodes = useCallback(async () => {
    const episodes = await dataClient.podcasts.list();
    return episodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const { data, loading, refreshing, error, refresh } = useAsyncList(fetchEpisodes);

  const renderItem = useCallback(
    ({ item }: { item: PodcastEpisode }) => (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.meta}>
            {formatDate(item.date)} • {formatDuration(item.duration)}
          </Text>
          {item.isDownloaded ? (
            <View style={styles.downloadBadge}>
              <Text style={styles.downloadLabel}>Downloaded</Text>
            </View>
          ) : null}
        </View>
      </View>
    ),
    [styles]
  );

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading podcasts…" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <StateMessage title="Podcasts unavailable" description={error} variant="error" />
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
            title="No episodes yet"
            description="Weekly leadership briefings will appear here once they are published."
          />
        }
      />
    </View>
  );
};
