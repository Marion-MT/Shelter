export const cards = [
  {
    "_id": "1",
    "key": "CS-1",
    "pool": "general",
    "text": "Des champignons poussent autour du refuge… Ils pourraient nourrir le groupe. Mais peut-être vaudrait-il mieux renforcer les murs en cas d'attaque.",
    "cooldown": 15,
    "incrementsDay": true,
    "right": {
      "text": "Cueillir les champignons",
      "effect": {
        "hunger": 0,
        "security": 0,
        "health": 0,
        "moral": 0,
        "food": 20
      },
      "consequence": null,
      "trigger": null,
      "endTrigger": null,
      "nextCard": null,
      "nextPool": null,
      "triggerAchievement": null
    },
    "left": {
      "text": "Renforcer le refuge",
      "effect": {
        "hunger": 0,
        "security": 20,
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
      "maxDays": -1,
      "gauges": {
        "hunger": {
          "min": 0,
          "max": 100
        },
        "moral": {
          "min": 0,
          "max": 100
        },
        "security": {
          "min": 0,
          "max": 100
        },
        "health": {
          "min": 0,
          "max": 100
        },
        "food": {
          "min": 0,
          "max": 100
        }
      }
    }
  },
  {
    "_id": "2",
    "key": "CS-2",
    "pool": "general",
    "text": "Un groupe agressif rôde près du refuge et nous défie de sortir.",
    "cooldown": 15,
    "incrementsDay": true,
    "right": {
      "text": "Ignorer, ils finiront par se lasser",
      "effect": {
        "hunger": 0,
        "security": -10,
        "health": 10,
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
      "text": "Sortir les affronter",
      "effect": {
        "hunger": 0,
        "security": 20,
        "health": -20,
        "moral": 0,
        "food": 0
      },
      "consequence": "Nous ne nous en sommes pas sortis indemnes, mais ça dissuadera les autres de s’en prendre à nous.",
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
      "maxDays": -1,
      "gauges": {
        "hunger": {
          "min": 0,
          "max": 100
        },
        "moral": {
          "min": 0,
          "max": 100
        },
        "security": {
          "min": 0,
          "max": 100
        },
        "health": {
          "min": 0,
          "max": 100
        },
        "food": {
          "min": 0,
          "max": 100
        }
      }
    }
  },
  {
    "_id": "3",
    "key": "CS-3",
    "pool": "general",
    "text": "La cabane prend l’eau et menace nos ressources. Rester sans agir pourrait nous rendre malades.",
    "cooldown": 15,
    "incrementsDay": true,
    "right": {
      "text": "Réparer le refuge",
      "effect": {
        "hunger": 0,
        "security": 10,
        "health": -10,
        "moral": -10,
        "food": 0
      },
      "consequence": null
    },
    "left": {
      "text": "Se reposer malgré tout",
      "effect": {
        "hunger": 0,
        "security": -20,
        "health": 10,
        "moral": 10,
        "food": 0
      },
      "consequence": null
    },
    "conditions": {
      "requiredScenario": [],
      "forbiddenScenario": [],
      "minDays": -1,
      "maxDays": -1,
      "gauges": {
        "hunger": {
          "min": 0,
          "max": 100
        },
        "moral": {
          "min": 0,
          "max": 100
        },
        "security": {
          "min": 0,
          "max": 100
        },
        "health": {
          "min": 0,
          "max": 100
        },
        "food": {
          "min": 0,
          "max": 100
        }
      }
    }
  }
]