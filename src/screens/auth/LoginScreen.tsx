import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { useBookingStore } from '../../store/useBookingStore';

export const LoginScreen: React.FC<RootStackScreenProps<'Login'>> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('student@vku.edu.vn');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useBookingStore((s) => s.login);
  const register = useBookingStore((s) => s.register);
  const loginDemo = useBookingStore((s) => s.loginDemo);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your VKU institutional email.');
      return;
    }
    const effectivePassword =
      !password || password === '••••••••' ? 'student123' : password;

    try {
      setLoading(true);
      setError(null);
      if (isRegistering) {
        await register({
          email,
          password: effectivePassword,
          fullName: fullName.trim() || undefined,
        });
      } else {
        await login(email, effectivePassword);
      }
      setLoading(false);
      navigation.replace('MainTabs');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginDemo();
      setLoading(false);
      navigation.replace('MainTabs');
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Login Error', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="business" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.brandTitle}>VKU SpaceHub</Text>
          <Text style={styles.welcomeText}>Student & Faculty Portal</Text>
          <Text style={styles.hintText}>
            Sign in with your institutional VKU Google Account
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {isRegistering && (
            <AppInput
              label="Full Name"
              placeholder="e.g. Nguyen Van Student"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              leftIcon="person-outline"
            />
          )}

          <AppInput
            label="Institutional Email"
            placeholder="student@vku.edu.vn"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={error}
          />

          <AppInput
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock-closed-outline"
          />

          <AppButton
            title={isRegistering ? 'Create Student Account' : 'Sign In'}
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            style={styles.signInBtn}
          />

          <AppButton
            title={
              isRegistering
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"
            }
            onPress={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            variant="ghost"
            style={styles.switchModeBtn}
          />

          <View style={styles.orDivider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR DEMO QUICK LOGIN</Text>
            <View style={styles.line} />
          </View>

          <AppButton
            title="Quick Login as Nguyen Van Student"
            onPress={handleDemoLogin}
            variant="secondary"
            icon={<Ionicons name="person-circle-outline" size={18} color={COLORS.primary} />}
            style={styles.demoBtn}
          />
        </View>

        {/* Demo Helper Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Demo Student: <Text style={styles.boldText}>Nguyen Van Student</Text> (21IT001)
            {'\n'}Role: <Text style={styles.boldText}>student</Text> • Campus: VKU Danang
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  signInBtn: {
    marginTop: SPACING.sm,
  },
  switchModeBtn: {
    marginTop: SPACING.xs,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    marginHorizontal: SPACING.sm,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  demoBtn: {
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
  },
  infoText: {
    marginLeft: SPACING.sm,
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 18,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
});
