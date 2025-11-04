import { store } from '../App';
import { updateAccestoken, signout } from '../reducers/user';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export const fetchWithAuth = async (endpoint: string, options: any = {}) => {
  const state = store.getState();
  const { token: accessToken, refreshToken } = state.user.value;

console.log('STATE REDUX:', state.user.value)

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, ...options.headers }
  });

  // Si 401 → refresh
  if (response.status === 401) {
    console.log(' TOKEN EXPIRÉ')
    console.log('refresh token utilisé :', refreshToken);
    const newToken = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    }).then(r => {
      console.log('Status refresh:', r.status); // ← LOG
      return r.json();
    }).then(d => {
      console.log('Response refresh:', d); // ← LOG
      return d;
    });

    console.log('newToken reçu :', newToken.token);
    if (newToken.token) {
        console.log('NOUVEAU TOKEN OBTENU');
      store.dispatch(updateAccestoken(newToken.token));
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { Authorization: `Bearer ${newToken.token}`, ...options.headers }
      });
    } else {
      console.log('REFRESH ÉCHOUÉ - DÉCONNEXION');
      store.dispatch(signout());
    }
  }
  return response;
};