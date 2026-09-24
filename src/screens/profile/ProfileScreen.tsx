import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { AppButton } from '../../components/common/AppButton';
import { useBookingStore } from '../../store/useBookingStore';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const user = useBookingStore((s) => s.user);
  const activeReservations = useBookingStore((s) => s.activeReservations);
  const bookingHistory = useBookingStore((s) => s.bookingHistory);
  const logout = useBookingStore((s) => s.logout);

  const totalBookings = activeReservations.length + bookingHistory.length;
  const completedCheckIns = bookingHistory.filter(
    (b) => b.status === 'completed'
  ).length + activeReservations.filter((b) => b.status === 'checked_in').length;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of VKU SpaceHub?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={40} color={COLORS.primary} />
              </View>
            )}
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || 'Nguyen Van Student'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'student@vku.edu.vn'}</Text>
          <Text style={styles.userMajor}>
            {user?.major || 'Information Technology'} • ID: {user?.studentId || '21IT001'}
          </Text>
        </View>

        {/* Academic Activity Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeReservations.length}</Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedCheckIns}</Text>
            <Text style={styles.statLabel}>Verified Check-ins</Text>
          </View>
        </View>

        {/* University Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Institution Details</Text>

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>University</Text>
              <Text style={styles.infoSub}>
                Vietnam - Korea University of Information and Communication Technology (VKU)
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Campus</Text>
              <Text style={styles.infoSub}>
                470 Tran Dai Nghia, Hoa Quy, Ngu Hanh Son, Da Nang
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <AppButton
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          icon={<Ionicons name="log-out-outline" size={20} color={COLORS.primary} />}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: SPACING.xl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignSelf: 'center',
  },
  roleText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userMajor: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    width: '100%',
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  infoContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    width: '100%',
    marginVertical: SPACING.md,
  },
  logoutBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxxl,
  },
});
