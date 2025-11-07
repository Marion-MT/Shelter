import { store } from '../store';
import { updateTokens, signout } from '../reducers/user';
import { useNavigation } from '@react-navigation/native';

import { DEPLOYED_BACKEND_ADDRESS } from "../modules/global";
const API_URL = DEPLOYED_BACKEND_ADDRESS;//process.env.EXPO_PUBLIC_BACKEND_ADDRESS;


/**
 * Hook personnalisé pour effectuer des requêtes HTTP authentifiées "obliger d'utiliser un hook pour usenavigation"
 * Gère automatiquement le refresh du token d'accès quand il expire
 * return Fonction fetchWithAuth pour faire des requêtes sécurisées
 */

export const useFetchWithAuth = () => {

  // Hook pour naviguer entre les écrans (utilisé pour redirection)
  const navigation = useNavigation();

/**
   * Fonction asynchrone pour faire une requête HTTP avec authentification
   * endpoint ex: '/users/profile'
   * options ex: method, body, headers, etc
   * returns La réponse du serveur
   */

const fetchWithAuth = async (endpoint: string, options: any = {}) => {
  
  try{

    // on récup l'état global Redux pour accéder aux tokens
    const state = store.getState();

  // on récup les tokens avec déstructurations et on renome token par accessToken
  const { token: accessToken, refreshToken } = state.user.value;

  // vérifie que les tokens existent sinon redirige vers la connexion
  if (!accessToken || !refreshToken) {
      navigation.navigate('Connexion');
      return new Response(JSON.stringify({ error: 'No tokens' }), { status: 401 });
    }

  // fait la requête initiale avec le token d'accès actuel
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,   // fusionne les options de la requête (method, body, etc)
    headers: { Authorization: `Bearer ${accessToken}`, ...options.headers } // ajoute le token dans le header et fusionne les autres headers
  });

  // gére le cas ou le token d'accès a expiré (réponse 401)
  if (response.status === 401) {

    // envoie une requête pour refresh
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }) // <-- envoie le refresh token
    })

    // si le refresh echoue  ( token expiré ou invalide)
    if(!refreshResponse.ok){

        // supprime les données du store
        store.dispatch(signout());

        // redirige vers la screen connexion
        navigation.navigate('Connexion');
        return refreshResponse;
        }
    
    // récupere le nouveau token depuis la reponse 
    const newToken = await refreshResponse.json();

    // verifie que le token a bien été reçu
    if (newToken.tokens.token) {

      // maj des tokens dans le store redux
      store.dispatch(updateTokens(newToken.tokens));

      // refait la requête initiale avec le nouveau token d'accés
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { Authorization: `Bearer ${newToken.tokens.token}`, ...options.headers } // <-- utilise le nouveau token "newtokens.token"
      });

    } else {

      // si le serveur n'a pas retourné de token valide 
      store.dispatch(signout()); // supprime les données du store 
      navigation.navigate('Connexion'); // renvoie vers la screen connexion
    }
  }

  // return la reponse 
  return response;
    } catch (error) {
        // gestion globale des erreurs 
        console.error('fetchWithAuth error:', error);
        throw error;
    }
};

// return la fonction fetchWithAuth pour être utilisée dans les composants
return fetchWithAuth;
}