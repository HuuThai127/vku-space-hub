import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { COLORS, SPACING } from '../../constants/theme';
import { useBookingStore } from '../../store/useBookingStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export const SplashScreen: React.FC<RootStackScreenProps<'Splash'>> = ({
  navigation,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const restoreSession = useBookingStore((s) => s.restoreSession);
  const fetchRooms = useRoomStore((s) => s.fetchRooms);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const initApp = async () => {
      // Parallel loading of essential services
      await Promise.all([
        restoreSession(),
        fetchRooms(),
        fetchNotifications(),
        new Promise((resolve) => setTimeout(resolve, 1400)), // Smooth splash delay
      ]);

      const currentUser = useBookingStore.getState().user;
      if (currentUser) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Login');
      }
    };

    initApp();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="business" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.brandTitle}>VKU SpaceHub</Text>
        <Text style={styles.brandSubtitle}>
          Campus Room & Computer Lab Booking Manager
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Vietnam - Korea University of Information and Communication Technology
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
