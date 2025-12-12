import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { colors, shadows } from '../theme';

/**
 * Wealth Buddy Logo Component
 * Reusable logo with optional animation and glow effect
 */
const Logo = ({ size = 40, animated = false, showGlow = true }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (animated) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [animated]);

    const logoStyle = animated
        ? {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
        }
        : {};

    return (
        <Animated.View style={[styles.container, logoStyle]}>
            <View style={[styles.logoWrapper, showGlow && styles.logoGlow, { width: size, height: size }]}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={[styles.logo, { width: size, height: size }]}
                    resizeMode="contain"
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrapper: {
        borderRadius: 12,
        padding: 4,
    },
    logoGlow: {
        ...shadows.glow(colors.primary.main),
    },
    logo: {
        tintColor: colors.primary.main,
    },
});

export default Logo;
