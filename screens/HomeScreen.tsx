import { View, Text, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ImageBackground } from "react-native"
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";
import { setGameState, setUserData, signout } from "../reducers/user";
import { useCallback, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";

type HomeScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function HomeScreen({ navigation }: HomeScreenProps ) {
    const [currentGame, setCurrentGame] = useState(false);
    //console.log(currentGame);
    
    const user = useSelector((state: string) => state.user.value);
    const dispatch = useDispatch();

    useFocusEffect(
        useCallback(() => {
            fetch(`${BACKEND_ADDRESS}/users/data`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(response => response.json())
            .then(data => {
                dispatch(setUserData({ bestScore: data.bestScore, soundOn: data.soundOn, volume: data.volume }));
                if (!data.currentGame) {
                    //console.log('Pas de game en cours');
                    setCurrentGame(false);
                    return;
                } else {                
                    if (data.currentGame) {
                        setCurrentGame(true);
                        //console.log('Game en cours');
                        
                    }
                }
            });
        }, [])
    );

    const handleCurrentGame = () => {
        fetch(`${BACKEND_ADDRESS}/games/current`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {            
                console.log('Error:', data.error);
                return;
            } else {
                dispatch(setGameState({ stateOfGauges: data.currentGame.stateOfGauges, numberDays: data.currentGame.numberDays, currentCard: data.currentGame.currentCard }));
                navigation.navigate('Game', { screen: 'Game' });
            }
        });
    };
     
    const handleNewGame = () => {
        fetch(`${BACKEND_ADDRESS}/games/new`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);      
            if (data.error) {
                console.log('Error:', data.error);
                return;
            } else {
                dispatch(setGameState({ stateOfGauges: data.game.stateOfGauges, numberDays: data.game.numberDays, currentCard: data.game.currentCard }));
                navigation.navigate('Game', { screen: 'Game' });
            };
        });      
    };

    const handleNavigateParametres = () => {
        navigation.navigate('Parametre', { screen: 'Parametre' });
    };

    const handleNavigateSucces = () => {
        navigation.navigate('Succes', { screen: 'Succes' });
    };

    const handleNavigateCredit = () => {
        navigation.navigate('Credit', { screen: 'Credit' });
    };

    const handleLogout = () => {
        console.log("pré-signout", user)
        dispatch(signout())
        navigation.navigate('Connexion', { screen: 'ConnexionScreen' });
    };

    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => handleLogout()} activeOpacity={0.8} style={styles.logout}>
                        <FontAwesome name={'sign-out' as any} size={50} color='#ffe7bf' />
                    </TouchableOpacity>
                </View>
                <View style={styles.main}>
                    <Text style={styles.title}>shelter</Text>
                    <View style={styles.buttonPanel}>
                        {currentGame &&<TouchableOpacity onPress={() => handleCurrentGame()} style={styles.button} activeOpacity={0.8}>
                            <Text style={styles.btnText}>reprendre</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity onPress={() => handleNewGame()} style={styles.button} activeOpacity={0.8}>
                            <Text style={styles.btnText}>nouvelle partie</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleNavigateParametres()} style={styles.button} activeOpacity={0.8}>
                            <Text style={styles.btnText}>paramètres</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => handleNavigateSucces()} style={styles.button} activeOpacity={0.8}>
                            <Text style={styles.btnText}>succès</Text>
                        </TouchableOpacity>*/}
                        <TouchableOpacity onPress={() => handleNavigateCredit()} style={styles.button} activeOpacity={0.8}>
                            <Text style={styles.btnText}>crédits</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
            </KeyboardAvoidingView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        width: '100%',
        height: 80,
        padding: 30,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    logout:{
        width: 55,
        height: 55,
    },
    main:{
       width : '100%',
       height:'100%',
       alignItems: 'center',
       paddingTop: 60

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
    buttonPanel: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 30,
        paddingTop: 30
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#352C2B',
        width: 235,
        height: 60,
        borderWidth: 2.5,
        borderColor: 'black',
        borderRadius: 15,
    },
    btnText: {
        textTransform: 'uppercase',
        fontSize: 23,
        fontWeight: 'bold',
        color: '#ffe7bf',
    },
});