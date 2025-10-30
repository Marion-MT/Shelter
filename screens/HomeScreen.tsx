import { View, Text, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ImageBackground } from "react-native"
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";
import { setGameState, setUserData } from "../reducers/user";
import { useCallback, useState } from "react";

type HomeScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function HomeScreen({ navigation }: HomeScreenProps ) {
    const [currentGame, setCurrentGame] = useState(false);
    console.log(currentGame);
    
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
                if (!data.currentGame) {
                    console.log('Pas de game en cours');
                    setCurrentGame(false);
                    return;
                } else {
                    dispatch(setUserData({ bestScore: data.bestScore, soundOn: data.soundOn, volume: data.volume }));
                    if (data.currentGame) {
                        setCurrentGame(true);
                        console.log('Game en cours');
                        
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
                <Text style={styles.title}>shelter</Text>
                <View>
                    {currentGame &&<TouchableOpacity onPress={() => handleCurrentGame()} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.btnText}>reprendre</Text>
                    </TouchableOpacity>}
                    <TouchableOpacity onPress={() => handleNewGame()} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.btnText}>nouvelle partie</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={() => handleNavigateParametres()} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.btnText}>paramètres</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigateSucces()} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.btnText}>succès</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigateCredit()} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.btnText}>crédits</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => handleLogout()} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.btnText}>Se deconnecter</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    title: {
        fontSize: 70,
        fontWeight: '600',
        fontFamily: 'DaysLater',
        color: '#EFDAB7',
        marginBottom: 35,     
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
        margin: 15,
    },
    btnText: {
        textTransform: 'uppercase',
        fontSize: 23,
        fontWeight: 'bold',
        color: '#EFDAB7',
    },
});