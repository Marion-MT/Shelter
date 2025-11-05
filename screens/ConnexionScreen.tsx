import Constants from 'expo-constants';
import { View, ActivityIndicator, Alert, Modal, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ImageBackground } from "react-native"
import { useState } from "react"; 
import { NavigationProp, ParamListBase } from '@react-navigation/native';

import { useDispatch } from "react-redux";
import { signin } from "../reducers/user";

import Entypo from '@expo/vector-icons/Entypo';

import AudioManager from '../modules/audioManager';


type ConnexionScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}


// Grabbed from emailregex.com
const EMAIL_REGEX: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;
const USERNAME_SIGNIN = process.env.EXPO_PUBLIC_USERNAME_SIGNIN
const PWD_SIGNIN = process.env.EXPO_PUBLIC_PWD_SIGNIN

export default function ConnexionScreen({ navigation }: ConnexionScreenProps ) {
       
    const [username, setUsername] = useState(`${USERNAME_SIGNIN}`);
    const [password, setPassword] = useState(`${PWD_SIGNIN}`);
    const [usernameSignup, setUsernameSignup] = useState(``);
    const [emailSignup, setEmailSignup] = useState('');
    const [passwordSignup, setPasswordSignup] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [isPWDVisible, setIsPWDvisible] = useState(false); //pour que le MDP soit caché
    const [isSignupVisible, setIsSignupVisible] = useState(false); //état de la modal signup
    const [isResetPWDVisible, setIsResetPWDVisible] = useState(false); //état de la modal reset pwd
    const [emailReset, setEmailReset] = useState('');
    const [signinError, SetSigninError] = useState('')
    const [signupError, setSignupError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [loading, setLoading] = useState(false);    

    const dispatch = useDispatch();

    const handleSignin = () => {
            SetSigninError('');
            if(!username || !password){
                SetSigninError('Veuillez remplir tous les champs');
                return;
            }
            
            fetch(`${BACKEND_ADDRESS}/users/signin`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({username, password})
            })
            .then(response => {console.log("response received"); return response.json()})
            .then(data => {
                console.log("data received");
                if (data.result){
                    console.log("data signin =>",data)
                    //stokage du token et redirection
                    dispatch(signin({token : data.token, refreshToken: data.refreshToken, username, email: data.email}))
                    setUsername('')
                    setPassword('')
                    SetSigninError('')
                    navigation.navigate('Home', { screen: 'Home' });
                } else {
                    //console.error('Erreur de connexion:', data.error);
                    SetSigninError("Utilisateur introuvable")
                }
            })
            .catch(error => {
                console.error('Erreur de réseau', error)
                SetSigninError('Erreur de connexion au serveur')
            });
        }

        const handleSignup = () => {
            AudioManager.playEffect('click');
            setEmailError(false);
            setPasswordError('');
            setSignupError('');
            setUsernameSignup('');

            if (!EMAIL_REGEX.test(emailSignup)){
                setEmailError(true);
                return;
            }

            if (!usernameSignup){
                setSignupError("Vous devez saisir un username")
                return
            }
            if (!passwordSignup || passwordSignup.length < 3){
                setPasswordError("Le mot de passe doit contenir au moins 3 caratères")
                return
            }
                
                fetch(`${BACKEND_ADDRESS}/users/signup`,{
                    method: "POST",
                    headers:{'Content-Type' : 'application/json',},
                    body: JSON.stringify({email: emailSignup, username: usernameSignup, password: passwordSignup})
                }).then(response => response.json())
                .then(data => {
                    console.log("création de compte", data.result);
                    if (data.result === true){
                        dispatch(signin({token : data.token, refreshToken: data.refreshToken, username : usernameSignup, email: emailSignup}))
                        setEmailSignup('')
                        setUsername('')
                        setPasswordSignup('')
                        setEmailError(false)
                        setSignupError('')
                        setPasswordError('')
                        setIsSignupVisible(false);
                        navigation.navigate('Home', { screen: 'Home' });
                    } else {
                        //console.error('Erreur de connexion:', data.error)
                        setSignupError('Email/Username déjà utilisé')
                        setPassword('')
                    }
                })
            .catch(error => {
                console.error('Erreur réseau', error)
                setSignupError('Erreur de connexion au serveur')
            });
        };
        
    const handleResetPassword = async () => {
         setEmailError(false);

            if (!EMAIL_REGEX.test(emailReset)){
                setEmailError(true);
                return;
            }

            setLoading(true);

            try{
                const response = await fetch(`${BACKEND_ADDRESS}/users/forgot-password`, {
                    method: "POST",
                    headers: {"Content-Type" : 'application/json',
                    },
                    body: JSON.stringify({email : emailReset})
                });
                const data = await response.json()
                if (response.ok){
                    Alert.alert('Email envoyé', data.message || 'Si cet email existe, un lien de réinitialisation a été envoyé. Pensez à vérifier dans les spams.',
                        [
            {
              text: 'OK',
              onPress: () => setIsResetPWDVisible(false)
            }
          ]
                    )
                } else {
                    Alert.alert ('Erreur', data.error || 'Une erreur est survenue')
                }
            } catch (error) {
                Alert.alert('Erreur', 'Impossible de contacter le serveur')
                console.error(error);
                
            } finally {
                setLoading(false);
            }
    };

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.text}>
                    <Text style={styles.title}>Connexion</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Peudo"
                        autoCapitalize="none"
                        keyboardType='default'
                        autoComplete="username"
                        onChangeText={(value) => {AudioManager.playEffect('click'); setUsername(value); SetSigninError('')}}
                        value={username}
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput 
                            style={styles.passwordInput}
                            placeholder="Password"
                            autoCapitalize="none"
                            textContentType="password"
                            autoCorrect = {false}
                            keyboardType="default"
                            secureTextEntry={!isPWDVisible}
                            onChangeText={(value) => {AudioManager.playEffect('click'); setPassword(value); SetSigninError('')}}
                            value={password}
                        />
                        <TouchableOpacity style={styles.eyeButton} onPress={()=>setIsPWDvisible(!isPWDVisible)}>
                            <Entypo name={isPWDVisible ? "eye-with-line" : "eye"} size={22} color={'#352c2bb0'}/>
                        </TouchableOpacity>
                    </View>
                    {signinError && <Text style={styles.error}>{signinError}</Text>}
                   
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                    <TouchableOpacity onPress={() => {setIsResetPWDVisible(true); setUsername(''); setPassword('')}} style={styles.buttonReset} activeOpacity={0.8}>
                        <Text style={styles.buttonTextResetPwd}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>
                   </View>

                    <TouchableOpacity onPress={() => {AudioManager.playEffect('click'); handleSignin()}} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Go</Text>
                    </TouchableOpacity>



                    <Modal
                    visible = {isResetPWDVisible}
                    animationType='slide'
                    transparent={true}
                    onRequestClose={()=> {setIsResetPWDVisible(false); setEmailError(false); setPasswordError(''); setSignupError('')}}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Demande de réinitialisation de mot de passe</Text>
                                <TextInput
                                    style={styles.inputModal}
                                    placeholder="Email"
                                    onChangeText={(value) => {setEmailReset(value);setEmailError(false)}}
                                    value={emailReset}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                                {emailError && <Text style={styles.error}>Email invalide</Text>}
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.btn} onPress={handleResetPassword} disabled={loading}>
                                        {loading ? (
                                        <ActivityIndicator color="#FFE7BF" size="small" />
                                    ) : (
                                        <Text style={styles.buttonTextModal}>Valider</Text>
                                    )}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btn} onPress={()=> {setIsResetPWDVisible(false); setEmailReset(''); setEmailError(false)}}>
                                        <Text style={styles.buttonTextModal}>Annuler</Text>
                                    </TouchableOpacity>
                                </View>
                            </View> 
                            </View>                      
                    </Modal>
                    


                    <Text style={styles.title2}>Pas encore de compte ?</Text>
                    <TouchableOpacity onPress={() => {AudioManager.playEffect('click'); setIsSignupVisible(true); setUsername(''); setPassword('')}} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Créer un compte</Text>
                    </TouchableOpacity>
                    <Modal
                    visible = {isSignupVisible}
                    animationType='slide'
                    transparent={true}
                    onRequestClose={()=> {setIsSignupVisible(false); setEmailError(false); setPasswordError(''); setSignupError('')}}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Rejoins la survie!</Text>
                                <TextInput
                                    style={styles.inputModal}
                                    placeholder="Email"
                                    onChangeText={(value) => {setEmailSignup(value);setEmailError(false)}}
                                    value={emailSignup}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                                <TextInput
                                    style={styles.inputModal}
                                    placeholder="Pseudo"
                                    autoCapitalize="none"
                                    keyboardType='default'
                                    autoComplete="username"
                                    onChangeText={(value) => {setUsernameSignup(value); SetSigninError('')}}
                                    value={usernameSignup}
                                />
                                <View style={styles.passwordContainerModal}>
                                    <TextInput 
                                        style={styles.passwordInputModal}
                                        placeholder="Password"
                                        autoCapitalize="none"
                                        textContentType="password"
                                        autoCorrect = {false}
                                        keyboardType="default"
                                        secureTextEntry={!isPWDVisible}
                                        onChangeText={(value) => {setPasswordSignup(value); setPasswordError('')}}
                                        value={passwordSignup}
                                    />
                                    <TouchableOpacity style={styles.eyeButton} onPress={()=>setIsPWDvisible(!isPWDVisible)}>
                                        <Entypo name={isPWDVisible ? "eye-with-line" : "eye"} size={22} color={'#352c2bb0'}/>
                                    </TouchableOpacity>
                                </View>
                                {emailError && <Text style={styles.error}>Email invalide</Text>}
                                {passwordError && <Text style={styles.error}>{passwordError}</Text>}
                                {signupError && <Text style={styles.error}>{signupError}</Text>}

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.btn} onPress={handleSignup}>
                                        <Text style={styles.buttonTextModal}>Valider</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btn} onPress={()=> {AudioManager.playEffect('click'); setIsSignupVisible(false); setEmailSignup(''); setUsernameSignup(''); setPasswordSignup('')}}>
                                        <Text style={styles.buttonTextModal}>Annuler</Text>
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
        backgroundColor: '#352C2B',
        width: 235,
        height: 60,
        borderWidth: 2.5,
        borderColor: 'black',
        borderRadius: 15,
        margin: 15,
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
        textTransform: 'uppercase',
        fontSize: 23,
        fontWeight: 'bold',
        color: '#EFDAB7',
    },

    buttonTextModal: {
        textTransform: 'uppercase',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EFDAB7',
    },

    error: {
        marginTop: 10,
        color: '#ff4444',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: '500',
    },

    eyeButton: {
    },
      
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 240,
        height: 50,
        backgroundColor: '#FFE7BF',
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
    },

     passwordInput: {
        flex: 1,
        height: '100%',
        color: "#342C29",
        fontSize: 16,
    },

    passwordContainerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#FFE7BF",
    height: 50,
},

passwordInputModal: {
    flex: 1,
    height: '100%',
    color: '#342C29',
    fontSize: 16,
},
buttonTextResetPwd: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#EFDAB7',
},
buttonReset: {
    alignItems: 'center',
    justifyContent: "space-around",
    width: 150,
    height: 25,
    borderBottomWidth : 1.5,
    borderBottomColor: "#342C29",
    
},

});