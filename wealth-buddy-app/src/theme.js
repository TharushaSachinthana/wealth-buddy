/**
 * Wealth Buddy - Modern Premium Theme
 * A sophisticated dark theme with glassmorphism, gradients, and neon accents
 */

export const colors = {
    // Backgrounds
    background: {
        primary: '#0F1624',
        secondary: '#1A2332',
        tertiary: '#243044',
        card: 'rgba(26, 35, 50, 0.85)',
        cardSolid: '#1A2332',
        glass: 'rgba(26, 35, 50, 0.75)',
    },

    // Primary brand colors
    primary: {
        main: '#00D9FF',
        light: '#5CE1FF',
        dark: '#00A3CC',
        glow: 'rgba(0, 217, 255, 0.3)',
    },

    // Accent colors
    accent: {
        purple: '#A855F7',
        pink: '#EC4899',
        blue: '#3B82F6',
        teal: '#14B8A6',
    },

    // Status colors
    success: {
        main: '#00E676',
        light: '#66FF99',
        dark: '#00B85C',
        glow: 'rgba(0, 230, 118, 0.3)',
    },

    danger: {
        main: '#FF5252',
        light: '#FF8A80',
        dark: '#CC4141',
        glow: 'rgba(255, 82, 82, 0.3)',
    },

    warning: {
        main: '#FFB300',
        light: '#FFCC4D',
        dark: '#CC8F00',
        glow: 'rgba(255, 179, 0, 0.3)',
    },

    // Text colors
    text: {
        primary: '#FFFFFF',
        secondary: '#94A3B8',
        muted: '#64748B',
        inverse: '#0F1624',
    },

    // Border colors
    border: {
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.2)',
        glow: 'rgba(0, 217, 255, 0.5)',
    },

    // Gradient presets
    gradients: {
        header: ['#0F1624', '#1A2332'],
        card: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)'], // Glass effect
        income: ['#00E676', '#00E676'],
        expense: ['#FF5252', '#FF5252'],
        primary: ['#00D9FF', '#00A3CC'],
        purple: ['#A855F7', '#7C3AED'],
        sunset: ['#F97316', '#EC4899'],
        ocean: ['#00D9FF', '#3B82F6', '#A855F7'],
        success: ['#00E676', '#14B8A6'],
        danger: ['#FF5252', '#F97316'],
        premium: ['#FFD700', '#FFA500', '#FF6B6B'],
        neon: ['#00D9FF', '#00E676', '#FFB300'],
        background: ['#0F1624', '#1A2332', '#0F1624'], // Main background
        button: ['#00D9FF', '#A855F7'], // Add button gradient
        balance: ['rgba(0, 217, 255, 0.2)', 'rgba(168, 85, 247, 0.2)'], // Balance card gradient
    },

    // New Design Specific Colors
    newDesign: {
        background: '#0F1624',
        surface: '#1A2332',
        cyan: '#00D9FF',
        purple: '#A855F7',
        pink: '#EC4899',
        green: '#00E676',
        red: '#FF5252',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        textMuted: 'rgba(255, 255, 255, 0.6)',
    },

    // Logo colors
    logo: {
        primary: '#00D9FF',
        glow: 'rgba(0, 217, 255, 0.4)',
        shadow: 'rgba(0, 217, 255, 0.6)',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
};

export const typography = {
    hero: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    heading1: {
        fontSize: 24,
        fontWeight: '700',
    },
    heading2: {
        fontSize: 20,
        fontWeight: '600',
    },
    heading3: {
        fontSize: 16,
        fontWeight: '600',
    },
    body: {
        fontSize: 14,
        fontWeight: '400',
    },
    bodyBold: {
        fontSize: 14,
        fontWeight: '600',
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
    },
    small: {
        fontSize: 10,
        fontWeight: '400',
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
    },
    glow: (color = colors.primary.main) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    }),
    neon: (color = colors.primary.main) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 12,
    }),
};

// Reusable card styles
export const cardStyles = {
    glass: {
        backgroundColor: colors.background.glass,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border.light,
        padding: spacing.xl,
        ...shadows.md,
    },
    glassEnhanced: {
        backgroundColor: 'rgba(26, 35, 50, 0.6)',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border.medium,
        padding: spacing.xl,
        ...shadows.lg,
        backdropFilter: 'blur(10px)',
    },
    solid: {
        backgroundColor: colors.background.cardSolid,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border.light,
        padding: spacing.xl,
        ...shadows.md,
    },
    elevated: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border.light,
        padding: spacing.lg,
        ...shadows.lg,
    },
    premium: {
        backgroundColor: colors.background.glass,
        borderRadius: borderRadius.xxl,
        borderWidth: 2,
        borderColor: colors.primary.main + '30',
        padding: spacing.xl,
        ...shadows.neon(colors.primary.main),
    },
};

// React Native Paper theme customization
export const paperTheme = {
    dark: true,
    roundness: borderRadius.md,
    colors: {
        primary: colors.primary.main,
        accent: colors.accent.purple,
        background: colors.background.primary,
        surface: colors.background.secondary,
        text: colors.text.primary,
        placeholder: colors.text.muted,
        backdrop: 'rgba(0, 0, 0, 0.7)',
        notification: colors.danger.main,
        error: colors.danger.main,
        onSurface: colors.text.primary,
        disabled: colors.text.muted,
        outline: colors.border.medium,
        surfaceVariant: colors.background.tertiary,
        primaryContainer: colors.primary.dark,
        onPrimaryContainer: colors.text.primary,
        secondaryContainer: colors.accent.purple,
        onSecondaryContainer: colors.text.primary,
        elevation: {
            level0: 'transparent',
            level1: colors.background.secondary,
            level2: colors.background.tertiary,
            level3: colors.background.card,
            level4: colors.background.glass,
            level5: colors.background.glass,
        },
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
    cardStyles,
    paperTheme,
};
