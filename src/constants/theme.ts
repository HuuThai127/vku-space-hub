export const COLORS = {
  // Brand colors
  primary: '#0B4F9C',        // VKU Deep Ocean Blue
  primaryDark: '#083B76',    // Darker shade for pressed states
  primaryLight: '#E8F1FC',   // Subtle tint for chip backgrounds
  secondary: '#FF6D00',      // Energetic VKU Accent Orange
  secondaryLight: '#FFF3E0',

  // Status Colors
  available: '#10B981',      // Emerald Green
  availableBg: '#ECFDF5',
  availableBorder: '#A7F3D0',

  occupied: '#F59E0B',       // Amber
  occupiedBg: '#FFFBEB',
  occupiedBorder: '#FDE68A',

  maintenance: '#EF4444',    // Rose Red
  maintenanceBg: '#FEF2F2',
  maintenanceBorder: '#FECACA',

  checkedIn: '#3B82F6',      // Sky Blue
  checkedInBg: '#EFF6FF',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8FAFC',     // Clean slate gray background
  card: '#FFFFFF',
  textPrimary: '#0F172A',    // Dark slate 900
  textSecondary: '#475569',  // Slate 600
  textMuted: '#94A3B8',      // Slate 400
  border: '#E2E8F0',         // Slate 200
  borderLight: '#F1F5F9',    // Slate 100
  disabled: '#CBD5E1',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.65)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0B4F9C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
