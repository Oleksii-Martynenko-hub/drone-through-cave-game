import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { NewSessionData } from 'src/types/common';
import { RootState } from 'src/store/store';

export const PLAYER_ID_REDUCER_KEY = 'playerIdReducer';

export interface PlayerIdState {
  playerId: string | null;
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string | null;
}

export const fetchPlayerId = createAsyncThunk<string, NewSessionData>(
  `${PLAYER_ID_REDUCER_KEY}/fetchPlayerId`,
  async (session, thunkAPI) => {
    console.log('🚀 ~ session:', session); // TODO: add api instance to thunk extra
    return 'newRandomPlayerId';
  }
);

export const initialPlayerIdState: PlayerIdState = {
  playerId: null,
  loadingStatus: 'not loaded',
  error: null,
};

export const playerIdSlice = createSlice({
  name: PLAYER_ID_REDUCER_KEY,
  initialState: initialPlayerIdState,
  reducers: {
    clearPlayerIdState: () => initialPlayerIdState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayerId.pending, (state: PlayerIdState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchPlayerId.fulfilled,
        (state: PlayerIdState, action: PayloadAction<string>) => {
          state.playerId = action.payload;
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchPlayerId.rejected, (state: PlayerIdState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

export const playerIdReducer = playerIdSlice.reducer;

export const playerIdActions = playerIdSlice.actions;

export const getPlayerIdState = (rootState: RootState): PlayerIdState =>
  rootState[PLAYER_ID_REDUCER_KEY];

export const selectPlayerId = createSelector(
  getPlayerIdState,
  ({ playerId }) => playerId
);
