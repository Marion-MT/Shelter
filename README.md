# SHELTER
## Présentation
Shelter est un jeu mobile narratif de survie à choix binaires inspiré de <i>Reigns</i>.
À chaque tour, une carte décrivant un évènement est présentée au joueur (rencontre, attaque, situation à gérer...). Le joueur doit prendre une décision en swipant la carte à droite ou à gauche, ce qui aura une conséquence sur une ou plusieurs des jauges liées à la survie.

🎯 Objectif : Survivre le plus longtemps possible.

⚖️ Maintenir l’équilibre de 4 jauges critiques : Faim, Sécurité, Santé, Moral.

🥫 Gestion d'une jauge "réserve de nourriture" qui diminuent passivement chaque jour passé.

📉 Si une jauge tombe à 0, la partie est perdue.

## Fonctionnalités principales

*	Cartes tirées semi-aléatoirement :
    - début de partie scénarisé
    - prise en compte des cartes déjà tirées
    - système de cooldown
    - scénarios requis / scénarios bloquants
    - arbres scénaristiques
    - déclenchement de nouvelles cartes ajoutées à la pioche

* Choix binaires (swipe gauche/droite) impactant les jauges

*	Système de score : nombre de jours survécus

*	Accès à un top des meilleurs joueurs

*	Succès déblocables

*	Possibilité de réinitialisation des données du compte

## Stack Technique

### Frontend
- TypeScript
- React Native
- Expo
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) (sons & musiques)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) (détection de gestes)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) (animations)

### Backend
- Node.js
- Express — API REST
- JWT
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js/)
- MongoDB
- [Mongoose](https://mongoosejs.com/)

## Équipe
Ce jeu a été réalisé en deux semaines dans un cadre d'un projet de fin de formation (Développeur Fullstack web & mobile) par une équipe de 4 étudiants :
Ahmed Hassainia - Cédric Auneau - Marion Trehin - Valentin Dubillot

### Contribution personnelle au projet :
- élaboration du Game Design
- écriture des cartes et scénarios
- équilibrage du jeu
- UI/UX
- Implémentations Backend :
  * routes achievements
  * une partie des routes users
- Implémentations Frontend :
    * écran Splawhcreen
    * écran Introduction (cinématique animée)
    * écran Crédit
    * écran Game avec toute la logique du gameplay
    * composant Card et Achievement
    * animations et détection des gestes
