import { Dimensions, ImageBackground, Text, StyleSheet, View, Pressable } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

type IntoductionScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}


const cinematicTimeline = [
  { phase: 'first', duration: 5000 },
  { phase: 'second', duration: 12000 },
  { phase: 'third', duration: 14000 },
];

export default function IntroductionScreen({ navigation } : IntoductionScreenProps) {

    const [cinematicPhase, setcinematicPhase] = useState<string>('first');
    const indexRef = useRef(0);

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    const timeoutsRef = useRef<number[]>([]);

    // skip
    const [showSkipMessage, setShowSkipMessage] = useState(false);
    const lastTap = useRef<number | null>(null);

    // On stocke les timeout pour pouvoir les cleaner quand on skip l'intro
    const setCinematicTimeout = (fn: Function, delay: number) => {
      const id = setTimeout(fn, delay);
      timeoutsRef.current.push(id);
    };

    // reset des anims et des timeouts
    const reset = () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];

      // On reset les animations
      /*imageScale.value = 1;
      translateX.value = 0;
      secondTranslateX.value = 0;
      thirdImageScale.value = 1;
      thirdTranslateX.value = 0;*/
    }

    const handleTap = () => {
        const now = Date.now();

        if (lastTap.current && now - lastTap.current < 250) {
            // Double tap détecté, on skip (et on reset les timeout)
            reset();
            navigation.navigate('Connexion', { screen: 'ConnexionScreen' });
            return;
        }

        // tap simple, on enregistre le moment pour le comparer au tap suivant
        lastTap.current = now;
        setShowSkipMessage(true);

        // Cache le message avec 2s
        setTimeout(() => setShowSkipMessage(false), 2000);
    };



    // FIRST IMAGE - Initialisation des valeurs pour les animation
    const firstImageWidth = 665;
    const firstImageHeight = 832;
    const firstScale = Math.max(screenWidth / firstImageWidth, screenHeight / firstImageHeight);
    const firstDisplayWidth = firstImageWidth * firstScale;
    const firstDisplayHeight = firstImageHeight * firstScale;

    const imageScale = useSharedValue(1.4);   // zoom de départ
    const translateX = useSharedValue(-50);   // décalage initial vers la gauche

    // SECOND IMAGE
    const secondImageWidth = 1248;
    const secondImageHeight = 832;
    const secondScale = Math.max(screenWidth / secondImageWidth * 1.2, screenHeight / secondImageHeight * 1.2);
    const secondDisplayWidth = secondImageWidth * secondScale;
    const secondDisplayHeight = secondImageHeight * secondScale;

    const secondTranslateX = useSharedValue(0 + secondDisplayWidth / 4); // animation horizontale

    // THIRD IMAGE
    const thirdImageWidth = 1248;
    const thirdImageHeight = 832;
    const thirdScale = Math.max(screenWidth / secondImageWidth * 1.2, screenHeight / secondImageHeight * 1.2);
    const thirdDisplayWidth = thirdImageWidth * thirdScale;
    const thirdDisplayHeight = thirdImageHeight * thirdScale;

    const thirdImageScale = useSharedValue(1.4);   // zoom de départ
    const thirdTranslateX = useSharedValue(300); // animation horizontale

    useFocusEffect(
      useCallback(() => {
        
        const startTimeline = () => {
          const nextPhase = () => {
            if(indexRef.current < cinematicTimeline.length){

              const phaseData = cinematicTimeline[indexRef.current];  // on récupère les données de la phase courant (nom et durée)
              setcinematicPhase(phaseData.phase);

              indexRef.current++; // on incrémente la phase

              if(indexRef.current < cinematicTimeline.length) {  // Si la dernière phase n'est pas encore atteinte, on lance la phase suivante
              setCinematicTimeout(nextPhase, phaseData.duration); // on lance la phase en renseignant sa durée
              } else {
              setCinematicTimeout(() => {
                  navigation.navigate('Connexion', { screen: 'ConnexionScreen' }); // toutes les phases sont passées, on est envoyé vers l'écran connexion
            }, phaseData.duration);
        }
    }
   
  };
      nextPhase();
    };

    startTimeline();

    // Clean des timeout quand on quitte l'écran
    return () => {
      reset();
    };

  }, [])
);


useEffect(() => {

  // définition des animations de la phase 1
  if (cinematicPhase === 'first') {
    imageScale.value = withTiming(1.2, { duration: 5000 }); // dezoom
    translateX.value = withTiming(-50, { duration: 5000 }); // léger travelling vers la gauche
  }
  else if(cinematicPhase === 'second'){ // définition des animations de la phase 2
    secondTranslateX.value = withTiming(-screenWidth, { duration: 12000 }); // travelling vers la droite
  }
  else if(cinematicPhase === 'third') { // définition des animations de la phase 3
    thirdImageScale.value = withTiming(1, { duration: 5000 }); // dezoom
    thirdTranslateX.value = withTiming(150, { duration: 12000 }); // léger travelling vers la droite
  }
}, [cinematicPhase]);


  // Style à appliquer sur la première image
  const firstAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: imageScale.value },
      { translateX: translateX.value }
    ]
  }));

    // Style à appliquer sur la seconde image
  const secondAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: secondTranslateX.value }
    ]
  }));

   // Style à appliquer sur la troisième image
  const thirdAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: thirdImageScale.value },
      { translateX: thirdTranslateX.value }
    ]
  }));

  return (
    <Pressable style={{ flex: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }} onPress={handleTap}>
    
    {/* FIRST IMAGE*/}
    {cinematicPhase === 'first' && 
    <>
        <AnimatedImageBackground
            source={require('../assets/intro-1.jpg')}
            style={[{ width: firstDisplayWidth, height: firstDisplayHeight }, firstAnimatedStyle]}
        />
        <View style={styles.fixed}>
            <Animated.View entering={FadeIn.duration(500).delay(1500)} style={styles.textContainer}>
            <Text style={styles.text}>Le monde d'avant n'existe plus.</Text>
            </Animated.View>
        </View>
    </>
    }

    {/* SECOND IMAGE*/}
    {cinematicPhase === 'second' && 
    <>
        <AnimatedImageBackground
            source={require('../assets/intro-2.jpg')}
            style={[{ width: secondDisplayWidth, height: secondDisplayHeight }, secondAnimatedStyle]}
        />
        <View style={styles.fixed}>
            <Animated.View entering={FadeIn.duration(500).delay(1500)} style={styles.textContainer}>
                <Text style={styles.text}>Les villes se sont effondrées dans le chaos et le feu.</Text>
            </Animated.View>
            <View style={styles.textSection}>
                <Animated.View entering={FadeIn.duration(500).delay(6000)} style={styles.textContainer2}>
                    <Text style={styles.text}>Partout, il ne reste que des ruines.</Text>
                </Animated.View>
                <Animated.View entering={FadeIn.duration(500).delay(7500)} style={styles.textContainer3}>
                    <Text style={styles.text}>Des corps.</Text>
                </Animated.View>
                <Animated.View entering={FadeIn.duration(500).delay(9000)} style={styles.textContainer3}>
                    <Text style={styles.text}>Des arbres calcinés.</Text>
                </Animated.View>
            </View>

        </View>
    </>
    }

    {/* THIRD IMAGE*/}
    {cinematicPhase === 'third' && 
    <>
        <AnimatedImageBackground
            source={require('../assets/intro-3.jpg')}
            style={[{ width: thirdDisplayWidth, height: thirdDisplayHeight }, thirdAnimatedStyle]}
        />
         <View style={styles.fixed}>
            <View style={styles.textSection}>
                <Animated.View entering={FadeIn.duration(500).delay(500)} style={styles.textContainer}>
                    <Text style={styles.textbig}>Nous sommes des survivants.</Text>
                </Animated.View>
                
            </View>

            <View style={[styles.textSection]}>

                {/*<Animated.View entering={FadeIn.duration(500).delay(6000)} style={[styles.textContainer2]}>
                    <Text style={styles.text}>Le danger peut venir de l'extérieur…</Text>
                </Animated.View>*/}
                <Animated.View entering={FadeIn.duration(500).delay(6000)} style={styles.textContainer2}>
                    <Text style={styles.text}>Dans ce monde désolé, chaque décision peut être la dernière.</Text>
                </Animated.View>
                <Animated.View entering={FadeIn.duration(500).delay(8000)} style={[styles.textContainer, {marginLeft : 60}]}>
                    <Text style={styles.text}>Et à la moindre erreur, nous risquons de tout perdre.</Text>
                </Animated.View>
            </View>
            
        </View>
    </>
    }

    {showSkipMessage && (
    <View style={styles.skipMessage}>
        <Text style={styles.skipText}>Appuyez deux fois pour passer</Text>
    </View>
    )}
      
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    /*justifyContent: 'flex-start',*/
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom : 110,
    paddingTop : 80
  },
  textContainer: {
    backgroundColor: '#e6dbcbff',
    maxWidth :'90%',
    borderWidth : 2,
    borderColor : 'black',
    borderRadius: 20,
    paddingHorizontal : 30,
    paddingVertical : 20,
    justifyContent: 'center',
  },
  textSection: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 30,
    gap : 20
  },
  thirdSection: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 30,
  },
  textContainer2: {
    backgroundColor: '#e6dbcbff',
    maxWidth :'70%',
    borderWidth : 2,
    borderColor : 'black',
    borderRadius: 20,
    paddingHorizontal : 30,
    paddingVertical : 20,
    justifyContent: 'center'
  },
  textContainer3: {
    backgroundColor: '#e6dbcbff',
    height : 80,
    borderWidth : 2,
    borderColor : 'black',
    borderRadius: 20,
    paddingHorizontal : 30,
    paddingVertical : 20,
    marginRight: 20,
    justifyContent: 'center'
  },
  text:{
    fontFamily: 'ArialRounded',
    fontSize: 20,
    textAlign: 'center',
    color: '#585858ff',
  },
   textbig:{
    fontFamily: 'ArialRounded',
    fontSize: 24,
    textAlign: 'center',
    color: '#585858ff',
  },
  skipMessage: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#0000007c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'ArialRounded',
 }
});
