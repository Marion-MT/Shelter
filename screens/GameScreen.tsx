import { View, Text, StyleSheet, Image, ImageBackground, Dimensions, TouchableOpacity  } from "react-native"
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { useState, useCallback, useEffect } from 'react';
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
  achievements: [Object];
};

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function GameScreen({ navigation }: GameScreenProps ) {

    const dispatch = useDispatch();

    const user = useSelector((state: string) => state.user.value);
    const currentCard = user.currentCard;

    const [currentSide, setCurrentSide] = useState<string>('center');
    const [triggerReset, setTriggerReset] = useState<boolean>(false);

    const [showConsequence, setShowConsequence] = useState<boolean>(false);
    const [consequenceText, setConsequenceText] = useState<string | null>(null);

    const [locked, SetLocked] = useState<boolean>(false); // lock interaction during animations times

    const [lastResponse, setLastResponse] = useState<GameResponse|null>(null); //used to store data when there is a consequence to display before displaying the next card (or gameover)
    
    const foodBlink = useSharedValue(1);

    useFocusEffect(
        useCallback(() => {
            SetLocked(false);
            setLastResponse(null);
            setShowConsequence(false);
            setConsequenceText(null);
            setCurrentSide('center');
            setTriggerReset(prev => !prev);



             return () => {
                SetLocked(false);
                setLastResponse(null);
                setShowConsequence(false);
                setConsequenceText(null);
                setCurrentSide('center');
                setTriggerReset(prev => !prev);
            };

        }, [])
    );
    

    const handleSideChange = (side: string) : void => {
        setCurrentSide(side)
    }

    const triggerGameover = (type: string, hook: string, phrase: string, description: string, achievements: [Object] ) => {
        setTimeout(() => {
            navigation.navigate('EndGame', { screen: 'EndGame', type: type, hook: hook, phrase: phrase, description: description, achievements: achievements  });
        }, 1000);
    }

  

    const handleChoice  = async () : Promise<void> => {

        try{
            if(!showConsequence){
                const response = await fetch(`${BACKEND_ADDRESS}/games/choice`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}`,
                           'Content-Type': 'application/json' },
                body: JSON.stringify({ choice:  currentSide}),
                } );

                const data = await response.json();

                if(!data.result){
                    triggerGameover("","","","");
                    return;
                }

                console.log(data);

                setLastResponse(data);

                dispatch(setGauges(data.gauges));

                // get the consequences of the last Card played
                const cons = currentSide === 'right' ? currentCard?.right?.consequence : currentCard?.left?.consequence;

                if (cons) { // Show the consequence
                    setConsequenceText(cons);
                    setShowConsequence(true);
                    setTriggerReset(!triggerReset);

                    return; // dont display next card !
                }

                if(data.gameover || !data.card){
                    //console.log(data.death.type + ' ' + data.death.title.hook + ' ' + data.death.title.phrase + ' ' + data.death.description);
                    triggerGameover(data.death.type, data.death.title.hook, data.death.title.phrase, data.death.description, data.achievements);
                    console.log('unlocked achievements = ', data.achievements);
                    return;
                }

                dispatch(setCurrentNumberDays(data.numberDays));
                SetLocked(true);

                setTimeout(() => {
                    dispatch(setCurrentCard(data.card));
                }, 100);

                setTriggerReset(!triggerReset);

                 setTimeout(() => {
                    SetLocked(false);
                }, 200);
            }
            else{     // After the consequence

                setConsequenceText(null);
                

                if(lastResponse && (lastResponse.gameover || !lastResponse.card)){
                    if(lastResponse.death)
                        triggerGameover(lastResponse.death.type, lastResponse.death.title.hook, lastResponse.death.title.phrase, lastResponse.death.description, lastResponse.achievements);
                    return;
                }

                SetLocked(true);

                setTimeout(() => {

                    if(lastResponse?.card){
                        dispatch(setCurrentCard(lastResponse.card));
                        dispatch(setCurrentNumberDays(lastResponse.numberDays));
                    }


                    setShowConsequence(false);
                }, 100);

                setTriggerReset(!triggerReset);

                setTimeout(() => {
                    SetLocked(false);
                }, 200);

            }
            
        }catch (err) {

        }
    }

    const onSwipeLeft = () => {
    setCurrentSide('left');
    handleChoice();
    };

    const onSwipeRight = () => {
    setCurrentSide('right');
    handleChoice();
    };

    

    const hunger = Math.min(Math.max(user.stateOfGauges.hunger, 0), 100);
    const security = Math.min(Math.max(user.stateOfGauges.security, 0), 100);
    const health = Math.min(Math.max(user.stateOfGauges.health, 0), 100);
    const moral = Math.min(Math.max(user.stateOfGauges.moral, 0), 100);
    const food = Math.min(Math.max(user.stateOfGauges.food, 0), 100);

    const deltaFoodGauge = 5;    // to shift the fill bar to the top and avoid to hide it behind the icon
    const newPercentFood = food === 0 ? 0 : deltaFoodGauge + food * (100 - deltaFoodGauge) / 100;


    const hideIndicators = currentSide === 'center' || showConsequence || locked || lastResponse?.gameover;

    const hungerIndicator = hideIndicators? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.hunger || 0) : Math.abs(currentCard?.left?.effect.hunger || 0));
    const securityIndicator = hideIndicators ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.security || 0) : Math.abs(currentCard?.left?.effect.security || 0));
    const healthIndicator = hideIndicators ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.health || 0) : Math.abs(currentCard?.left?.effect.health || 0));
    const moralIndicator = hideIndicators ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.moral || 0) : Math.abs(currentCard?.left?.effect.moral || 0));

    // Blick anim when food is empty
    useEffect(() => {
    if (food === 0) {
        foodBlink.value = withRepeat(
        withTiming(0.5, { duration: 1000 }), // fade to 0 in 500ms
        -1, // loop infinite
        true // reverse
        );
    } else {
        foodBlink.value = withTiming(1, { duration: 300 }); // return to normal
    }
    }, [food]);

    const foodBlinkStyle = useAnimatedStyle(() => ({
        opacity: foodBlink.value
    }));

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
                    <View style={styles.darkBackground}>
                        <View style={styles.cardContainer}>
                            <View style={styles.gaugesContainer}>
                                <Gauge icon={require('../assets/icon-hunger.png')} color='#f28f27' percent={hunger} indicator={hungerIndicator} decrease={food === 0}/>
                                <Gauge icon={require('../assets/icon-security.png')} color='#378ded' percent={security} indicator={securityIndicator} decrease={false}/>
                                <Gauge icon={require('../assets/icon-health.png')} color='#cf5a34' percent={health} indicator={healthIndicator} decrease={false}/>
                                <Gauge icon={require('../assets/icon-moral.png')} color='#6b8a48' percent={moral} indicator={moralIndicator} decrease={false}/>
                            </View>
                            <View style={styles.textContainer}>
                                <Animated.Text  // smooth fade on the text
                                    key={currentCard?.text} // trigger anim when currentCard?.text change
                                    entering={FadeIn.duration(200)}
                                    exiting={FadeOut.duration(200)}
                                    style={styles.textEvent}
                                    >
                                    {currentCard?.text}
                                </Animated.Text>

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
                    </View>               
                </View>
                <View style={styles.bottomSection}>
                    <View style={styles.foodSection}>
                        <View style={styles.foodGlobalContent}>
                            
                            <View style={[styles.foodBarContainer]}>
                                <View style={[styles.foodBarFill, { width: `${newPercentFood}%`}]}>

                                </View>
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
        paddingTop: 30,
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
        height: undefined,
        paddingHorizontal: 36,
        paddingVertical: 30
    },
    darkBackground:{
        backgroundColor : '#242120',
        width: '100%',
        height: 620,
        borderRadius: 20,
        padding: 12
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
        paddingHorizontal: 36,
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