import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserState= {
    value: {
        email: string | null;
        token: string | null;
        stateOfGauges: {
            hunger: number;
            security: number;
            health: number;
            moral: number;
            food: number;
        } | null;
        numberDays: number | null;
        bestScore: number | null;
    }
}

const initialState: UserState = {
    value : {email: null, token: null, stateOfGauges: null, numberDays: null, bestScore: null}
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signin:(state, action: PayloadAction<{token:string; email: string}>) => {
            state.value.token = action.payload.token;
            state.value.email = action.payload.email
        },
        userValueGame:(state, action: PayloadAction<{stateOfGauges: {hunger: number; security: number; health: number; moral: number; food: number}; numberDays: number; bestScore: number}>) => {
            state.value.stateOfGauges = action.payload.stateOfGauges;
            state.value.numberDays = action.payload.numberDays;
            state.value.bestScore = action.payload.bestScore;
        }
    }
})

export const { signin, userValueGame } = userSlice.actions;
export default userSlice.reducer;