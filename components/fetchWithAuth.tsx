import { store } from '../store';
import { updateTokens, signout } from '../reducers/user';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export const fetchWithAuth = async (endpoint: string, options: any = {}) => {
  
  try{
    const state = store.getState();
  const { token: accessToken, refreshToken } = state.user.value;


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
        return response;
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
    }
  }
  return response;
    } catch (error) {
        // gestion globale des erreurs
        console.error('fetchWithAuth error:', error);
        throw error;
    }
};