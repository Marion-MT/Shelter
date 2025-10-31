import Constants from 'expo-constants';
import { View, Modal, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ImageBackground } from "react-native"
import { useState } from "react"; 
import { NavigationProp, ParamListBase } from '@react-navigation/native';

import { useDispatch } from "react-redux";
import { signin } from "../reducers/user";

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';


type ConnexionScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

//<Entypo name="eye-with-line" size={24} color="black" />,
//<Entypo name="eye" size={24} color="black" />
// Grabbed from emailregex.com
const EMAIL_REGEX: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;
const EMAIL_SIGNIN = process.env.EXPO_PUBLIC_EMAIL_SIGNIN
const PWD_SIGNIN = process.env.EXPO_PUBLIC_PWD_SIGNIN

export default function ConnexionScreen({ navigation }: ConnexionScreenProps ) {
       
    const [email, setEmail] = useState(`${EMAIL_SIGNIN}`);
    const [password, setPassword] = useState(`${PWD_SIGNIN}`);
    const [emailSignup, setEmailSignup] = useState('');
    const [passwordSignup, setPasswordSignup] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [isPWDVisible, setIsPWDvisible] = useState(false); //pour que le MDP soit caché
    const [isSignupVisible, setIsSignupVisible] = useState(false); //état de la modal
    const [signinError, SetSigninError] = useState('')
    const [signupError, setSignupError] = useState('')
    const [passwordError, setPasswordError] = useState('')    

    const dispatch = useDispatch();

    const handleSignin = () => {
        console.log("handleSignin");
            SetSigninError('');
            if(!email || !password){
                SetSigninError('Veuillez remplir tous les champs');
                return;
            }
             if(!EMAIL_REGEX.test(email)){
                SetSigninError('Email invalide')
                return;
             }
            fetch(`${BACKEND_ADDRESS}/users/signin`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({email, password})
            })
            .then(response => {console.log("response received"); return response.json()})
            .then(data => {
                console.log("data received");
                if (data.result){
                    console.log("data signin =>",data)
                    //stokage du token et redirection
                    dispatch(signin({token : data.token, email}))
                    setEmail('')
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
            setEmailError(false);
            setPasswordError('');
            setSignupError('')

            if (!EMAIL_REGEX.test(emailSignup)){
                setEmailError(true);
                return;
            }

            if (!passwordSignup || passwordSignup.length < 3){
                setPasswordError("Le mot de passe doit contenir au moins 3 caratères")
                return
            }
                
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
                        setEmailError(false)
                        setSignupError('')
                        setPasswordError('')
                        setIsSignupVisible(false);
                        navigation.navigate('Home', { screen: 'Home' });
                    } else {
                        //console.error('Erreur de connexion:', data.error)
                        setSignupError('Email déjà utilisé')
                        setEmailSignup("")
                        setPassword('')
                    }
                })
            .catch(error => {
                console.error('Erreur réseau', error)
                setSignupError('Erreur de connexion au serveur')
            });
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
                        onChangeText={(value) => {setEmail(value); SetSigninError('')}}
                        value={email}
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
                            onChangeText={(value) => {setPassword(value); SetSigninError('')}}
                            value={password}
                        />
                        <TouchableOpacity style={styles.eyeButton} onPress={()=>setIsPWDvisible(!isPWDVisible)}>
                            <Entypo name={isPWDVisible ? "eye-with-line" : "eye"} size={22} color={'#352c2bb0'}/>
                        </TouchableOpacity>
                    </View>
                    {signinError && <Text style={styles.error}>{signinError}</Text>}

                    <TouchableOpacity onPress={() => handleSignin()} style={styles.button} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Go</Text>
                    </TouchableOpacity>
                    <Text style={styles.title2}>Pas encore de compte ?</Text>
                    <TouchableOpacity onPress={() => {setIsSignupVisible(true); setEmail(''); setPassword('')}} style={styles.button} activeOpacity={0.8}>
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
                                    <TouchableOpacity style={styles.btn} onPress={()=> {setIsSignupVisible(false); setEmailSignup(''); setPasswordSignup('')}}>
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
});