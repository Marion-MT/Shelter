import { store } from '../store';
import { updateTokens, signout } from '../reducers/user';
import { useNavigation } from '@react-navigation/native';

import { DEPLOYED_BACKEND_ADDRESS } from "../modules/global";
const API_URL = DEPLOYED_BACKEND_ADDRESS;//process.env.EXPO_PUBLIC_BACKEND_ADDRESS;


export const useFetchWithAuth = () => {
  const navigation = useNavigation();

const fetchWithAuth = async (endpoint: string, options: any = {}) => {
  
  try{
    const state = store.getState();
    console.log("state = ", state);

  const { token: accessToken, refreshToken } = state.user.value;

  if (!accessToken || !refreshToken) {
      navigation.navigate('Connexion', { screen: 'ConnexionScreen' });
      return new Response(JSON.stringify({ error: 'No tokens' }), { status: 401 });
    }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, ...options.headers }
  });

  // Si 401 → refresh
  if (response.status === 401) {

    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if(!refreshResponse.ok){
        store.dispatch(signout());

        navigation.navigate('Connexion', { screen: 'ConnexionScreen' });
        return refreshResponse;
        }
    
    const newToken = await refreshResponse.json();

    if (newToken.tokens.token) {
      store.dispatch(updateTokens(newToken.tokens));;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { Authorization: `Bearer ${newToken.tokens.token}`, ...options.headers }
      });
    } else {
      store.dispatch(signout());
      navigation.navigate('Connexion', { screen: 'ConnexionScreen' });
    }
  }
  return response;
    } catch (error) {
        // gestion globale des erreurs
        console.error('fetchWithAuth error:', error);
        throw error;
    }
};

return fetchWithAuth;
}