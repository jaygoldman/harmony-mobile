/* eslint-disable react-native/no-unused-styles, react-native/sort-styles */
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import type { TaskItem } from '@harmony/data';
import { dataClient } from '../../state/stores';
import { useAsyncList } from '../../hooks/useAsyncList';
import { LoadingState } from '../../components/LoadingState';
import { StateMessage } from '../../components/StateMessage';

type TaskStatus = TaskItem['status'];
type TaskPriority = TaskItem['priority'];

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
};

const priorityLabels: Record<TaskPriority, string> = {
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: colors.textPrimary,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.lg,
      flex: 1,
      marginRight: spacing.sm,
    },
    statusBadge: {
      borderRadius: spacing.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    statusText: {
      color: colors.surface,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.xs,
    },
    statusTodo: {
      backgroundColor: colors.info,
    },
    statusInProgress: {
      backgroundColor: colors.callout,
    },
    statusBlocked: {
      backgroundColor: colors.danger,
    },
    statusDone: {
      backgroundColor: colors.success,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    metaText: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamilies.sans.regular,
      fontSize: typography.fontSizes.sm,
    },
    description: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamilies.sans.regular,
      fontSize: typography.fontSizes.md,
      marginTop: spacing.sm,
    },
    priorityRow: {
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: spacing.sm,
    },
    priorityLabel: {
      color: colors.textSecondary,
      fontFamily: typography.fontFamilies.sans.medium,
      fontSize: typography.fontSizes.sm,
      marginLeft: spacing.xs,
    },
    priorityDot: {
      borderRadius: spacing.xs,
      height: spacing.sm,
      width: spacing.sm,
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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const getStatusStyle = (styles: ReturnType<typeof createStyles>, status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return styles.statusTodo;
    case 'inProgress':
      return styles.statusInProgress;
    case 'blocked':
      return styles.statusBlocked;
    case 'done':
      return styles.statusDone;
    default:
      return styles.statusTodo;
  }
};

const getPriorityStyle = (styles: ReturnType<typeof createStyles>, priority: TaskPriority) => {
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

export const TasksScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, typography),
    [colors, spacing, typography]
  );

  const fetchTasks = useCallback(async () => {
    const tasks = await dataClient.tasks.list();
    return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, []);

  const { data, loading, refreshing, error, refresh } = useAsyncList(fetchTasks);

  const renderItem = useCallback(
    ({ item }: { item: TaskItem }) => (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[styles.statusBadge, getStatusStyle(styles, item.status)]}>
            <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
          </View>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Due {formatDate(item.dueDate)}</Text>
          <Text style={styles.metaText}>{item.projectName}</Text>
        </View>
        <View style={styles.priorityRow}>
          <View style={[styles.priorityDot, getPriorityStyle(styles, item.priority)]} />
          <Text style={styles.priorityLabel}>
            Priority: {priorityLabels[item.priority]} • Assigned to {item.assignee.name}
          </Text>
        </View>
      </View>
    ),
    [styles]
  );

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading tasks…" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <StateMessage title="Tasks unavailable" description={error} variant="error" />
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
            title="No tasks yet"
            description="Create tasks from Harmony desktop to see them here."
          />
        }
      />
    </View>
  );
};
