import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { WithoutNull } from 'src/types/common';

import { postNewPlayer } from 'src/api/main-api';

import { RootState } from 'src/store/store';
import { GameSessionType } from '../gameSessionSlice/gameSession.slice';

export const PLAYER_ID_REDUCER_KEY = 'playerIdReducer';

export interface PlayerIdState {
  playerId: string | null;
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string | null;
}

export const fetchPlayerId = createAsyncThunk<
  string,
  WithoutNull<GameSessionType>
>(
  `${PLAYER_ID_REDUCER_KEY}/fetchPlayerId`,
  async (session, { rejectWithValue }) => {
    try {
      const playerId = await postNewPlayer(session);

      return playerId;
    } catch (error) {
      console.log('postNewPlayer error: ', error);

      const err = error as { message: string };

      if (typeof err?.message === 'string') {
        throw Error(err.message as string);
      }

      throw Error('Error: Something went wrong when fetching player id.');
    }
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
    clear: () => initialPlayerIdState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayerId.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchPlayerId.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.playerId = action.payload;
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchPlayerId.rejected, (state, action) => {
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
