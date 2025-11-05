export const tutoCards = [
{
  "key": "Tuto-1",
  "pool": "tuto",
  "text": "Swipe la carte à droite ou à gauche pour faire ton choix.",
  "cooldown": 500,
  "incrementsDay": false,
  "image": "swipe",
  "right": {
    "text": "Continuer le tuto",
    "effect": {
      "hunger": 0,
      "security": 0,
      "health": 0,
      "moral": 0,
      "food": 0
    },
    "consequence": null,
    "trigger": null,
    "endTrigger": null,
    "nextCard": null,
    "nextPool": null,
    "triggerAchievement": null
  },
  "left": {
    "text": "Passer le tuto",
    "effect": {
      "hunger": 0,
      "security": 0,
      "health": 0,
      "moral": 0,
      "food": 0
    },
    "consequence": null,
    "trigger": null,
    "endTrigger": "tuto",
    "nextCard": null,
    "nextPool": null,
    "triggerAchievement": null
  },
  "conditions": {
    "requiredScenario": [],
    "forbiddenScenario": [],
    "minDays": -1,
    "maxDays": -1
  }
},
{
  "key": "Tuto-2",
  "pool": "tuto",
  "text": "Tu as cinq jauges : faim, sécurité, santé, moral et nourriture. Chaque choix peut avoir un impact positif ou négatif.",
  "cooldown": 500,
  "incrementsDay": false,
  "image": "box",
  "right": {
    "text": "Les jauges de faim et de moral vont être impactées",
    "effect": {
      "hunger": -10,
      "security": 0,
      "health": 0,
      "moral": -20,
      "food": 0
    },
    "consequence": null,
    "trigger": null,
    "endTrigger": null,
    "nextCard": null,
    "nextPool": null,
    "triggerAchievement": null
  },
  "left": {
    "text": "Les jauges de sécurité et de santé vont être impactées",
    "effect": {
      "hunger": 0,
      "security": -30,
      "health": -10,
      "moral": 0,
      "food": 0
    },
    "consequence": null,
    "trigger": null,
    "endTrigger": null,
    "nextCard": null,
    "nextPool": null,
    "triggerAchievement": null
  },
  "conditions": {
    "requiredScenario": [],
    "forbiddenScenario": [],
    "minDays": -1,
    "maxDays": -1
  }
},
{
  "key": "Tuto-3",
  "pool": "tuto",
  "text": "La jauge de nourriture descend chaque jour. Si elle tombe à 0, c’est la jauge de faim qui commencera à descendre.",
  "cooldown": 500,
  "incrementsDay": true,
  "image": "cans",
  "right": {
    "text": "La survie n'attend que moi !",
    "effect": {
      "hunger": 0,
      "security": 0,
      "health": 0,
      "moral": 0,
      "food": 0
    },
    "consequence": null,
    "trigger": null,
    "endTrigger": null,
    "nextCard": null,
    "nextPool": null,
    "triggerAchievement": null
  },
  "left": {
    "text": "C'est partie pour la survie !",
    "effect": {
      "hunger": 0,
      "security": 0,
      "health": 0,
      "moral": 0,
      "food": 0
    },
    "consequence": null,
    "trigger": null,
    "endTrigger": null,
    "nextCard": null,
    "nextPool": null,
    "triggerAchievement": null
  },
  "conditions": {
    "requiredScenario": [],
    "forbiddenScenario": [],
    "minDays": -1,
    "maxDays": -1
  }
}
]