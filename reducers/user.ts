import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Gauge = {
    hunger: number;
    security: number;
    health: number;
    moral: number;
    food: number;
};

export type Choice = {
  text: string;
  effect: {
    hunger: number;
    security: number;
    health: number;
    moral: number;
    food: number;
  };
  consequence?: string | null;
  trigger?: string | null;
  endTrigger?: string | null;
  nextCard?: string | null;
  nextPool?: string | null;
  triggerAchievement?: any | null;
};

export type Conditions = {
  requiredScenario: string[];
  forbiddenScenario: string[];
  minDays: number;
  maxDays: number;
  gauges: Record<string, { min: number; max: number }>;
};

export type Card = {
  _id: string;
  key: string;
  pool: string;
  text: string;
  cooldown: number;
  incrementsDay: boolean;
  right: Choice;
  left: Choice;
  conditions: Conditions;
};


export type UserState= {
    value: {
        email: string | null;
        username: string | null;
        token: string | null;
        refreshToken: string | null;
        stateOfGauges: Gauge | null;
        numberDays: number | null;
        bestScore: number | null;
        currentCard: Card | null;
        btnSoundOn: boolean;
        soundOn: boolean;
        volume: number;
    }
}

const initialState: UserState = {
    value : {email: null, username: null, token: null, refreshToken: null, stateOfGauges: null, numberDays: null, bestScore: null, currentCard: null, btnSoundOn: true, soundOn: true, volume: 50},
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signin:(state, action: PayloadAction<{token:string; refreshToken:string; username: string; email: string}>) => {
            state.value.token = action.payload.token;
            state.value.refreshToken = action.payload.refreshToken;
            state.value.email = action.payload.email;
            state.value.username = action.payload.username;
        },
        updateAccestoken:(state, action: PayloadAction<string>) => {
            state.value.token = action.payload;
        },
        setGameState:(state, action: PayloadAction<{stateOfGauges: Gauge; numberDays: number; currentCard: Card}>) => {
            state.value.stateOfGauges = action.payload.stateOfGauges;
            state.value.numberDays = action.payload.numberDays;
            state.value.currentCard = action.payload.currentCard;
        },
        setGauges:(state, action: PayloadAction<Gauge>) =>{
            state.value.stateOfGauges = action.payload
        },
        setCurrentCard:(state, action: PayloadAction<Card>) =>{
            state.value.currentCard = action.payload
        },
        setCurrentNumberDays:(state, action: PayloadAction<number>) =>{
            state.value.numberDays = action.payload
        },
        setUserData:(state, action: PayloadAction<{bestScore: number; soundOn: boolean; volume: number; btnSoundOn: boolean}>) =>{
            state.value.bestScore = action.payload.bestScore;
            state.value.soundOn = action.payload.soundOn;
            state.value.volume = action.payload.volume;
            state.value.btnSoundOn = action.payload.btnSoundOn;
               
        },
        updateBestScore: (state, action: PayloadAction<number>) =>{
            state.value.bestScore = action.payload
        },
        signout:(state) => {
            state.value = initialState.value;
            console.log("dispatch signout=>",initialState)
        },
        updateSettings: (state, action: PayloadAction<{soundOn: boolean; btnSoundOn: boolean; volume: number}>) => {
            if (action.payload.soundOn !== undefined) {
                state.value.soundOn = action.payload.soundOn;
            }
            if (action.payload.btnSoundOn !== undefined) {
                state.value.btnSoundOn = action.payload.btnSoundOn;
            }
            if (action.payload.volume !== undefined) {
                state.value.volume = action.payload.volume;
            }
        },
    }
});

export const { signin, setGameState, setGauges, setCurrentCard, setCurrentNumberDays, setUserData, signout, updateBestScore, updateSettings } = userSlice.actions;
export default userSlice.reducer;