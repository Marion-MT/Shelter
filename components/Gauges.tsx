import { StyleSheet, Image, View, Animated, ViewProps } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { ImageSourcePropType } from 'react-native';
import { useEffect, useRef } from 'react';
import { ViewInfo } from 'react-native-reanimated/lib/typescript/createAnimatedComponent/commonTypes';

type GaugeProps = {
  icon: ImageSourcePropType;
  color: string;
  percent: number;
  indicator: number;
};

export default function Gauge({ icon, color, percent, indicator } : GaugeProps) {

    const delta = 5;    // to shift the fill bar to the top and avoid to hide it behind the icon
    const newPercent = percent === 0 ? 0 : delta + percent * (100 - delta) / 100;

    const flashAnim = useRef(new Animated.Value(0)).current;
    const prevPercent = useRef(percent);



    useEffect(() => {

        if (percent <= 0 && prevPercent.current > 0) {
        Animated.sequence([
            Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
            Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: false })
        ]).start();
        }

        prevPercent.current = percent;
    }, [percent]);

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#554946', 'darkred'] // normal → red
  });

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
            <Animated.View style={[styles.barContainer, { backgroundColor }]}>
                <View style={[styles.barFill, { height: `${newPercent}%`, backgroundColor : color}]} >

                </View>
            </Animated.View>
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
}
});
