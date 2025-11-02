import { StyleSheet, Image, View, ImageSourcePropType } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

type GaugeProps = {
  icon: ImageSourcePropType;
  color: string;
  percent: number;
  indicator: number;
  decrease: boolean;
};

export default function Gauge({ icon, color, percent, indicator, decrease } : GaugeProps) {

    const delta = 5;    // to shift the fill bar to the top and avoid to hide it behind the icon
    const newPercent = percent === 0 ? 0 : delta + percent * (100 - delta) / 100;

    const prevPercent = useRef(percent);    // to stock the previous percent (and compare with the current)
    const gaugeAnim = useSharedValue(newPercent);   // hauteur jauge
    const flashAnim = useSharedValue(0);            // blink rouge

    // Animation flash rouge qui se déclenche quand la jauge tombe à zero
    useEffect(() => {
  
        // smooth transition hauteur
        gaugeAnim.value = withTiming(newPercent, {
            duration: 200,
        });

        // flash rouge si tombe à zéro
        if (percent <= 0 && prevPercent.current > 0) {
            flashAnim.value = 1;
            flashAnim.value = withTiming(0, { duration: 300 });
        }

        prevPercent.current = percent;
    }, [percent]);

    const barStyle = useAnimatedStyle(() => ({
        height: `${gaugeAnim.value}%`
    }));

    const flashStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            flashAnim.value,
            [0, 1],
            ['#554946', 'darkred']
        ),
    }));


    // indicator
    let sizeIndicator = 0;
    if(indicator > 0){
        if(indicator <= 10){
            sizeIndicator = 5;
        }else if(indicator <= 20){
            sizeIndicator = 10;
        }
        else{
            sizeIndicator = 15;
        }
    }
   

  return (
    <View style={styles.container}>
        <View style={styles.indicatorContainer}>
        {indicator > 0 && <FontAwesome name={'circle' as any} size={sizeIndicator} color='#ae9273' />}
        </View>
        <View style={styles.gaugeGlobalContent}>                                          
            <Animated.View style={[styles.barContainer, flashStyle]}>
                <Animated.View style={[styles.barFill, barStyle, { backgroundColor: color }]} />                
            </Animated.View>
            {decrease && <FontAwesome name={'caret-down' as any} style={styles.arrow} size={25} color='#ea4200ff' />}
            <Image source={icon} style={styles.icon} />
        </View>
        
    </View>
  );
}

const styles = StyleSheet.create({
container: {

    justifyContent: 'center',
    alignItems: 'center',
    gap : 5

},
indicatorContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
},
gaugeGlobalContent:{
    width: 40,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

},
icon:{
    width: 35,
    height: 35,
    marginTop: -12,

},
barContainer: {
    width: 18,
    height: 70,
    borderTopLeftRadius : 9,
    borderTopRightRadius : 9,
    backgroundColor: '#554946',

    borderColor: '#242120',
    borderWidth: 4,
    justifyContent: 'flex-end',

    overflow : 'hidden'

},
barFill: {
    width: '100%',
    height: '90%',

    backgroundColor: '#8378b7'
},
arrow :{
    position: 'absolute',
    top: 0,
    left : 5
}
});
