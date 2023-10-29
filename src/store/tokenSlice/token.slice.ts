import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { getTokenByPlayerIdAndChunk } from 'src/api/main-api';

import { RootState } from 'src/store/store';

export const TOKEN_REDUCER_KEY = 'tokenReducer';

export interface TokenState {
  token: string | null;
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string | null;
}

export const initialTokenState: TokenState = {
  token: null,
  loadingStatus: 'not loaded',
  error: null,
};

export const fetchToken = createAsyncThunk<string, string>(
  `${TOKEN_REDUCER_KEY}/fetchToken`,
  async (playerId, { rejectWithValue }) => {
    try {
      const chunksNumbers = [1, 2, 3, 4];
      const tokenPromises = chunksNumbers.map(async (chunk) => {
        return getTokenByPlayerIdAndChunk(playerId, chunk);
      });

      const response = await Promise.all(tokenPromises);

      const completedToken = response
        .sort((a, b) => a.no - b.no)
        .map((i) => i.chunk)
        .join('');

      return completedToken;
    } catch (error) {
      console.log('getTokenByPlayerId error: ', error);

      const err = error as { message: string };

      if (typeof err?.message === 'string') {
        return rejectWithValue(err.message);
      }

      return rejectWithValue(
        'Error: Something went wrong when fetching token.'
      );
    }
  }
);

export const tokenSlice = createSlice({
  name: TOKEN_REDUCER_KEY,
  initialState: initialTokenState,
  reducers: {
    clear: () => initialTokenState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchToken.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchToken.fulfilled, (state, action: PayloadAction<string>) => {
        state.token = action.payload;
        state.loadingStatus = 'loaded';
      })
      .addCase(fetchToken.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

export const tokenReducer = tokenSlice.reducer;

export const tokenActions = tokenSlice.actions;

export const getTokenState = (rootState: RootState): TokenState =>
  rootState[TOKEN_REDUCER_KEY];

export const selectToken = createSelector(getTokenState, ({ token }) => token);
