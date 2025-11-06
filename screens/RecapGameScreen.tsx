import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Image } from "react-native"
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";
import { useFetchWithAuth } from "../components/fetchWithAuth";
import { setGameState, updateBestScore } from "../reducers/user";
import { useCallback, useState } from "react";
import Achievement from '../components/Achievement'
import AudioManager from '../modules/audioManager';

type RecapGameScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

type Achievement = {
  id: string;
  name: string;
  description: string;
  image: string;
};

type RecapGameRouteParams = {
  achievements: [Achievement];
};


export default function RecapGameScreen({ navigation, route }: RecapGameScreenProps & { route: { params: RecapGameRouteParams } }) {
    const fetchWithAuth = useFetchWithAuth();
    const user = useSelector((state: string) => state.user.value);
    const dispatch = useDispatch();
    const [previousBestScore, setPreviousBestScore] = useState<number>(user.bestScore || 0);
    const [newBestScore, setNewBestScore] = useState<Boolean>(false);

    const { achievements } = route.params;

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
    
    const succes = achievements.map((data, i)=> {
        return <Achievement key={i} name={data.name} description={data.description} image={data.image} isUnlocked={true}/>
    });

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
                            <Image source={require('../assets/icon-star.png')} style={styles.star} />
                            <Text style={styles.bestScoreText}>Last Record : {previousBestScore} jour{previousBestScore > 1 ? 's' : ''}</Text>
                        </View>
                        {succes.length === 0 ? (
                        <ScrollView contentContainerStyle={styles.scrollView}>
                            <Text style={styles.text}>Aucun succès dévérouillé</Text>
                        </ScrollView>
                    ) : (
                        <ScrollView contentContainerStyle={styles.scrollView}>
                            <Text style={styles.text}>Succès dévérouillé(s)</Text>
                             {succes}
                        </ScrollView>
                    )}
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
                        <Image source={require('../assets/icon-star.png')} style={styles.star} />
                        <Text style={styles.bestScoreText}>Record : {user.bestScore} jour{user.bestScore > 1 ? 's' : ''}</Text>
                    </View>
                    {succes.length === 0 ? (
                        <ScrollView contentContainerStyle={styles.scrollView}>
                        <Text style={styles.text}>Aucun succès dévérouillé</Text>
                    </ScrollView>
                    ) : (
                    <ScrollView contentContainerStyle={styles.scrollView}>
                        <Text style={styles.text}>Succès dévérouillé(s)</Text>
                        {succes}
                    </ScrollView>
                    )}
                </View>
            </View>
        );
    };

    const handleNavigateHome = () => {
        AudioManager.playEffect('click');
        navigation.navigate('Home', { screen: 'Home' });
    };

    const handleNewPart = () => {
            fetchWithAuth(`/games/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {            
                if (data.error) {
                    return;
                } else {
                    AudioManager.playEffect('click');
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
        height: '90%',
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
        width: 50,
        height: 50,
        position: 'absolute',
        top: -70,
        left : 80
    },
    bestScore: {
        marginTop: 20,
        paddingRight: 15,
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
    star: {
        marginRight: 15,
        width: 35,
        height: 35,
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

    textContainer: {
        flex: 1,
    },
   
    scrollView: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: 10,
        paddingTop : 10,
        paddingBottom: 1
    },
});