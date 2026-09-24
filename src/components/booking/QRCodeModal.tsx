import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { AppButton } from '../common/AppButton';
import { StatusBadge } from '../common/StatusBadge';

interface QRCodeModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onCheckInSuccess: (bookingId: string) => Promise<void>;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  booking,
  onClose,
  onCheckInSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const isConfirmed = booking.status === 'confirmed';
  const isCheckedIn = booking.status === 'checked_in';

  const handleSimulateCheckIn = async () => {
    if (!isConfirmed) {
      if (booking.status === 'cancelled') {
        Alert.alert('Check-In Disallowed', 'Cannot check in to a cancelled reservation.');
      } else if (booking.status === 'completed') {
        Alert.alert('Check-In Disallowed', 'This reservation is already completed.');
      }
      return;
    }

    try {
      setLoading(true);
      await onCheckInSuccess(booking.id);
      setLoading(false);
      Alert.alert(
        'Check-In Successful! 🎉',
        `Welcome to ${booking.roomName}. Your attendance has been verified.`
      );
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Check-In Failed', err.message || 'Unable to complete check-in.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Scan to Check In</Text>
              <Text style={styles.subtitle}>{booking.roomName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Status */}
          <View style={styles.statusRow}>
            <StatusBadge status={booking.status} />
            <Text style={styles.bookingCodeText}>{booking.bookingCode}</Text>
          </View>

          {/* QR Display */}
          <View style={styles.qrContainer}>
            <QRCode
              value={booking.qrPayload}
              size={180}
              color={COLORS.primaryDark}
              backgroundColor={COLORS.white}
            />
          </View>

          <Text style={styles.instruction}>
            Position this QR code within the VKU SpaceHub door terminal scanner upon arrival.
          </Text>

          {/* Simulate Action for MVP */}
          <View style={styles.actionContainer}>
            {isCheckedIn ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.available} />
                <Text style={styles.successText}>Already Checked In</Text>
              </View>
            ) : (
              <AppButton
                title={loading ? 'Verifying Scanner...' : 'Simulate Scanner Check-in'}
                onPress={handleSimulateCheckIn}
                variant="primary"
                loading={loading}
                disabled={!isConfirmed || loading}
                icon={<Ionicons name="scan" size={18} color={COLORS.white} />}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  statusRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  bookingCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  qrContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  instruction: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },
  actionContainer: {
    width: '100%',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.availableBg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.availableBorder,
  },
  successText: {
    marginLeft: SPACING.sm,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.available,
  },
});
