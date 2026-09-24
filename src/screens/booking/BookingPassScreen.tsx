import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';
import { COLORS, SPACING } from '../../constants/theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { BookingPassCard } from '../../components/booking/BookingPassCard';
import { QRCodeModal } from '../../components/booking/QRCodeModal';
import { useBookingStore } from '../../store/useBookingStore';
import { AppButton } from '../../components/common/AppButton';

export const BookingPassScreen: React.FC<RootStackScreenProps<'BookingPass'>> = ({
  route,
  navigation,
}) => {
  const { bookingId } = route.params;

  const [modalVisible, setModalVisible] = useState(false);

  const booking = useBookingStore((s) =>
    s.allCampusBookings.find((b) => b.id === bookingId)
  );
  const checkIn = useBookingStore((s) => s.checkIn);

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Reservation pass not found.</Text>
        <AppButton title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const handleOpenCheckInModal = () => {
    setModalVisible(true);
  };

  const handleCheckInSuccess = async (id: string) => {
    await checkIn(id);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Digital Booking Pass"
        subtitle={booking.bookingCode}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BookingPassCard
          booking={booking}
          onCheckIn={
            booking.status === 'confirmed' ? handleOpenCheckInModal : undefined
          }
        />
      </ScrollView>

      {/* Interactive Check-in Modal */}
      <QRCodeModal
        visible={modalVisible}
        booking={booking}
        onClose={() => setModalVisible(false)}
        onCheckInSuccess={handleCheckInSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
});
