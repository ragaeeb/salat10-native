import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { theme } from '@/constants/theme';

type Props = {
    rotation: number;
    isAligned: boolean;
};

export function QiblaArrow({ rotation, isAligned }: Props) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: withSpring(`${rotation}deg`, { damping: 15, stiffness: 80 }) }],
    }));

    const arrowColor = isAligned ? theme.colors.green500 : theme.colors.foreground;

    return (
        <View style={styles.container}>
            {/* Center crosshair */}
            <View style={[styles.crosshair, { backgroundColor: isAligned ? theme.colors.green500 : theme.colors.white50 }]} />

            <Animated.View style={[styles.arrowContainer, animatedStyle]}>
                <Svg width={80} height={200} viewBox="0 0 80 200">
                    {/* Arrow shaft */}
                    <Line x1="40" y1="180" x2="40" y2="30" stroke={arrowColor} strokeWidth="3" />
                    {/* Arrow head */}
                    <Polygon points="40,10 25,40 55,40" fill={arrowColor} />
                    {/* Tip circle */}
                    <Circle cx="40" cy="10" r="6" fill={theme.colors.green500} />
                </Svg>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    crosshair: {
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
        zIndex: 10,
    },
    arrowContainer: {
        width: 80,
        height: 200,
    },
});
