import { createSlice } from '@reduxjs/toolkit';

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    inGame: false,
  },
  reducers: {
    startGame: (state) => {
      state.inGame = true;
    },
    endGame: (state) => {
      state.inGame = false;
    },
  },
});

export const { startGame, endGame } = gameSlice.actions;
export default gameSlice.reducer;
