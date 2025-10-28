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
        token: string | null;
        stateOfGauges: Gauge | null;
        numberDays: number | null;
        bestScore: number | null;
        currentCard: Card | null;
    }
}



const initialState: UserState = {
    value : {email: null, token: null, stateOfGauges: null, numberDays: null, bestScore: null, currentCard: null },
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signin:(state, action: PayloadAction<{token:string; email: string}>) => {
            state.value.token = action.payload.token;
            state.value.email = action.payload.email
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
        }
    }
})

export const { signin, setGameState, setGauges, setCurrentCard, setCurrentNumberDays } = userSlice.actions;
export default userSlice.reducer;