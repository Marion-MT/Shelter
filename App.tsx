import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useFonts } from 'expo-font';

import AudioManager from './modules/audioManager';
import { store, persistor } from './store';  // import du store

import ConnexionScreen from './screens/ConnexionScreen';
import CreditScreen from './screens/CreditScreen';
import EndGameScreen from './screens/EndGameScreen';
import GameScreen from './screens/GameScreen';
import HomeScreen from './screens/HomeScreen';
import IntroductionScreen from './screens/IntroductionScreen';
import ParametreScreen from './screens/ParametreScreen';
import SplashScreen from './screens/SplashScreen';
import SuccesScreen from './screens/SuccesScreen';
import RecapGameScreen from './screens/RecapGameScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  // Charge les sons et lance la musique de fond du menu
  useEffect(() => {
    const init = async () => {
      await AudioManager.preloadAll();

      await AudioManager.playBackground();
    };

    init();
  }, []);

  // Permet la transition de la musique de fond du menu a celle de la game
  useEffect(() => {
    let lastInGame = store.getState().game?.inGame;

    const unsubscribe = store.subscribe(async () => {
      const state = store.getState();
      const inGame = state.game?.inGame;

      if (inGame !== lastInGame) {
        if (inGame) {
          await AudioManager.pauseBackground();
          await AudioManager.playBackgroundGame();
        } else {
          await AudioManager.pauseBackgroundGame();
          await AudioManager.playBackground();
        }

        lastInGame = inGame;
      }
    });

    return () => unsubscribe();
  }, []);

  // Chargement des polices
  const [loaded, error] = useFonts({
    DaysLater: require('./assets/fonts/28 Days Later.ttf'),
    ArialRounded: require('./assets/fonts/arialroundedmtbold.ttf'),
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="SplashScreen" component={SplashScreen} />
              <Stack.Screen name="Introduction" component={IntroductionScreen} />
              <Stack.Screen name="Connexion" component={ConnexionScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Parametre" component={ParametreScreen} />
              <Stack.Screen name="Credit" component={CreditScreen} />
              <Stack.Screen name="Succes" component={SuccesScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
              <Stack.Screen name="EndGame" component={EndGameScreen} />
              <Stack.Screen name="RecapGame" component={RecapGameScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
