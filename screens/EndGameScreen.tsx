import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ImageBackground, Image } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';

import Gauge from "../components/Gauges";

type EndGameScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

export default function EndGameScreen({ navigation }: EndGameScreenProps ) {

    const deathData = {
        cause: 'hunger',
        title: 'faim',
        description: `Vos efforts n'ont pas suffi. Les réserves sont vides depuis trop longtemps, et la faim vous a emporté.`,
        gauges: {
            moral: 45,
            security: 60,
            health: 35,
            hunger: 0,
        },
    };
    
    const changeColor = (cause) => {
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
            <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.container}>
                <View style={styles.main}>
                    <View style={styles.darkBackground}>
                        <View style={styles.cardContainer}>
                            <View style={styles.gaugesContainer}>
                                <Gauge icon={require('../assets/icon-hunger.png')} color='#f28f27' percent={deathData.gauges.hunger} indicator={0}/>
                                <Gauge icon={require('../assets/icon-security.png')} color='#378ded' percent={deathData.gauges.security} indicator={0}/>
                                <Gauge icon={require('../assets/icon-health.png')} color='#cf5a34' percent={deathData.gauges.health} indicator={0}/>
                                <Gauge icon={require('../assets/icon-moral.png')} color='#6b8a48' percent={deathData.gauges.moral} indicator={0}/>
                            </View>
                            <View style={styles.deadWhat}>
                                <Image source={require('../assets/icon-skull.png')} resizeMode="contain" style={styles.skullLogo} />
                                <Text style={styles.deadText}>vous êtes morts de</Text>
                                <Text style={[styles.deadCause, {color: changeColor(deathData.cause)}]}>{deathData.title}</Text>
                            </View>
                            <View style={styles.deadResume}>
                                <Text style={styles.resumeText}>{deathData.description}</Text>
                            </View>
                        </View>
                    </View>
                </View>    
                <TouchableOpacity style={[styles.button, {backgroundColor: changeColor(deathData.cause)}]} activeOpacity={0.8}>
                <Text style={styles.btnText}>continuer</Text>
                </TouchableOpacity>
            </ImageBackground>
        );
    };
    
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        main: {
            width: '100%',
            paddingHorizontal: 36,
            paddingVertical: 30
        },
        darkBackground:{
            backgroundColor : '#242120',
            width: '100%',
            height: 600,
            borderRadius: 20,
            padding: 12,
        },
        cardContainer: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor : '#342c29',
            width: '100%',
            height: '100%',
            borderRadius: 16,
            borderColor: '#554946',
            borderWidth: 5
        },
        gaugesContainer:{
        width: '100%',
        height: '22%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10
        },
        deadWhat: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            width: '90%',
            height: '50%',
        },
        skullLogo: {
            width: '45%',  
            height: 150,  
        },
        deadText: {
            color: '#EFDAB7',
            fontSize: 18,
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        deadCause: {
            marginTop: 5,
            fontSize: 23,
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        deadResume: {
            flex: 1,
            width: '90%',
            height: '35%',
            justifyContent: 'center',
        },
        resumeText: {
            height: 200,
            backgroundColor: '#252120',
            color: '#EFDAB7',
            fontWeight: 'bold',
            padding: 35,
            borderRadius: 10,
        },
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            width: 235,
            height: 60,
            borderWidth: 1.5,
            borderColor: 'black',
            borderRadius: 15,
            margin: 15,
        },
        btnText: {
            textTransform: 'uppercase',
            fontSize: 23,
            fontWeight: 'bold',
            color: 'black',
        },
    });