import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity } from "react-native"
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../components/fetchWithAuth';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  FadeIn,
  FadeOut
} from "react-native-reanimated";
import Gauge from '../components/Gauges';
import AnimatedCard from '../components/AnimatedCard';

import { useSelector, useDispatch } from "react-redux";
import { setGauges, setCurrentCard, setCurrentNumberDays, Card } from "../reducers/user";

import AudioManager from "../modules/audioManager";
import { getImage } from '../modules/imagesSelector';


type GameScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

type GameResponse = {
  result: boolean;
  gauges: {
    hunger: number;
    security: number;
    health: number;
    moral: number;
    food: number;
  };
  numberDays: number;
  gameover?: boolean;
  card?: Card;
  death?: {
    type: string;
    title: {
      hook: string;
      phrase: string;
    };
    description: string;
  };
  achievements: [];
};


export default function GameScreen({ navigation }: GameScreenProps ) {

    const dispatch = useDispatch();

    const user = useSelector((state: string) => state.user.value);
    const currentCard = user.currentCard;

    const [currentSide, setCurrentSide] = useState<string>('center');
    const [triggerReset, setTriggerReset] = useState<boolean>(false);
    const [gameover, setGameover] = useState<boolean>(false);

    const [showConsequence, setShowConsequence] = useState<boolean>(false);
    const [consequenceText, setConsequenceText] = useState<string | null>(null);

    const [locked, SetLocked] = useState<boolean>(false); // lock interaction during animations times

    const [lastResponse, setLastResponse] = useState<GameResponse|null>(null); //used to store data when there is a consequence to display before displaying the next card (or gameover)
        
    const foodBlink = useSharedValue(1);
    const shakeOffset = useSharedValue(0); // pour seccouer la carte quand gameover

    useFocusEffect(
        useCallback(() => {

        AudioManager.playBackgroundGame();

        return () => {
            AudioManager.pauseBackgroundGame();
            AudioManager.playBackground();
        };
    }, [])
    );

    const resetGame = () => {
        SetLocked(false);
        setLastResponse(null);
        setShowConsequence(false);
        setConsequenceText(null);
        setCurrentSide('center');
        setGameover(false);
        setTriggerReset(prev => !prev);
    }
    
    useFocusEffect(
        useCallback(() => {
            
            resetGame();

             return () => {
                resetGame();
            };

        }, [])
    );
    

    // Met à jour le côté où est penchée la carte (right/left/middle)
    const handleSideChange = (side: string) : void => {
        setCurrentSide(side)
    }

      // ANIMATION GAMEOVER
    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeOffset.value }],
    }));

    const triggerShake = () => {
        shakeOffset.value = withRepeat(
            withTiming(10, { duration: 50 }), // décalage vers la droite
            6, // nombre de répétitions
            true // reverse automatique
        );

        // Reset une fois l'animation finie
        setTimeout(() => {
            shakeOffset.value = withTiming(0, { duration: 50 });
        }, 350);
    };


    // Déclenche le gameover
    const triggerGameover = (type: string, hook: string, phrase: string, description: string, achievements: [] ) => {
        setTimeout(() => {
            AudioManager.pauseBackgroundGame();
            navigation.navigate('EndGame', { screen: 'EndGame', type: type, hook: hook, phrase: phrase, description: description, achievements: achievements  });
        }, 1000);
    }

    // Déclenche le gameover
    const handleGameover = (achievements: [] ) => {

        setTimeout(() => {
            resetGame();
            navigation.navigate('RecapGame', { screen: 'RecapGame', achievements: achievements  });
        }, 1000);
    }

  
    // traite de choix une fois que le swipe est validé
    const handleChoice  = async () : Promise<void> => {

        try{
            if(!showConsequence){ // Il n'y pas de conséquence à affichier pour la carte courante

                // On envoie le choix au back
                const response = await fetchWithAuth(`/games/choice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ choice:  currentSide}),
                } );

                const data = await response.json();
                console.log('console log de data : ',data)
                if(!data.result){ // Si pas de result, on déclenche le gameover pour ne pas bloquer le joueur dans la partie
                    //triggerGameover("","","","",[]);
                    console.log("gameover because there is not other cards");
                    handleGameover([]);
                    return;
                }

                //console.log(data);

                setLastResponse(data); // On stock la précédente réponse (qui contient la carte ou les infos du gameover, au cas où il y a une conséquence à afficher)

                dispatch(setGauges(data.gauges)); // Mise à jour des jauges dans le reducer

                 // Si gameover ets à true, on déclenche le game over et on interrompt le processus
                if(data.gameover || !data.card){
                    //console.log(data.death.type + ' ' + data.death.title.hook + ' ' + data.death.title.phrase + ' ' + data.death.description);
                    //triggerGameover(data.death.type, data.death.title.hook, data.death.title.phrase, data.death.description, data.achievements);
                   /* setGameover(true);
                    setConsequenceText(data.death.description);
                    setShowConsequence(true);
                    setTriggerReset(!triggerReset);
                    console.log("gameover 1");*/

                    triggerShake(); // tremblement de la carte

                    setTimeout(() => {
                        setGameover(true);
                        setConsequenceText(data.death.description);
                        setShowConsequence(true);
                        setTriggerReset(!triggerReset);
                    }, 400);
                    return;
                }

                // On vérifie s'il y a un texte de conséquence pour le choix validé
                const cons = currentSide === 'right' ? currentCard?.right?.consequence : currentCard?.left?.consequence;

                if (cons) { // Si oui, on montre le choix
                    setConsequenceText(cons);
                    setShowConsequence(true);
                    setTriggerReset(!triggerReset);

                    return; // on interromps le processus (la next card sera affichée au prochain swipe)
                }

               

                dispatch(setCurrentNumberDays(data.numberDays)); // Mise à jour du nombre de jours dans le reducer
                SetLocked(true);    // On bloque les interractions pour le joueur le temps des animations

                setTimeout(() => {
                    dispatch(setCurrentCard(data.card)); // on affiche la carte suivante après un délais de 100ms (pour éviter qu'on vois le changement de texte)
                }, 100);

                setTriggerReset(!triggerReset); // on déclenche le retournement de la carte

                 setTimeout(() => {
                    SetLocked(false); // On débloque les interractions pour le joueur
                }, 200);
            }
            else{     // Une conséquence a été affiché, après le swipe, on reprend maintenant le cours normal de la partie

                setConsequenceText(null);  // on remet le text de conséquence à null
                

                if(lastResponse && (lastResponse.gameover || !lastResponse.card)){ // gestion du gameover
                    if(lastResponse.death){
                        /*setGameover(true);
                        setConsequenceText(lastResponse.death.description);
                        setShowConsequence(true);
                        setTriggerReset(!triggerReset);
                        console.log("gameover 2");*/

                        triggerShake(); // tremblement de la carte

                        setTimeout(() => {
                            setGameover(true);
                            setConsequenceText(lastResponse?.death?.description || "");
                            setShowConsequence(true);
                            setTriggerReset(!triggerReset);
                        }, 400);
                        }
                    
                        //triggerGameover(lastResponse.death.type, lastResponse.death.title.hook, lastResponse.death.title.phrase, lastResponse.death.description, lastResponse.achievements);
                    return;
                }

                SetLocked(true); // on bloque les interractions le temps de l'animation

                setTimeout(() => {

                    if(lastResponse?.card){ // on affiche la carte
                        dispatch(setCurrentCard(lastResponse.card));
                        dispatch(setCurrentNumberDays(lastResponse.numberDays));
                    }


                    setShowConsequence(false); // on desactive le flag 'consequence'
                }, 100);

                setTriggerReset(!triggerReset); // on déclenche l'animation de la carte

                setTimeout(() => {
                    SetLocked(false); // on débloque les interractions
                }, 200);

            }
            
        }catch (err) {

        }
    }

    // On valide le swipe à gauche
    const onSwipeLeft = () => {
        setCurrentSide('left');
        if(!gameover){
            handleChoice();
        }
        else{
            handleGameover(lastResponse?.achievements || []);
        }

    };

    // On valide le swipe à droite
    const onSwipeRight = () => {
        setCurrentSide('right');

        if(!gameover){
            handleChoice();
        }
        else{
            handleGameover(lastResponse?.achievements || []);
        }
    };

    
    // GESTION DE L'AFFICHAGE DES JAUGES
    // On clamp les valeurs entre 0 et 100
    const hunger = Math.min(Math.max(user.stateOfGauges.hunger, 0), 100);
    const security = Math.min(Math.max(user.stateOfGauges.security, 0), 100);
    const health = Math.min(Math.max(user.stateOfGauges.health, 0), 100);
    const moral = Math.min(Math.max(user.stateOfGauges.moral, 0), 100);
    const food = Math.min(Math.max(user.stateOfGauges.food, 0), 100);

    const deltaFoodGauge = 5;    // on ajoute un petit décalage pour éviter que l'icone maque les valeurs basses de la jauge
    const newPercentFood = food === 0 ? 0 : deltaFoodGauge + food * (100 - deltaFoodGauge) / 100;

    // gestion des rond indicateurs
    const hideIndicators = currentSide === 'center' || showConsequence || locked || lastResponse?.gameover;

    const hungerIndicator = hideIndicators? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.hunger || 0) : Math.abs(currentCard?.left?.effect.hunger || 0));
    const securityIndicator = hideIndicators ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.security || 0) : Math.abs(currentCard?.left?.effect.security || 0));
    const healthIndicator = hideIndicators ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.health || 0) : Math.abs(currentCard?.left?.effect.health || 0));
    const moralIndicator = hideIndicators ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.moral || 0) : Math.abs(currentCard?.left?.effect.moral || 0));

    // Image à afficher sur la carte
    let pool = currentCard.right.trigger || currentCard.left.trigger || currentCard.pool;

    if(pool === 'event'){
        pool = currentCard.right.nextPool || currentCard.left.nextPool || 'event';
    }

    // Récupération de l'image à afficher sur la carte
    const image = currentCard.image ? getImage(currentCard.image) : getImage("");

    // Animation de clignotement quand la jauge de nourriture est vide
    useEffect(() => {
    if (food === 0) {
        foodBlink.value = withRepeat(
        withTiming(0.5, { duration: 1000 }), //met 1s à jouer l'animation
        -1, // boucle à l'infini
        true // mode reverse
        );
    } else {
        foodBlink.value = withTiming(1, { duration: 300 }); // retour à la normale quand la jauge n'est plus vide
    }
    }, [food]);

    const foodBlinkStyle = useAnimatedStyle(() => ({  // style à appliquer sur la jauge pour afficher le clignotement
        opacity: foodBlink.value
    }));

    // mise à jour progressive de la jauge de nourriture quand elle est modifiée
    const foodAnim = useSharedValue(newPercentFood);

    useEffect(() => {
        foodAnim.value = withTiming(newPercentFood, {
            duration: 200
        });
    }, [newPercentFood]);

    const foodAnimatedStyle = useAnimatedStyle(() => ({
        width: `${foodAnim.value}%`
    }));

    // Gameover text color based on the cause of the death
     const changeColor = (cause: string) => {
        if (cause === 'hunger') {
            return '#f28f27'
        }
        else if (cause === 'security') {
            return '#378ded'
        }
        else if (cause === 'health') {
            return '#cf5a34'
        }
        else if (cause === 'moral') {
            return '#6b8a48'
        }
    };


    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.backgroundImage}>
            <View style={styles.container}>
                <View style={styles.hud}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', { screen: 'Menu'})}>
                        <Image source={require('../assets/icon-arrow.png')} style={styles.leftArrow} />
                    </TouchableOpacity>
                    <Text style={styles.numberDays}>JOUR {user.numberDays}</Text>
                </View>
                <View style={styles.main}>
                    <Animated.View style={[styles.darkBackground, shakeStyle]}>
                        <View style={styles.cardContainer}>
                            <View style={styles.gaugesContainer}>
                                <Gauge icon={require('../assets/icon-hunger.png')} color='#f28f27' percent={hunger} indicator={hungerIndicator} decrease={food === 0}/>
                                <Gauge icon={require('../assets/icon-security.png')} color='#378ded' percent={security} indicator={securityIndicator} decrease={false}/>
                                <Gauge icon={require('../assets/icon-health.png')} color='#cf5a34' percent={health} indicator={healthIndicator} decrease={false}/>
                                <Gauge icon={require('../assets/icon-moral.png')} color='#6b8a48' percent={moral} indicator={moralIndicator} decrease={false}/>
                            </View>
                            <View style={styles.textContainer}>

                                {/*GAME*/}
                                {!gameover && 
                                    <Animated.Text  // smooth fade on the text
                                        key={currentCard?.text} // trigger anim when currentCard?.text change
                                        entering={FadeIn.duration(200)}
                                        exiting={FadeOut.duration(200)}
                                        style={styles.textEvent}
                                        >
                                        {currentCard?.text}
                                    </Animated.Text>
                                }

                                {/*GAMEOVER*/}
                                {gameover && 
                                <Animated.View 
                                style={styles.gameoverSection}
                                entering={FadeIn.duration(800).delay(1000)}
                                exiting={FadeOut.duration(200)}
                                >
                                    <Image source={require('../assets/icon-skull.png')} resizeMode="contain" style={styles.skullLogo} />
                                    <Text style={styles.textDeath}>
                                        {lastResponse?.death?.title.phrase}
                                    </Text>
                                    <Text style={[styles.deathCause, {color: lastResponse?.death ? changeColor(lastResponse?.death?.type) : '#ffe7bf'}]}>
                                        {lastResponse?.death?.title.hook.toUpperCase()}
                                    </Text>
                                </Animated.View>
                                    
                                }
                                

                            </View>
                            <View style={styles.choiceCardContainer} >
                                <View style={styles.cardStack}>
                                    <View style={styles.imageMask}>
                                        <Image
                                        source={require('../assets/backcard_v5.png')}
                                        style={styles.backImage}
                                        />
                                    </View>
                                        <AnimatedCard
                                        image = {image}
                                        isConsequence={showConsequence}
                                        leftChoiceText={showConsequence ? consequenceText : (currentCard?.left?.text || "")}
                                        rightChoiceText={showConsequence ? consequenceText  : (currentCard?.right?.text || "")}
                                        onSwipeLeft={onSwipeLeft}
                                        onSwipeRight={onSwipeRight}
                                        handleSideChange={(side: string) => handleSideChange(side)}
                                        triggerReset={triggerReset}
                                        />

                                </View>
                            </View>
                        </View>
                    </Animated.View>               
                </View>
                <View style={styles.bottomSection}>
                    <View style={styles.foodSection}>
                        <View style={styles.foodGlobalContent}>
                            
                            <View style={[styles.foodBarContainer]}>
                                <Animated.View style={[styles.foodBarFill, foodAnimatedStyle]} />
                            </View>
                            <Animated.Image source={require('../assets/icon-food.png')} style={[styles.foodIcon, foodBlinkStyle]} />
                        </View>

                    </View>
                </View>
            </View>
           
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    container: {
        height: '100%',
        width: '100%'
    },
    hud: {
        height: undefined,
        width : '100%',
        paddingHorizontal: 40,
        paddingTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40
    },
    leftArrow:{
        width: '100%',
        height: '100%'
    },
    numberDays: {
        color: '#ffe7bf',
        fontSize: 34,
        fontFamily: 'DaysLater',
        textShadowColor: '#242120',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 2,
    },
    main: {
        width: '100%',
        height: "75%", /*undefinded*/
        paddingHorizontal: 36,
        paddingVertical: 20
    },
    darkBackground:{
        backgroundColor : '#242120',
        width: '100%',
        height: '100%', /*620*/
        borderRadius: 20,
        padding: 12,
    },
    cardContainer: {
        backgroundColor : '#342c29',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderColor: '#554946',
        borderWidth: 5

    },
    gaugesContainer:{
        width: '100%',
        height: '25%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    textContainer:{
        width: '100%',
        height: '25%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    textEvent: {
        color: '#ffe7bf',
        fontFamily: 'ArialRounded',
        fontSize: 18,
        textAlign: 'center'
    },
    gameoverSection:{
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding : 20
    },
    textDeath: {
        color: '#ffe7bf',
        fontFamily: 'ArialRounded',
        fontSize: 18,
        textAlign: 'center'
    },
    deathCause: {
        color: '#ffe7bf',
        fontFamily: 'ArialRounded',
        fontSize: 24,
        textAlign: 'center'
    },
    skullLogo: {
        width: 80,
        height: 80
    },
    choiceCardContainer:{
        width: '100%',
        height: '55%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 20
    },
    cardStack:{
        backgroundColor: '#242120',
        width: 240,
        height: 240,
        borderRadius: 15,
    },
    imageMask: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 15,
        overflow: 'hidden',
        borderColor: '#242120',
        borderWidth: 4,
    },
    backImage: {
      width: '100%',
      height: '100%'
    },
    bottomSection: {
        width: '100%',
        height: undefined,
        paddingHorizontal: 36
    },
    foodSection: {
        width: '100%',
        height: 80,
        backgroundColor: '#342c29',
        borderColor: '#242120',
        borderWidth: 8,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    foodGlobalContent:{
        width: '90%',
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 10
    },
    foodIcon:{
        width: 70,
        height: 70,
        marginTop: -15,
        marginRight: -35
    },
    foodBarContainer: {
        width: '100%',
        height: 30,
        borderRadius: 15,
        backgroundColor: '#554946',

        borderColor: '#242120',
        borderWidth: 4,
        overflow: 'hidden'

    },
    foodBarFill: {
        width: '90%',
        height: '100%',
        backgroundColor: '#8378b7'
    }
});