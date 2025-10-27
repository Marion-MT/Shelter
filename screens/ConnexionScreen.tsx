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


const BACKEND_ADDRESS = 'http://192.168.1.78:3000';


export default function ConnexionScreen({ navigation }: ConnexionScreenProps ) {
   
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailerror, setEmailError] = useState(false);
    const [isVisible, setIsvisible] = useState(false); //pour que le MDP soit caché

    

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
                    navigation.navigate('Home', { screen: 'Home' });
                    ;
                } else {
                    console.error('Erreur de connexion:', data.error);
                }
            })

        }
    

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.text}>
                    <Text style={styles.title}>Connecte-toi !</Text>
                    <TextInput
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    onChangeText={(value) => setEmail(value)}
                    value={email}
                    />
                    <TextInput 
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
                        <Text>Go</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Pas encore de compte ?</Text>
                    <TouchableOpacity onPress={() => handleSignin()} style={styles.button} activeOpacity={0.8}>
                        <Text>Créer un compte</Text>
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
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#95979A',
        width: 200,
        height: 40,
        borderRadius: 20,
    },
    background:{
        width:'100%',
        height: '100%',
    },
});