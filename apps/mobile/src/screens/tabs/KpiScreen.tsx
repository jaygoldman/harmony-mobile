/* eslint-disable react-native/no-unused-styles, react-native/sort-styles */
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import type { KpiTile } from '@harmony/data';
import { dataClient } from '../../state/stores';
import { useAsyncList } from '../../hooks/useAsyncList';
import { LoadingState } from '../../components/LoadingState';
import { StateMessage } from '../../components/StateMessage';

type Trend = KpiTile['trend'];
type Status = KpiTile['status'];

const trendSymbols: Record<Trend, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
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
    row: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    tile: {
      backgroundColor: colors.surface,
      borderRadius: spacing.md,
      flex: 1,
      padding: spacing.lg,
    },
    ghostTile: {
      flex: 1,
      padding: spacing.lg,
      opacity: 0,
    },
    name: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.md,
    },
    category: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamilies.sans.regular,
      fontSize: typography.fontSizes.xs,
      marginTop: spacing.xs,
      textTransform: 'uppercase',
    },
    value: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamilies.sans.bold,
      fontSize: typography.fontSizes.xl,
      marginTop: spacing.lg,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      alignItems: 'center',
    },
    trend: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.sm,
    },
    statusBadge: {
      borderRadius: spacing.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    statusLabel: {
      color: colors.surface,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.xs,
    },
    statusGreen: {
      backgroundColor: colors.success,
    },
    statusAmber: {
      backgroundColor: colors.warning,
    },
    statusRed: {
      backgroundColor: colors.danger,
    },
  });

const getStatusStyle = (styles: ReturnType<typeof createStyles>, status: Status) => {
  switch (status) {
    case 'green':
      return styles.statusGreen;
    case 'amber':
      return styles.statusAmber;
    case 'red':
      return styles.statusRed;
    default:
      return styles.statusGreen;
  }
};

const formatValue = (tile: KpiTile) =>
  `${tile.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${tile.unit}`.trim();

const chunkTiles = (tiles: KpiTile[], size: number) => {
  const rows: KpiTile[][] = [];
  for (let index = 0; index < tiles.length; index += size) {
    rows.push(tiles.slice(index, index + size));
  }
  return rows;
};

export const KpiScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, typography),
    [colors, spacing, typography]
  );

  const fetchKpis = useCallback(async () => {
    const items = await dataClient.kpis.list();
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const { data, loading, refreshing, error, refresh } = useAsyncList(fetchKpis);

  const rows = useMemo(() => chunkTiles(data, 2), [data]);

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading KPIs…" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <StateMessage title="KPI data unavailable" description={error} variant="error" />
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={(row, index) => row.map((tile) => tile.id).join('-') || `row-${index}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.map((tile) => (
              <View key={tile.id} style={styles.tile}>
                <Text style={styles.name}>{tile.name}</Text>
                {tile.category ? <Text style={styles.category}>{tile.category}</Text> : null}
                <Text style={styles.value}>{formatValue(tile)}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.trend}>
                    {trendSymbols[tile.trend]} {tile.trendPercentage.toFixed(1)}%
                  </Text>
                  <View style={[styles.statusBadge, getStatusStyle(styles, tile.status)]}>
                    <Text style={styles.statusLabel}>{tile.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            ))}
            {item.length === 1 ? <View style={styles.ghostTile} /> : null}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <StateMessage
            title="No KPI tiles yet"
            description="Add tiles from the Harmony desktop experience to see them here."
          />
        }
      />
    </View>
  );
};
