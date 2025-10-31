import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

//redux imports
import { Provider } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import user from './reducers/user'

const store= configureStore({
  reducer: {user},
})

/*
//redux-presist imports
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const reducers = combineReducers({users})
const persistConfig = {
  key: 'shelter',
  storage: AsyncStorage
}

const store = configureStore({
  reducer : persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware ({serializableCheck: false})
})

const persistor = persistStore(store);
*/
import { useFonts } from 'expo-font';



const Stack = createNativeStackNavigator();

export default function App() {

  const [loaded, error] = useFonts({
    DaysLater: require('./assets/fonts/28 Days Later.ttf'),
    ArialRounded: require('./assets/fonts/arialroundedmtbold.ttf'),
  });

  if (!loaded && !error) {
    return null;
  }


  return (
    <Provider store={store}>
          <GestureHandlerRootView>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='SplashScreen' component={SplashScreen} />
            {/*<Stack.Screen name='Introduction' component={IntroductionScreen} />*/}
            <Stack.Screen name='Connexion' component={ConnexionScreen} />
            <Stack.Screen name='Home' component={HomeScreen}/>
            <Stack.Screen name='Parametre' component={ParametreScreen} />
            <Stack.Screen name='Credit' component={CreditScreen} />
            <Stack.Screen name='Succes' component={SuccesScreen} />
            <Stack.Screen name='Game' component={GameScreen}/>
            <Stack.Screen name='EndGame' component={EndGameScreen} />
            <Stack.Screen name='RecapGame' component={RecapGameScreen} />
            <Stack.Screen name='Splash' component={SplashScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        </GestureHandlerRootView>
    </Provider>

  );
}
