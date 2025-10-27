import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ImageBackground } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';

type GameScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

export default function GameScreen({ navigation }: GameScreenProps ) {
   
    const handleNavigate = () => {
        navigation.navigate('EndGame', { screen: 'EndGame' });
    };

    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.backgroundImage}>
            <View style={styles.container}>
                <View style={styles.hud}>
                    <Text style={styles.numberDays}>JOUR 12</Text>
                </View>
                <View style={styles.main}>
                
                </View>
                <View style={styles.foodSection}>
                
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
        height: 50,
        width : '100%'
    },
    numberDays: {
        color: '#ffe7bf',
        fontSize: 30,
        fontFamily: 'DaysLater',
    },
    main: {

    },
    foodSection: {
    },
});