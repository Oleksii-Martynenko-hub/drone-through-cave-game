import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/store/store';

export const GAME_SESSION_REDUCER_KEY = 'gameSessionReducer';

export type GameSessionType = {
  name: string | null;
  complexity: number | null;
};

export interface GameSessionState {
  session: GameSessionType;
}

export const initialGameSessionState: GameSessionState = {
  session: {
    name: null,
    complexity: null,
  },
};

export const gameSessionSlice = createSlice({
  name: GAME_SESSION_REDUCER_KEY,
  initialState: initialGameSessionState,
  reducers: {
    setSession: (state, action: PayloadAction<GameSessionType>) => {
      state.session = { ...action.payload };
    },
    clear: () => initialGameSessionState,
  },
});

export const gameSessionReducer = gameSessionSlice.reducer;

export const gameSessionActions = gameSessionSlice.actions;

export const getGameSessionState = (rootState: RootState): GameSessionState =>
  rootState[GAME_SESSION_REDUCER_KEY];

export const selectName = createSelector(
  getGameSessionState,
  ({ session }) => session.name
);

export const selectComplexity = createSelector(
  getGameSessionState,
  ({ session }) => session.complexity
);
