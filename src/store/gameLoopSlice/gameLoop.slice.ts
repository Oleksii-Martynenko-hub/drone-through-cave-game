import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  DRONE_MAX_H_SPEED,
  DRONE_MAX_V_SPEED,
  DRONE_MIN_H_SPEED,
  DRONE_MIN_V_SPEED,
} from 'src/constants';

import { RootState } from 'src/store/store';
import { Point } from 'src/types/common';
import { maxMin } from 'src/utils/max-min';

export const GAME_LOOP_REDUCER_KEY = 'gameLoopReducer';

export interface GameLoopState {
  caveWallsData: [number, number][];
  loopTime: number;
  dronePosition: Point;
  droneSpeed: Point;
  isDroneCrashed: boolean;
  isFinished: boolean;
  score: number;
}

export const initialGameLoopState: GameLoopState = {
  caveWallsData: [],
  loopTime: 0,
  dronePosition: { x: 0, y: 0 },
  droneSpeed: { x: 0, y: 0 },
  isDroneCrashed: false,
  isFinished: false,
  score: 0,
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
      const { x: prevX, y: prevY } = state.droneSpeed;
      const { x: addX, y: addY } = action.payload;

      if (addX !== undefined) {
        const newSpeedX = maxMin(
          prevX + addX,
          DRONE_MAX_H_SPEED,
          DRONE_MIN_H_SPEED,
        );

        state.droneSpeed = { x: newSpeedX, y: prevY };
      }

      if (addY !== undefined) {
        const newSpeedY = maxMin(
          prevY + addY,
          DRONE_MAX_V_SPEED,
          DRONE_MIN_V_SPEED,
        );

        state.droneSpeed = { y: newSpeedY, x: prevX };
      }
    },
    setScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
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

export const selectScore = createSelector(
  getGameLoopState,
  ({ score }) => score,
);
