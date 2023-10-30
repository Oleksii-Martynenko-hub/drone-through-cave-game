import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'src/store/store';
import { Point } from 'src/types/common';

export const GAME_LOOP_REDUCER_KEY = 'gameLoopReducer';

export interface GameLoopState {
  caveWallsData: [number, number][];
  dronePosition: Point;
  droneSpeed: Point;
  isDroneCrashed: boolean;
  isFinished: boolean;
}

export const initialGameLoopState: GameLoopState = {
  caveWallsData: [],
  dronePosition: { x: 0, y: 0 },
  droneSpeed: { x: 0, y: 0 },
  isDroneCrashed: false,
  isFinished: false,
};

export const gameLoopSlice = createSlice({
  name: GAME_LOOP_REDUCER_KEY,
  initialState: initialGameLoopState,
  reducers: {
    setCaveWallsData: (state, action: PayloadAction<[number, number][]>) => {
      state.caveWallsData = action.payload;
    },
    setDronePosition: (state, action: PayloadAction<Point>) => {
      state.dronePosition = action.payload;
    },
    setDroneSpeed: (state, action: PayloadAction<Point>) => {
      state.droneSpeed = action.payload;
    },
    setIsDroneCrashed: (state, action: PayloadAction<boolean>) => {
      state.isDroneCrashed = action.payload;
    },
    setIsFinished: (state, action: PayloadAction<boolean>) => {
      state.isFinished = action.payload;
    },
    clear: () => initialGameLoopState,
  },
});

export const gameLoopReducer = gameLoopSlice.reducer;

export const gameLoopActions = gameLoopSlice.actions;

export const getGameLoopState = (rootState: RootState): GameLoopState =>
  rootState[GAME_LOOP_REDUCER_KEY];

export const selectCaveWallsData = createSelector(
  getGameLoopState,
  ({ caveWallsData }) => caveWallsData
);

export const selectDronePosition = createSelector(
  getGameLoopState,
  ({ dronePosition }) => dronePosition
);

export const selectDroneSpeed = createSelector(
  getGameLoopState,
  ({ droneSpeed }) => droneSpeed
);

export const selectIsDroneCrashed = createSelector(
  getGameLoopState,
  ({ isDroneCrashed }) => isDroneCrashed
);

export const selectIsFinished = createSelector(
  getGameLoopState,
  ({ isFinished }) => isFinished
);
