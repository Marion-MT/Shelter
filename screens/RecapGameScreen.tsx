import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image } from "react-native"
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";
import { setGameState, updateBestScore } from "../reducers/user";
import { useCallback, useState } from "react";

type RecapGameScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

type RecapGameRouteParams = {
    achievements : [Object];
}

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function RecapGameScreen({ navigation, route }: RecapGameScreenProps & { route: { params: RecapGameRouteParams } }) {
    const user = useSelector((state: string) => state.user.value);
    const dispatch = useDispatch();
    const [newBestScore, setNewBestScore] = useState<Boolean>(false);

    const { achievements } = route.params;

    console.log("RecapGame achievements = ", achievements);

    // Update best score in reduce
    useFocusEffect(
        useCallback(() => {
            if(user.numberDays > user.bestScore){
                dispatch(updateBestScore(user.numberDays));
                setNewBestScore(true);
            }
            else{
                setNewBestScore(false);
            }
        }, [])
    );
  

    const checkScore = () => {
        if (newBestScore) {
            return ( 
                <View style={styles.darkBackground}>
                    <View style={styles.cardContainer}>
                        <Text style={styles.text}>Vous avez survécu :</Text>
                        <View style={styles.daysContainer}>
                            <Text style={styles.days}>{user.numberDays}</Text>
                        </View>
                        <View style={styles.newBestScore}>
                        <Text style={styles.daysText}>Jours</Text>
                        <Image source={require('../assets/icon-new.png')} style={styles.newLogo} />
                        </View>
                        <View style={styles.bestScore}>
                            <Image source={require('../assets/icon-star.png')} style={styles.logo} />
                            <Text style={styles.bestScoreText}>Last Record : {user.bestScore} jours</Text>
                        </View>
                    </View>
                </View>
            );
        } else return (
            <View style={styles.darkBackground}>
                <View style={styles.cardContainer}>
                    <Text style={styles.text}>Vous avez survécu :</Text>
                    <View style={styles.daysContainer}>
                        <Text style={styles.days}>{user.numberDays}</Text>
                    </View>
                    <Text style={styles.daysText}>Jours</Text>
                    <View style={styles.bestScore}>
                        <Image source={require('../assets/icon-star.png')} style={styles.logo} />
                        <Text style={styles.bestScoreText}>Record : {user.bestScore} jours</Text>
                    </View>
                </View>
            </View>
        );
    };

    const handleNavigateHome = () => {
        navigation.navigate('Home', { screen: 'Home' });
    };

    const handleNewPart = () => {
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

    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.container}>
            <View style={styles.main}>
                {checkScore()}
                <View style={styles.btnContainer}> 
                    <TouchableOpacity onPress={() => handleNewPart()} style={styles.leftBtn} activeOpacity={0.8}>
                    <Text style={styles.btnText}>REJOUER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rigthBtn} activeOpacity={0.8}>
                    <Text onPress={() => handleNavigateHome()} style={styles.btnText}>MENU</Text>
                    </TouchableOpacity>
                </View>  
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    main: {
        width: '100%',
        height: '85%',
        paddingHorizontal: 36,
        paddingVertical: 30,
    },
    darkBackground:{
        backgroundColor : '#242120',
        width: '100%',
        height: 550,
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
    text: {
        marginTop: 25,
        color: '#EFDAB7',
        fontSize: 18,
        fontWeight: 'bold',
    },
    daysContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        width: '48%',
        height: 60,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: '#EFDAB7'
    },
    days: {
        color: 'black',
        fontSize: 35,
        fontWeight: 'bold',
    },
    newBestScore: {
      flexDirection: 'row',  
    },
    daysText: {
        marginTop: 10,
        color: '#EFDAB7',
        fontSize: 30,
        fontWeight: 'bold',
    },
    newLogo: {
        marginLeft: 15,
        width: 65,
        height: 65,
    },
    bestScore: {
        marginTop: 20,
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#554946'
    },
    bestScoreText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#EFDAB7',
    },
    logo: {
        marginRight: 15,
        width: 25,
        height: 25,
    },
    btnContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    leftBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '47.5%',
        height: 70,
        borderRadius: 15,
        marginTop: 30,
        backgroundColor: '#D05A34',
    },
    rigthBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '47.5%',
        height: 70,
        borderRadius: 15,
        marginTop: 30,
        backgroundColor: '#74954E',
    },
    btnText: {
        textTransform: 'uppercase',
        fontSize: 23,
        fontWeight: 'bold',
        color: '#EFDAB7',
    },
});