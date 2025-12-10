import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import user from './reducers/user';
import game from './reducers/gameSlice';

// --- Configuration de persistance ---
const persistConfig = {
  key: 'shelter',
  storage: AsyncStorage,
  whitelist: ['user', 'game'], // facultatif : garde ces slices persistées
};

// --- Combine les reducers ---
const rootReducer = combineReducers({
  user,
  game,
});

// --- Applique la persistance ---
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- Crée le store Redux ---
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // nécessaire pour redux-persist
    }),
});

// --- Persistance du store ---
const persistor = persistStore(store);

// --- Exports globaux ---
export { store, persistor };

// --- Types utiles pour TypeScript ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
