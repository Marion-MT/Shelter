import { View, Text, StyleSheet, Image, ImageBackground, Dimensions  } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import Gauge from '../components/Gauges';
import AnimatedCard from '../components/AnimatedCard';
import { cards } from '../data/cards';
import { responses } from '../data/responses';

type GameScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

export type Choice = {
  text: string;
  effect: {
    hunger: number;
    security: number;
    health: number;
    moral: number;
    food: number;
  };
  consequence?: string | null;
  trigger?: string | null;
  endTrigger?: string | null;
  nextCard?: string | null;
  nextPool?: string | null;
  triggerAchievement?: any | null;
};

export type Conditions = {
  requiredScenario: string[];
  forbiddenScenario: string[];
  minDays: number;
  maxDays: number;
  gauges: Record<string, { min: number; max: number }>;
};

export type Card = {
  key: string;
  pool: string;
  text: string;
  cooldown: number;
  incrementsDay: boolean;
  right: Choice;
  left: Choice;
  conditions: Conditions;
};


export default function GameScreen({ navigation }: GameScreenProps ) {

    const [currentCard, setCurrentCard] = useState<Card | null>(null);
    const [hunger, setHunger] = useState<number>(50);
    const [security, setSecurity] = useState<number>(50);
    const [health, setHealth] = useState<number>(50);
    const [moral, setMoral] = useState<number>(50);
    const [food, setFood] = useState<number>(50);

    const [currentSide, setCurrentSide] = useState<string>('center');

    const [indexCard, setIndexCard] = useState<number>(0);

    const [triggerReset, setTriggerReset] = useState<boolean>(false);

    const [numberDays, setNumberDays] = useState<number>(1);



    useEffect(() => {
        setCurrentCard(cards[0]);
    }, []);
    
    const handleSideChange = (side: string) : void => {
        setCurrentSide(side)
    }

    const getNextCard = () : void => {

        setCurrentSide('center');
        const nextIndex = (indexCard + 1) % cards.length;

        setHunger(responses[nextIndex].gauges.hunger);
        setSecurity(responses[nextIndex].gauges.security);
        setHealth(responses[nextIndex].gauges.health);
        setMoral(responses[nextIndex].gauges.moral);
        setFood(responses[nextIndex].gauges.food);

        setNumberDays(responses[nextIndex].numberDays);


        if(!responses[nextIndex].gameover){
 
            setTimeout(() => {
                setIndexCard(nextIndex);
                setCurrentCard(cards[nextIndex]);
    

            }, 100);

            setTriggerReset(!triggerReset);
        }
        else{
            setTimeout(() => {
                navigation.navigate('EndGame', { screen: 'EndGame' });
            }, 1000);
        }
       
    }

    const onSwipeLeft = () : void => {
        // Send choice to back
        getNextCard();
    }

    const onSwipeRight = () : void => {
        // Send choice to back
        getNextCard();
    }



   
    const handleNavigate = () => {
        navigation.navigate('EndGame', { screen: 'EndGame' });
    };

    const hungerIndicator = currentSide === 'center' ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.hunger || 0) : Math.abs(currentCard?.left?.effect.hunger || 0));
    const securityIndicator = currentSide === 'center' ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.security || 0) : Math.abs(currentCard?.left?.effect.security || 0));
    const healthIndicator = currentSide === 'center' ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.health || 0) : Math.abs(currentCard?.left?.effect.health || 0));
    const moralIndicator = currentSide === 'center' ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.moral || 0) : Math.abs(currentCard?.left?.effect.moral || 0));

    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.backgroundImage}>
            <View style={styles.container}>
                <View style={styles.hud}>
                    <Text style={styles.numberDays}>JOUR {numberDays}</Text>
                </View>
                <View style={styles.main}>
                    <View style={styles.darkBackground}>
                        <View style={styles.cardContainer}>
                            <View style={styles.gaugesContainer}>
                                <Gauge icon={require('../assets/icon-hunger.png')} color='#f28f27' percent={hunger} indicator={hungerIndicator}/>
                                <Gauge icon={require('../assets/icon-security.png')} color='#378ded' percent={security} indicator={securityIndicator}/>
                                <Gauge icon={require('../assets/icon-health.png')} color='#cf5a34' percent={health} indicator={healthIndicator}/>
                                <Gauge icon={require('../assets/icon-moral.png')} color='#6b8a48' percent={moral} indicator={moralIndicator}/>
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.textEvent}>
                                    {currentCard?.text}
                                </Text>
                            </View>
                            <View style={styles.choiceCardContainer} >
                                <View style={styles.cardStack}>
                                    <AnimatedCard
                                    leftChoiceText={currentCard?.left?.text || ""}
                                    rightChoiceText={currentCard?.right?.text || ""}
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
                            
                            <View style={styles.foodBarContainer}>
                                <View style={[styles.foodBarFill, { width: `${food}%`}]}>

                                </View>
                            </View>
                            <Image source={require('../assets/icon-food.png')} style={styles.foodIcon} />
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
        justifyContent:'flex-start',
        height: undefined,
        width : '100%',
        paddingHorizontal: 20,
        paddingTop: 30,
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
        paddingVertical : 5,
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