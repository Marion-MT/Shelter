import React from "react";
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions } from "react-native";
import { useState, useEffect  } from 'react';
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
const SHOW_TEXT_THRESHOLD = 5;

type SwipeCardProps = {
  isConsequence: boolean;
  leftChoiceText: string;
  rightChoiceText: string
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  handleSideChange: (side: string) => void;
  triggerReset: boolean;
};


export default function AnimatedCard({ isConsequence, leftChoiceText, rightChoiceText, onSwipeLeft, onSwipeRight, handleSideChange, triggerReset }: SwipeCardProps) {

  const [isFlipped, setIsFlipped] = useState(true);     // whether the card is on the front side or the back side
  const flipRotation = useSharedValue(180); // 0 = front, 180 = back

  const translateX = useSharedValue(0);
  const swipeRotation = useSharedValue(0);

  const reset = () => {
    flipRotation.value = 180; // reset back side
    setIsFlipped(true);
    translateX.value = 0;
    swipeRotation.value = 0;

    // flip after short delay
    setTimeout(() => {
      flip();
    }, 200);
  }

  useEffect(() => {
    reset();
  }, [triggerReset]);

  // FLIP ANIMATION
  const flip = () => {
    flipRotation.value = withTiming(flipRotation.value === 0 ? 180 : 0, { duration: 500 }); // Rotation from 0 to 180 in 500ms
  };

  const frontAnimatedStyle = useAnimatedStyle((): ViewStyle => {
    return {
      transform: [
        {
          rotateY: `${interpolate(flipRotation.value, [0, 180], [0, 180])}deg`,
        },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const backAnimatedStyle = useAnimatedStyle((): ViewStyle => {

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
  .enabled(!isFlipped)    // allow swipe only if the card is on the front side
  .onUpdate((event) => {      // Update translate and rotation values in real time with the data of event
    translateX.value = event.translationX;
    swipeRotation.value = event.translationX / 20;
  })
  .onEnd(() => {

    const toRight = translateX.value > 0;     // bool that is true if the card has been swipping at right

    if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {     // Threshold to validate the gesture 
      translateX.value = withSpring(toRight ? width : -width, {});

      if (toRight && onSwipeRight) runOnJS(onSwipeRight)();
      else if (!toRight && onSwipeLeft) runOnJS(onSwipeLeft)(); 
      
    } else {
      translateX.value = withSpring(0);
      swipeRotation.value = withSpring(0);
    }
  });

  // create animated style with the values of the swipe
  const swipeAnimatedStyle = useAnimatedStyle((): ViewStyle => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${swipeRotation.value}deg` },
    ],
  }));


// get the information of the swipe side
const [swipeSide, setSwipeSide] = useState<'left' | 'right' | 'center'>('center');

useAnimatedReaction(
  () => translateX.value,
  (current) => {
    runOnJS(setSwipeSide)(Math.abs(current) > SHOW_TEXT_THRESHOLD || isConsequence? (current > 0 ? 'right' : 'left') : 'center');
    runOnJS(handleSideChange)(swipeSide);
  }
);


  return (
    <GestureDetector gesture={panGesture}>
      {/*<TouchableWithoutFeedback onPress={() => {if(flipRotation.value !== 0) flip()}}>*/}
        <View style={styles.container}>
          {isConsequence ?
          // Layout for consequences
          <Animated.View style={[styles.consequence, styles.front, frontAnimatedStyle, swipeAnimatedStyle]}>
                  <Text style={styles.textConsequence}>{rightChoiceText}</Text>
          </Animated.View> :
          // Normal layout
<         Animated.View style={[styles.card, styles.front, frontAnimatedStyle, swipeAnimatedStyle]}>
              <View style={styles.textSection}>
                  {swipeSide !== 'center' && <Text style={[styles.textChoice, {textAlign : swipeSide === 'right' ? 'left' : 'right'}]}>{swipeSide === 'right' ? rightChoiceText : leftChoiceText}</Text>}
              </View>    
          </Animated.View>
          }
         
          <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
          </Animated.View>
        </View>
      {/*</TouchableWithoutFeedback>*/}
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
    consequence:{
        backgroundColor: '#ffe7bf',
        width: 240,
        height: 240,
        borderRadius: 15,
        borderColor: '#242120',
        borderWidth: 4,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
        /*height: '35%',*/
        flexShrink: 1,
        backgroundColor: '#ae9273',
        padding: 18

    },
    textChoice: {
        fontFamily: 'ArialRounded',
        fontSize : 18,
        color: '#242120',
        flexWrap: 'wrap'
    },
    textConsequence: {
        fontFamily: 'ArialRounded',
        fontSize : 18,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#242120',
        flexWrap: 'wrap'
    },
    text: {
        fontSize: 22,
        color: "#242120",
    },
});
