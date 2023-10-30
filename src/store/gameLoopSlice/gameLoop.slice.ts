import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  DRONE_MAX_H_SPEED,
  DRONE_MAX_V_SPEED,
  DRONE_MIN_H_SPEED,
  DRONE_MIN_V_SPEED,
} from 'src/constants';

import { RootState } from 'src/store/store';
import { Point } from 'src/types/common';

export const GAME_LOOP_REDUCER_KEY = 'gameLoopReducer';

export interface GameLoopState {
  caveWallsData: [number, number][];
  loopTime: number;
  dronePosition: Point;
  droneSpeed: Point;
  isDroneCrashed: boolean;
  isFinished: boolean;
}

export const initialGameLoopState: GameLoopState = {
  caveWallsData: [],
  loopTime: 0,
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
    setLoopTime: (state, action: PayloadAction<number>) => {
      state.loopTime += action.payload;
    },
    setDronePosition: (state, action: PayloadAction<number>) => {
      const { x, y } = state.droneSpeed;

      if (x || y) {
        const newPositionY =
          state.dronePosition.y + (y * action.payload) / 1000;
        const newPositionX =
          state.dronePosition.x + (x * action.payload) / 1000;

        state.dronePosition = { x: newPositionX, y: newPositionY };
      }
    },
    setDroneSpeed: (state, action: PayloadAction<Partial<Point>>) => {
      let newSpeedY = state.droneSpeed.y;
      let newSpeedX = state.droneSpeed.x;

      const { x, y } = action.payload;

      if (x !== undefined) {
        newSpeedX += x;
        if (newSpeedX >= DRONE_MAX_H_SPEED) newSpeedX = DRONE_MAX_H_SPEED;
        if (newSpeedX <= DRONE_MIN_H_SPEED) newSpeedX = DRONE_MIN_H_SPEED;
      }
      if (y !== undefined) {
        newSpeedY += y;
        if (newSpeedY >= DRONE_MAX_V_SPEED) newSpeedY = DRONE_MAX_V_SPEED;
        if (newSpeedY <= DRONE_MIN_V_SPEED) newSpeedY = DRONE_MIN_V_SPEED;
      }
      state.droneSpeed = { x: newSpeedX, y: newSpeedY };
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
  ({ caveWallsData }) => caveWallsData,
);

export const selectLoopTime = createSelector(
  getGameLoopState,
  ({ loopTime }) => loopTime,
);

export const selectDronePosition = createSelector(
  getGameLoopState,
  ({ dronePosition }) => dronePosition,
);

export const selectDroneSpeed = createSelector(
  getGameLoopState,
  ({ droneSpeed }) => droneSpeed,
);

export const selectIsDroneCrashed = createSelector(
  getGameLoopState,
  ({ isDroneCrashed }) => isDroneCrashed,
);

export const selectIsFinished = createSelector(
  getGameLoopState,
  ({ isFinished }) => isFinished,
);
