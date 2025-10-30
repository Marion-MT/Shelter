import { View, Text, StyleSheet, ImageBackground, Image, Pressable, TouchableOpacity, Modal } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Slider, Switch } from '@rneui/themed';
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateBestScore } from "../reducers/user";

type ParametreScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function ParametreScreen({ navigation }: ParametreScreenProps ) {
    const [volume, setVolume] = useState(50);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [soundText, setSoundText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const user = useSelector((state: string) => state.user.value);
    const dispatch = useDispatch();

    const toggleSound = () => {
        setSoundEnabled(!soundEnabled);
        setSoundText(soundEnabled ? 'OFF' : 'ON');
    };
   
    const handleNavigate = () => {
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
            <View style={styles.main}>
                <Pressable onPress={() => handleNavigate()}>
                    <Image source={require('../assets/icon-arrow.png')} style={styles.arrow}/>
                </Pressable>
                <View style={styles.darkBackground}>
                    <View style={styles.cardContainer}>
                        <View style={styles.setupContainer}>
                            <Text style={styles.text}>Volume : {volume}</Text>
                            <Slider
                                value={volume}
                                onValueChange={setVolume}
                                maximumValue={100}
                                minimumValue={0}
                                step={2}
                                allowTouchTrack
                                trackStyle={{ height: 25, borderRadius: 12.5, borderColor: 'black', borderWidth: 2.5, backgroundColor: '#524743' }}
                                thumbStyle={{ height: 30, width: 30, borderColor: 'black', borderWidth: 2.5, backgroundColor: '#FFE8BF' }}
                                minimumTrackTintColor="#388FF0"
                                maximumTrackTintColor="#524743"
                                style={styles.volumeSlider}
                            />
                            <Text style={styles.text}>Son : {soundText}</Text>
                            <Switch
                                value={soundEnabled}
                                onValueChange={toggleSound}
                                width={40}
                                thumbColor={soundEnabled ? '#FFE8BF' : '#FFE8BF'}
                                trackColor={{ false: '#D05A34', true: '#74954E' }}
                            />
                        </View>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
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
                                        <Text style={styles.modalText}>Voulez vous vraiment réinitialisé votre compte ?</Text>
                                        <Text style={styles.modalText2}>Cette action est irréversible.</Text>
                                        <View style={styles.modalBtns}>
                                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                                <View style={styles.btnContainerNo}>
                                                    <Text style={styles.modalBtnText}>Non</Text>
                                                </View>
                                            </TouchableOpacity>   
                                            <TouchableOpacity onPress={() => {handleResetAccount(); setModalVisible(false);}}>
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
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    main: {
        width: '100%',
        paddingHorizontal: 36,
        paddingVertical: 30,
    },
    arrow: {
        width: 75,
        height: 75,
        marginBottom: 30,
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
        justifyContent: 'space-between',
        backgroundColor : '#342c29',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderColor: '#554946',
        borderWidth: 5
    },
    setupContainer: {
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '80%',
    },
    volumeSlider: {
        width: '100%',
    },
    text: {
        color: '#FFE8BF',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 25,
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
        fontWeight: 'bold',
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
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor : '#342c29',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderColor: '#554946',
        borderWidth: 5
    },
    modalBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 20,
    },
    modalText: {
        color: '#FFE8BF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 40,
    },
    modalText2: {
        color: '#FFE8BF',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 60,
    },
    btnContainerYes: {
        width: 130,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#74954E',
        borderColor: 'black',
        borderWidth: 1.5,
        borderRadius: 12,
        marginBottom: 25,
    },
    btnContainerNo: {
        width: 130,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D05A34',
        borderColor: 'black',
        borderWidth: 1.5,
        borderRadius: 12,
        marginBottom: 25,
    },
    modalBtnText: {
        color: '#FFE8BF',
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});