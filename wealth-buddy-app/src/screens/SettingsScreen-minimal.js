import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext-v2';
import { colors, spacing, borderRadius, shadows, cardStyles } from '../theme';
import Logo from '../components/Logo';

export default function SettingsScreen() {
  const { user, goals } = useApp();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.logoContainer}>
          <Logo size={56} animated={true} showGlow={true} />
        </View>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <View style={styles.statusDot} />
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userStatus}>Premium Member</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{goals.length}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{goals.filter(g => (g.current / g.target) >= 1).length}</Text>
            <Text style={styles.statLabel}>Achieved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.savingsPercent || 0}%</Text>
            <Text style={styles.statLabel}>Savings Rate</Text>
          </View>
        </View>
      </View>

      {/* Financial Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Settings</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: colors.success.main + '20' }]}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={colors.success.main} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Monthly Salary</Text>
              <Text style={styles.settingValue}>
                Rs. {(user?.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.muted} />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: colors.primary.main + '20' }]}>
              <MaterialCommunityIcons name="piggy-bank" size={20} color={colors.primary.main} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Savings Target</Text>
              <Text style={styles.settingValue}>{user?.savingsPercent || 0}% of income</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.muted} />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: colors.warning.main + '20' }]}>
              <MaterialCommunityIcons name="shield-check" size={20} color={colors.warning.main} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Buffer Fund</Text>
              <Text style={styles.settingValue}>{user?.bufferPercent || 0}% of income</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.muted} />
          </View>
        </View>
      </View>

      {/* Your Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          <Text style={styles.sectionBadge}>{goals.length}</Text>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyGoals}>
            <MaterialCommunityIcons name="trophy-outline" size={32} color={colors.text.muted} />
            <Text style={styles.emptyText}>No goals yet</Text>
          </View>
        ) : (
          <View style={styles.goalsGrid}>
            {goals.slice(0, 4).map((goal) => {
              const progress = goal.target > 0 ? ((goal.current / goal.target) * 100) : 0;
              const isCompleted = progress >= 100;
              return (
                <View key={goal.id} style={styles.goalMini}>
                  <View style={styles.goalMiniHeader}>
                    <View style={[
                      styles.goalMiniIcon,
                      { backgroundColor: isCompleted ? colors.success.main + '20' : colors.primary.main + '20' }
                    ]}>
                      <MaterialCommunityIcons
                        name={isCompleted ? 'check' : 'target'}
                        size={16}
                        color={isCompleted ? colors.success.main : colors.primary.main}
                      />
                    </View>
                    <Text style={styles.goalMiniPercent}>{progress.toFixed(0)}%</Text>
                  </View>
                  <Text style={styles.goalMiniName} numberOfLines={1}>{goal.name}</Text>
                  <Text style={styles.goalMiniAmount}>
                    Rs. {(goal.target || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                  <View style={styles.goalMiniProgress}>
                    <View style={[
                      styles.goalMiniProgressBar,
                      { width: `${Math.min(progress, 100)}%`, backgroundColor: isCompleted ? colors.success.main : colors.primary.main }
                    ]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingCard}>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: colors.accent.purple + '20' }]}>
              <MaterialCommunityIcons name="palette" size={20} color={colors.accent.purple} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingValue}>Dark Mode</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.muted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: colors.accent.pink + '20' }]}>
              <MaterialCommunityIcons name="bell" size={20} color={colors.accent.pink} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingValue}>Enabled</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.muted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: colors.accent.teal + '20' }]}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={colors.accent.teal} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Currency</Text>
              <Text style={styles.settingValue}>LKR (Rs.)</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.settingCard}>
          <View style={styles.appInfoItem}>
            <View style={[styles.settingIcon, { backgroundColor: colors.primary.main + '20' }]}>
              <MaterialCommunityIcons name="wallet" size={20} color={colors.primary.main} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Wealth Buddy</Text>
              <Text style={styles.settingValue}>Version 1.0.0</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: colors.text.muted + '20' }]}>
              <MaterialCommunityIcons name="file-document" size={20} color={colors.text.muted} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.text.muted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={[styles.settingIcon, { backgroundColor: colors.text.muted + '20' }]}>
              <MaterialCommunityIcons name="script-text" size={20} color={colors.text.muted} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for your financial wellness</Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  profileCard: {
    ...cardStyles.glass,
    margin: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow(colors.primary.main),
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success.main,
    borderWidth: 3,
    borderColor: colors.background.secondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: colors.primary.main,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.muted,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border.light,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionBadge: {
    backgroundColor: colors.primary.main + '30',
    color: colors.primary.main,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    marginLeft: spacing.sm,
    marginBottom: spacing.md,
  },
  settingCard: {
    ...cardStyles.glass,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  appInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 13,
    color: colors.text.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 72,
  },
  emptyGoals: {
    ...cardStyles.glass,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  goalMini: {
    width: '50%',
    padding: spacing.xs,
  },
  goalMiniInner: {
    ...cardStyles.glass,
    padding: spacing.md,
  },
  goalMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  goalMiniIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalMiniPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.main,
  },
  goalMiniName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
    paddingHorizontal: spacing.md,
  },
  goalMiniAmount: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  goalMiniProgress: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  goalMiniProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: 13,
    color: colors.text.muted,
  },
});
