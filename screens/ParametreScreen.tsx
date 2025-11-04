import { View, Text, StyleSheet, ImageBackground, Image, Pressable, TouchableOpacity, Modal, Alert } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Slider, Switch } from '@rneui/themed';
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateBestScore } from "../reducers/user";
import { FontAwesome } from "@expo/vector-icons";

import AudioManager from '../modules/audioManager';
import { updateSettings } from "../reducers/user";

type ParametreScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function ParametreScreen({ navigation }: ParametreScreenProps ) {
    const user = useSelector((state: string) => state.user.value);

    const [volume, setVolume] = useState(user.volume);
    const [soundEnabled, setSoundEnabled] = useState(user.soundOn);
    const [soundText, setSoundText] = useState('');
    const [soundClicEnabled, setSoundClicEnabled] = useState(user.btnSoundOn);
    const [soundClicText, setSoundClicText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const dispatch = useDispatch();

    // vérifie l'envoie des donnée dans la console
    useEffect(() => {
     console.log("user store update =>", 'Volume:',user.volume, 'Musique:',user.soundOn, 'Bruitage:',user.btnSoundOn);
    }, [user]);

    useEffect(() => {
        setVolume(user.volume);
        setSoundEnabled(user.soundOn);
        setSoundClicEnabled(user.btnSoundOn);
        setSoundText(user.soundOn ? 'ON' : 'OFF');
        setSoundClicText(user.btnSoundOn ? 'ON' : 'OFF');
    }, [user]);


    const handleVolumeChange = (value: number) => {
        setVolume(value);
        AudioManager.setMusicVolume(value); // modifie le volume de la musique
        dispatch(updateSettings({ volume: value }));
    };

    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        setSoundText(newState ? 'ON' : 'OFF');
        AudioManager.setMusicMuted(!newState); // mute/démute la musique
        dispatch(updateSettings({ soundOn: newState }));
    };

    const toggleSoundClic = () => {
        const newState = !soundClicEnabled;
        setSoundClicEnabled(newState);
        setSoundClicText(newState ? 'ON' : 'OFF');
        AudioManager.setEffectsMuted(!newState); // mute/démute les bruitages
        dispatch(updateSettings({ btnSoundOn: newState }));
    };

    const handleSaveSettings = async () => {
    try {
        const response = await fetch(`${BACKEND_ADDRESS}/users/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
            volume,
            soundOn: soundEnabled,
            btnSoundOn: soundClicEnabled,
        }),
        });

        const data = await response.json();

        if (data.result) {
        dispatch(updateSettings({
            volume: data.settings.volume,
            soundOn: data.settings.soundOn,
            btnSoundOn: data.settings.btnSoundOn,
        }));
        AudioManager.setMusicMuted(!data.settings.soundOn);
        AudioManager.setEffectsMuted(!data.settings.btnSoundOn);
        AudioManager.setMusicVolume(data.settings.volume);

        console.log('Paramètres sauvegardés avec succès sur le serveur :', data.settings);
        Alert.alert('Paramètres sauvegardés')
            } else {
            console.log('Erreur côté serveur :', data.error);
            }
        } catch (error) {
            console.error('Erreur de requête PUT /settings :', error);
        }
    };

   
    const handleNavigate = () => {
        AudioManager.playEffect('click');
        navigation.navigate('Home', { screen: 'Home' });
    };

    const handleResetAccount = () => {
        fetch(`${BACKEND_ADDRESS}/users/reset`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === true) {
                dispatch(updateBestScore(data.bestScore));
                console.log('Compte réinitialisé avec succès');
                Alert.alert('Compte réinitialisé avec succès')
                return;
            } else {
                console.log('Échec de la réinitialisation du compte');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la réinitialisation du compte :', error);
        });
    };



    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => {AudioManager.playEffect('click'); handleNavigate();}}>
                    <Image source={require('../assets/icon-arrow.png')} style={styles.leftArrow} />
                </TouchableOpacity>
            </View>
            <View style={styles.main}>
                <View style={styles.darkBackground}>
                    <View style={styles.cardContainer}>
                        <View style={styles.setupContainer}>
                            <Text style={styles.title} >PARAMÈTRES</Text>
                            <Text style={styles.text}>Volume : {volume}</Text>
                            <Slider
                                value={volume}
                                onValueChange={handleVolumeChange}
                                maximumValue={100}
                                minimumValue={0}
                                step={2}
                                allowTouchTrack
                                trackStyle={{ height: 25, borderRadius: 12.5, backgroundColor: '#524743' }}
                                thumbStyle={{ height: 32, width: 32, backgroundColor: '#FFE8BF' }}
                                minimumTrackTintColor="#388FF0"
                                maximumTrackTintColor="#524743"
                                style={styles.volumeSlider}
                            />
                            <Text style={styles.text}>Musique : {soundText}</Text>
                            <View style={{transform: 'scale(2)'}}>
                                <Switch
                                    value={soundEnabled}
                                    onValueChange={toggleSound}
                                    style={{width : 95, height: 45}}
                                    thumbColor={soundEnabled ? '#FFE8BF' : '#FFE8BF'}
                                    trackColor={{ false: '#D05A34', true: '#74954E' }}
                                />
                            </View>
                            <Text style={styles.text}>Bruitage : {soundClicText}</Text>
                            <View style={{transform: 'scale(2)'}}>
                                <Switch
                                    value={soundClicEnabled}
                                    onValueChange={toggleSoundClic}
                                    style={{width : 95, height: 45}}
                                    thumbColor={soundClicEnabled ? '#FFE8BF' : '#FFE8BF'}
                                    trackColor={{ false: '#D05A34', true: '#74954E' }}
                                />
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => {AudioManager.playEffect('click'); handleSaveSettings()}}>
                            <View style={styles.btnContainer}>
                                <Text style={styles.btnText}>Sauvegarder</Text>
                                <Text style={styles.btnText}>les parametres</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {AudioManager.playEffect('click'); setModalVisible(true);}}>
                            <View style={styles.btnContainer}>
                                <Text style={styles.btnText}>réinitialisation</Text>
                                <Text style={styles.btnText}>du compte</Text>
                            </View>
                        </TouchableOpacity>
                        <Modal
                        visible={modalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalBackground}>
                                    <View style={styles.modalContainer}>
                                        <View style={styles.textContainer}>
                                            <Text style={styles.modalText}>Voulez-vous vraiment réinitialiser votre compte ?</Text>
                                            <FontAwesome name={'warning' as any} size={50} color='#ffe7bf' />
                                            <Text style={styles.modalText2}>Cette action est irréversible.</Text>
                                        </View>
                                        
                                        <View style={styles.modalBtns}>
                                            <TouchableOpacity onPress={() => {AudioManager.playEffect('click'); setModalVisible(false);}}>
                                                <View style={styles.btnContainerNo}>
                                                    <Text style={styles.modalBtnText}>Non</Text>
                                                </View>
                                            </TouchableOpacity>   
                                            <TouchableOpacity onPress={() => {AudioManager.playEffect('click'); handleResetAccount(); setModalVisible(false);}}>
                                                <View style={styles.btnContainerYes}>
                                                    <Text style={styles.modalBtnText}>Oui</Text>
                                                </View>
                                            </TouchableOpacity>    
                                        </View> 
                                    </View>   
                                </View>
                            </View>
                        </Modal>
                    </View>
                </View>
            </View>    
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        height: undefined,
        width : '100%',
        paddingHorizontal: 40,
        paddingTop: 40,
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
    main: {
        width: '100%',
        height: undefined,
        paddingHorizontal: 36,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 40
    },
    arrow: {
        width: 75,
        height: 75,
        marginBottom: 30,
    },
    darkBackground:{
        backgroundColor : '#242120',
        width: '100%',
        height: '88%',
        borderRadius: 20,
        padding: 12,
    },
    cardContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor : '#342c29',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderColor: '#554946',
        borderWidth: 5
    },
    title : {
        color: '#ffe7bf',
        fontFamily: 'ArialRounded',
        fontSize: 26,
        textAlign: 'center',
        marginBottom: 5
    },
    setupContainer: {
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '80%',
        paddingTop :30
    },
    volumeSlider: {
        width: '100%',
    },
    text: {
        color: '#FFE8BF',
        fontSize: 22,
        marginBottom: 15,
        marginTop: 25,
        fontFamily: 'ArialRounded',
    },
    btnContainer: {
        width: 210,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#242120',
        borderColor: 'black',
        borderWidth: 1.5,
        borderRadius: 12,
        marginBottom: 25,
    },
    btnText: {
        color: '#FFE8BF',
        fontSize: 18,
        fontFamily: 'ArialRounded',
        textTransform: 'uppercase',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalBackground: {
        width: 350,
        height: 350,
        padding: 10,
        backgroundColor: '#242120',
        borderRadius: 20,
    },
    modalContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor : '#342c29',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderColor: '#554946',
        borderWidth: 5,

    },
    textContainer:{
        height: '65%',
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
        gap : 20
    },
    modalBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        height: '30%',
    },
    modalText: {
        color: '#FFE8BF',
        fontSize: 20,
        fontFamily: 'ArialRounded',
        textAlign: 'center',
    },
    modalText2: {
        color: '#FFE8BF',
        fontSize: 17,
        fontFamily: 'ArialRounded',
        textAlign: 'center',
    },
    btnContainerYes: {
        width: 130,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#74954E',
        borderRadius: 12,
    },
    btnContainerNo: {
        width: 130,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D05A34',
        borderRadius: 12,
    },
    modalBtnText: {
        color: '#FFE8BF',
        fontSize: 20,
        textTransform: 'uppercase',
        fontFamily: 'ArialRounded',
    },
});