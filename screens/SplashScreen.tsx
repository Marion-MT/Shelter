import { StyleSheet, ImageBackground, View, Pressable } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn
} from "react-native-reanimated";

type SplashscreenProps = {
    navigation: NavigationProp<ParamListBase>;
}


export default function ProfileScreen({ navigation }) {

  const translateX = useSharedValue(400); // at the launch, the title is outside the screen

  useEffect(() => {
     setTimeout(() => {
          translateX.value = withTiming(0, { duration: 1000 });  // 1s to translate to it position
      }, 200);

      setTimeout(() => {
          navigation.navigate('Connexion', { screen: 'ConnexionScreen'  });
      }, 3000);

  }, []);

  const animatedTitle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));


 return (
   <ImageBackground source={require('../assets/Splashscreen.jpg')} resizeMode="cover" style={styles.container}>
      <Pressable onPress={() => navigation.navigate('Connexion', { screen: 'ConnexionScreen' })} style={styles.main}>
        <Animated.Text entering={FadeIn.duration(1000)} style={[styles.title, animatedTitle]}>
        Shelter
        </Animated.Text>
        </Pressable>  
   </ImageBackground>
 );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    main:{
      width: '100%',
      height: '100%',
      alignItems : 'center',
      paddingTop : 100
    },
    title: {
        fontSize: 70,
        fontWeight: '600',
        fontFamily: 'DaysLater',
        color: '#EFDAB7',
        textShadowColor: '#242120',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 2,
        marginVertical: 60
    },

});