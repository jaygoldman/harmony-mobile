import React, { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@harmony/theme';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

type PercentString = `${number}%`;

type ShapeConfig = {
  size: number;
  top: number | PercentString;
  left: number | PercentString;
  travel: number;
  rotate: number;
};

const SHAPES: ShapeConfig[] = [
  { size: 360, top: '-8%', left: '-32%', travel: 28, rotate: 3.5 },
  { size: 280, top: '32%', left: '18%', travel: 34, rotate: 2.8 },
  { size: 320, top: '64%', left: '-18%', travel: 26, rotate: 3.2 },
];

const IsoCube: React.FC<{ accent: string }> = ({ accent }) => (
  <>
    <Polygon points="80,0 160,40 80,80 0,40" fill={accent} fillOpacity={0.28} />
    <Polygon points="80,80 160,40 160,120 80,160" fill={accent} fillOpacity={0.18} />
    <Polygon points="80,80 0,40 0,120 80,160" fill={accent} fillOpacity={0.22} />
  </>
);

export const OnboardingBackground: React.FC = () => {
  const { palette } = useTheme();

  const animatedValues = useMemo(() => SHAPES.map(() => new Animated.Value(Math.random())), []);

  useEffect(() => {
    const loops = animatedValues.map((value) => {
      const up = Animated.timing(value, {
        toValue: 1,
        duration: 7000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
      const down = Animated.timing(value, {
        toValue: 0,
        duration: 7000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
      const loop = Animated.loop(Animated.sequence([up, down]));
      loop.start();
      return loop;
    });

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [animatedValues]);

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%">
        <Defs>
          <LinearGradient id="onboardingGradient" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0%" stopColor={palette.primary} stopOpacity={1} />
            <Stop offset="100%" stopColor={palette.primaryVariant} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect fill="url(#onboardingGradient)" height="100%" width="100%" />
      </Svg>
      {SHAPES.map((shape, index) => {
        const animatedValue = animatedValues[index];
        const translateY = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-shape.travel, shape.travel],
        });
        const rotate = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [`-${shape.rotate}deg`, `${shape.rotate}deg`],
        });
        const opacity = animatedValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.3, 0.6, 0.3],
        });

        return (
          <AnimatedSvg
            key={`shape-${index}`}
            height={shape.size}
            style={[
              styles.shape,
              {
                top: shape.top,
                left: shape.left,
                opacity,
                transform: [{ translateY }, { rotate }],
              },
            ]}
            viewBox="0 0 160 160"
            width={shape.size}
          >
            <IsoCube accent={palette.neutral0} />
          </AnimatedSvg>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
  },
});
