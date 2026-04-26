export const colorTokens = {
  orange: {
    50: '#FFF4EA',
    100: '#FFE6CF',
    200: '#FFD0A4',
    400: '#FF9D47',
    500: '#F97316',
    600: '#EA6A0C',
  },
  cream: '#FFFBF5',
  creamDeep: '#FDF5EA',
  beige: '#F5EDE2',
  text: '#2B2118',
  stone: '#8B8378',
  border: '#EADFCF',
  green: {
    50: '#EFF9F1',
    100: '#DBF2DF',
    500: '#43A365',
  },
} as const;

export const typographyTokens = {
  fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  display: {
    size: '48px',
    lineHeight: '56px',
    weight: 700,
  },
  heading: {
    size: '32px',
    lineHeight: '40px',
    weight: 600,
  },
  body: {
    size: '15px',
    lineHeight: '24px',
    weight: 400,
  },
  caption: {
    size: '12px',
    lineHeight: '18px',
    weight: 500,
  },
} as const;

export const spacingTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  x2l: 32,
  x3l: 40,
} as const;

export const radiusTokens = {
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const shadowTokens = {
  soft: '0 8px 24px rgba(54, 38, 24, 0.06)',
  hover: '0 14px 32px rgba(54, 38, 24, 0.12)',
} as const;
