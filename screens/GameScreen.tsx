import { View, Text, StyleSheet, Image, ImageBackground, Dimensions  } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import Gauge from '../components/Gauges';
import AnimatedCard from '../components/AnimatedCard';
import { cards } from '../data/cards';
import { responses } from '../data/responses';

import { useSelector, useDispatch } from "react-redux";
import { setGauges, setCurrentCard, setCurrentNumberDays, Card } from "../reducers/user";

type GameScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function GameScreen({ navigation }: GameScreenProps ) {

    const dispatch = useDispatch();

    const user = useSelector((state: string) => state.user.value);

   // const [currentCard, setCurrentCard] = useState<Card | null>(user.currentCard);

    const [currentSide, setCurrentSide] = useState<string>('center');

    const [indexCard, setIndexCard] = useState<number>(0);

    const [triggerReset, setTriggerReset] = useState<boolean>(false);

    const [numberDays, setNumberDays] = useState<number>(1);

    
    const handleSideChange = (side: string) : void => {
        setCurrentSide(side)
    }

    const triggerGameover = () => {
        setTimeout(() => {
            navigation.navigate('EndGame', { screen: 'EndGame' });
        }, 1000);
    }

    const getNextCard = async () : Promise<void> => {

        try{
            const response = await fetch(`${BACKEND_ADDRESS}/games/choice`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}`,
                           'Content-Type': 'application/json' },
                body: JSON.stringify({ choice:  currentSide}),
            });

            const data = await response.json();

            if(!data.result){
                triggerGameover();
                return;
            }

            console.log("GameOver :", data.gameover);

            dispatch(setGauges(data.gauges));

            console.log("Gauge :", data.gauges);

            if(data.gameover || !data.card){
                triggerGameover();
                return;
            }


            setTimeout(() => {
                dispatch(setCurrentCard(data.card));
                dispatch(setCurrentNumberDays(data.numberDays));
    

            }, 100);

            setTriggerReset(!triggerReset);


        }catch (err) {

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

    const currentCard = user.currentCard;

    const hungerIndicator = currentSide === 'center' ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.hunger || 0) : Math.abs(currentCard?.left?.effect.hunger || 0));
    const securityIndicator = currentSide === 'center' ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.security || 0) : Math.abs(currentCard?.left?.effect.security || 0));
    const healthIndicator = currentSide === 'center' ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.health || 0) : Math.abs(currentCard?.left?.effect.health || 0));
    const moralIndicator = currentSide === 'center' ? 0 : (currentSide === 'right' ?  Math.abs(currentCard?.right?.effect.moral || 0) : Math.abs(currentCard?.left?.effect.moral || 0));

    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.backgroundImage}>
            <View style={styles.container}>
                <View style={styles.hud}>
                    <Text style={styles.numberDays}>JOUR {user.numberDays}</Text>
                </View>
                <View style={styles.main}>
                    <View style={styles.darkBackground}>
                        <View style={styles.cardContainer}>
                            <View style={styles.gaugesContainer}>
                                <Gauge icon={require('../assets/icon-hunger.png')} color='#f28f27' percent={user.stateOfGauges.hunger} indicator={hungerIndicator}/>
                                <Gauge icon={require('../assets/icon-security.png')} color='#378ded' percent={user.stateOfGauges.security} indicator={securityIndicator}/>
                                <Gauge icon={require('../assets/icon-health.png')} color='#cf5a34' percent={user.stateOfGauges.health} indicator={healthIndicator}/>
                                <Gauge icon={require('../assets/icon-moral.png')} color='#6b8a48' percent={user.stateOfGauges.moral} indicator={moralIndicator}/>
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
                                <View style={[styles.foodBarFill, { width: `${user.stateOfGauges.food}%`}]}>

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