import { StyleSheet, Image, View } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { ImageSourcePropType } from 'react-native';

type GaugeProps = {
  icon: ImageSourcePropType;
  color: string;
  percent: number;
  indicator: number;
};

export default function Gauge({ icon, color, percent, indicator } : GaugeProps) {


    const delta = 5;    // to shift the fill bar to the top and avoid to hide it behind the icon
    const newPercent = delta + percent * (100 - delta) / 100;
 
  return (
    <View style={styles.container}>
        <View style={styles.indicatorContainer}>
        {indicator > 0 && <FontAwesome name={'circle' as any} size={indicator} color='#ae9273' />}
        </View>

        <View style={styles.gaugeGlobalContent}>                               
            <View style={styles.barContainer}>
                <View style={[styles.barFill, { height: `${newPercent}%`, backgroundColor: color}]} >

                </View>
            </View>
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
