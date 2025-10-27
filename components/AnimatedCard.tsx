import React from "react";
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions } from "react-native";
import { useState,  } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { ViewStyle } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

type SwipeCardProps = {
  leftChoiceText: string;
  rightChoiceText: string
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
};


export default function AnimatedCard({ leftChoiceText, rightChoiceText, onSwipeLeft, onSwipeRight }: SwipeCardProps) {

  const [isFlipped, setIsFlipped] = useState(true);
  const flipRotation = useSharedValue(180); // 0 = front, 180 = back

  const translateX = useSharedValue(0);
  const swipeRotation = useSharedValue(0);

  // FLIP ANIMATION
  const flip = () => {
    flipRotation.value = withTiming(flipRotation.value === 0 ? 180 : 0, { duration: 400 });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateY: `${interpolate(flipRotation.value, [0, 180], [0, 180])}deg`,
        },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {

    return {
      transform: [
        {
          rotateY: `${interpolate(flipRotation.value, [0, 180], [180, 360])}deg`,
        },
      ],
      backfaceVisibility: "hidden",
      position: "absolute",
      top: 0,
      left: 0,
    };
  });

  // Update IsFlipped each time flipRotation is change
  useAnimatedReaction(
  () => flipRotation.value,
  (currentRotation, previousRotation) => {
    if (previousRotation !== currentRotation) {
      runOnJS(setIsFlipped)(currentRotation !== 0);
    }
  }
);
  // SWIPE ANIMATION
  const panGesture = Gesture.Pan()
  .enabled(!isFlipped)
  .onUpdate((event) => {
    translateX.value = event.translationX;
    swipeRotation.value = event.translationX / 20;
  })
  .onEnd(() => {
    const toRight = translateX.value > 0;
    if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
      translateX.value = withSpring(toRight ? width : -width, {});
    } else {
      translateX.value = withSpring(0);
      swipeRotation.value = withSpring(0);
    }
  });

  const swipeAnimatedStyle = useAnimatedStyle((): ViewStyle => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${swipeRotation.value}deg` },
    ],
  }));


const [swipeSide, setSwipeSide] = useState<'left' | 'right' | 'center'>('left');

const checkSwipeRotation = (rotation: number) => {
  if(rotation === 0 ){
    return 'center';
  }
  else if(rotation > 0){
    return 'right';
  }
  else{
    return 'left';
  }
}

useAnimatedReaction(
  () => translateX.value,
  (current) => {
    runOnJS(setSwipeSide)(Math.abs(current) > 5 ? (current > 0 ? 'right' : 'left') : 'center');
  }
);

  return (
    <GestureDetector gesture={panGesture}>
      <TouchableWithoutFeedback onPress={() => {if(flipRotation.value !== 0) flip()}}>
        <View style={styles.container}>
          <Animated.View style={[styles.card, styles.front, frontAnimatedStyle, swipeAnimatedStyle]}>
              <View style={styles.textSection}>
                  {swipeSide !== 'center' && <Text style={styles.textChoice}>{swipeSide === 'right' ? rightChoiceText : leftChoiceText}</Text>}
              </View>    
          </Animated.View>

          <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
    container: {
        width: 240,
        height: 240,
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        backgroundColor: '#ffe7bf',
        width: 240,
        height: 240,
        borderRadius: 15,
        borderColor: '#242120',
        borderWidth: 4,
        overflow: 'hidden'
    },
    front: {
        backgroundColor: "#ffe7bf",
    },
    back: {
        backgroundColor: "#242120",
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioactiveIcon: {
        width: 150,
        height: 150
    },
    textSection: {
        width: '100%',
        height: '35%',
        backgroundColor: '#ae9273',
        padding: 18

    },
    textChoice: {
        fontFamily: 'ArialRounded',
        fontSize : 18,
        color: '#242120'
    },
    text: {
        fontSize: 22,
        color: "#242120",
    },
});
