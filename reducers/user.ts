import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserState= {
    value: {
        email: string | null;
        token: string | null;
    }
}

const initialState: UserState = {
    value : {email: null, token: null }
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signin:(state, action: PayloadAction<{token:string; email: string}>) => {
            state.value.token = action.payload.token;
            state.value.email = action.payload.email
        }
    }
})

export const { signin } = userSlice.actions;
export default userSlice.reducer;