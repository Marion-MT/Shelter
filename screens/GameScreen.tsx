import { View, Text, StyleSheet, Image, ImageBackground, Dimensions  } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useRef } from 'react';
import Gauge from '../components/Gauges';
import AnimatedCard from '../components/AnimatedCard';

type GameScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}


export default function GameScreen({ navigation }: GameScreenProps ) {

    const foodPercent : number = 40;
    const numberDays: number = 10;
   
    const handleNavigate = () => {
        navigation.navigate('EndGame', { screen: 'EndGame' });
    };


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
                                <Gauge icon={require('../assets/icon-hunger.png')} color='#f28f27' percent={10} indicator={15}/>
                                <Gauge icon={require('../assets/icon-security.png')} color='#378ded' percent={10} indicator={5}/>
                                <Gauge icon={require('../assets/icon-health.png')} color='#cf5a34' percent={80} indicator={0}/>
                                <Gauge icon={require('../assets/icon-moral.png')} color='#6b8a48' percent={65} indicator={10}/>
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.textEvent}>
                                    Une tempête approche. Elle risque d'endommager le refuge… Nous n'avons pas beaucoup de temps pour nous préparer.
                                </Text>
                            </View>
                            <View style={styles.choiceCardContainer} >
                               <AnimatedCard leftChoiceText="Oui" rightChoiceText="Non"/>
                            </View>
                        </View>
                    </View>               
                </View>
                <View style={styles.bottomSection}>
                    <View style={styles.foodSection}>
                        <View style={styles.foodGlobalContent}>
                            
                            <View style={styles.foodBarContainer}>
                                <View style={[styles.foodBarFill, { width: `${foodPercent}%`, borderTopRightRadius: foodPercent <= 95 ? 0 : 10, borderBottomRightRadius: foodPercent <= 95 ? 0 : 10, }]}>

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
    backCard:{
        backgroundColor: '#242120',
        width: 240,
        height: 240,
        borderRadius: 15,
    },
    choiceCard: {
        backgroundColor: '#ffe7bf',
        width: 240,
        height: 240,
        borderRadius: 15,
        borderColor: '#242120',
        borderWidth: 4,
        overflow: 'hidden'

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
        borderWidth: 4

    },
    foodBarFill: {
        width: '90%',
        height: '100%',
        borderRadius: 15,
        backgroundColor: '#8378b7'
    }
});