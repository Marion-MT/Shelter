import Constants from 'expo-constants';
import { View, Modal, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ImageBackground } from "react-native"
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationProp, ParamListBase } from '@react-navigation/native';

import { useDispatch } from "react-redux";
import { signin } from "../reducers/user";



type ConnexionScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

// Grabbed from emailregex.com
const EMAIL_REGEX: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function ConnexionScreen({ navigation }: ConnexionScreenProps ) {
    
    console.log(BACKEND_ADDRESS);
   
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailSignup, setEmailSignup] = useState('');
    const [passwordSignup, setPasswordSignup] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [isVisible, setIsvisible] = useState(false); //pour que le MDP soit caché
    const [isSignupVisible, setIsSignupVisible] = useState(false); //état de la modal    

    const dispatch = useDispatch();

    const handleSignin = () => {
            fetch(`${BACKEND_ADDRESS}/users/signin`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({email, password})
            })
            .then(response => response.json())
            .then(data => {
                if (data.result){
                    console.log("data signin =>",data)
                    //stokage du token et redirection
                    dispatch(signin({token : data.token, email}))
                    setEmail('')
                    setPassword('')
                    navigation.navigate('Home', { screen: 'Home' });
                    ;
                } else {
                    console.error('Erreur de connexion:', data.error);
                }
            })

        }

        const handleSignup = () => {
            if (EMAIL_REGEX.test(emailSignup)){
                
                fetch(`${BACKEND_ADDRESS}/users/signup`,{
                    method: "POST",
                    headers:{'Content-Type' : 'application/json',},
                    body: JSON.stringify({email: emailSignup, password: passwordSignup})
                }).then(response => response.json())
                .then(data => {
                    console.log("création de compte", data.result);
                    if (data.result === true){
                        dispatch(signin({token : data.token, email: emailSignup}))
                        setEmailSignup('')
                        setPasswordSignup('')
                        setIsSignupVisible(false);
                        navigation.navigate('Home', { screen: 'Home' });
                    } else {
                        console.error('Erreur de connexion:', data.error)
                        setEmailSignup("")
                        setPassword('')
                    }
                })
            } else {
                setEmailError(true)
            }
        };
    

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.text}>
                    <Text style={styles.title}>Connexion</Text>
                    <TextInput
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    onChangeText={(value) => setEmail(value)}
                    value={email}
                    />
                    <TextInput 
                    style={styles.input}
                    placeholder="Password"
                    autoCapitalize="none"
                    textContentType="password"
                    autoCorrect = {false}
                    keyboardType="default"
                    secureTextEntry={!isVisible}
                    onChangeText={(value) => setPassword(value)}
                    value={password}
                    />
                    <TouchableOpacity onPress={() => handleSignin()} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Go</Text>
                    </TouchableOpacity>
                    <Text style={styles.title2}>Pas encore de compte ?</Text>
                    <TouchableOpacity onPress={() => setIsSignupVisible(true)} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Créer un compte</Text>
                    </TouchableOpacity>
                    <Modal
                    visible = {isSignupVisible}
                    animationType='slide'
                    transparent={true}
                    onRequestClose={()=> setIsSignupVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Rejoins la survie!</Text>
                                <TextInput
                                    style={styles.inputModal}
                                    placeholder="Email"
                                    onChangeText={(value) => setEmailSignup(value)}
                                    value={emailSignup}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />

                                <TextInput 
                                    style={styles.inputModal}
                                    placeholder="Password"
                                    autoCapitalize="none"
                                    textContentType="password"
                                    autoCorrect = {false}
                                    keyboardType="default"
                                    secureTextEntry={!isVisible}
                                    onChangeText={(value) => setPasswordSignup(value)}
                                    value={passwordSignup}
                                />
                                {emailError && <Text style={styles.error}>Invalid email address</Text>}

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.btn} onPress={handleSignup}>
                                        <Text style={styles.buttonText}>Valider</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btn} onPress={()=> setIsSignupVisible(false)}>
                                        <Text style={styles.buttonText}>Annuler</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        alignItems: 'center',
    },

    title: {
        fontSize: 40,
        fontWeight: '600',
        fontFamily: 'Futura',
        paddingBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        color:"#FFE7BF"      
    },

    title2:{
        fontSize: 30,
        fontWeight: '600',
        fontFamily: 'Futura',
        paddingBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 55,
        color:"#FFE7BF"   
    },

    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#342C29',
        width: 200,
        height: 40,
        borderRadius: 20,
    },
    background:{
        width:'100%',
        height: '100%',
    },

    modalContent:{
        backgroundColor: "#342C29",
        width:'80%',
        padding: 20,
        borderRadius: 12,
        elevation: 10,
    },

    modalOverlay:{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalTitle:{
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: "center",
        color: "#FFE7BF"
    },

    input:{
        width: 240,
        height: 50,
        backgroundColor: '#FFE7BF',
        color: "#342C29",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        
    },

    inputModal:{
        width:"100%",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: "#FFE7BF",
        color:'#342C29'
        
    },

    modalButtons:{
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 5,
    },

    btn:{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#342C29',
        width: 100,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FFE7BF",
    },

    buttonText: {
        color: "#FFE7BF",
    },

    error: {
        marginTop: 10,
        color: 'red',
    },
});