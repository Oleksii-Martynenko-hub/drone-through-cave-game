import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  DRONE_MAX_H_SPEED,
  DRONE_MAX_V_SPEED,
  DRONE_MIN_H_SPEED,
  DRONE_MIN_V_SPEED,
} from 'src/constants';

import { RootState } from 'src/store/store';
import { Point } from 'src/types/common';
import { getObjectVelocity } from 'src/utils/get-object-velocity';
import { maxMin } from 'src/utils/max-min';

export const GAME_LOOP_REDUCER_KEY = 'gameLoopReducer';

export interface GameLoopState {
  caveWallsData: [number, number][];
  isEnoughWallsLoaded: boolean;
  loopTime: number;
  dronePosition: Point;
  droneSpeed: Point;
  isDroneCrashed: boolean;
  isFinished: boolean;
  score: number;
  distance: number;
  maxDistance: number;
}

export const initialGameLoopState: GameLoopState = {
  caveWallsData: [],
  isEnoughWallsLoaded: false,
  loopTime: 0,
  dronePosition: { x: 0, y: 0 },
  droneSpeed: { x: 0, y: 0 },
  isDroneCrashed: false,
  isFinished: false,
  score: 0,
  distance: 0,
  maxDistance: 0,
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
    setDronePosition: (state, action: PayloadAction<{ delta: number }>) => {
      const { x, y } = state.droneSpeed;
      const velocity = getObjectVelocity(x, y);
      const limitVelocityMultiplier = velocity > 100 ? velocity / 100 : 1;

      if (x || y) {
        const newPositionY = (y * action.payload.delta) / 1000;
        const newPositionX = (x * action.payload.delta) / 1000;

        state.dronePosition.x += newPositionX / limitVelocityMultiplier;
        state.dronePosition.y += newPositionY / limitVelocityMultiplier;
      }
    },
    setDroneSpeed: (state, action: PayloadAction<Partial<Point>>) => {
      const { x: prevX, y: prevY } = state.droneSpeed;
      const addX = action.payload.x ?? 0;
      const addY = action.payload.y ?? 0;

      const newSpeedX = maxMin(
        addX + prevX,
        DRONE_MAX_H_SPEED,
        DRONE_MIN_H_SPEED,
      );

      const newSpeedY = maxMin(
        addY + prevY,
        DRONE_MAX_V_SPEED,
        DRONE_MIN_V_SPEED,
      );

      state.droneSpeed = { y: newSpeedY, x: newSpeedX };
    },
    setScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    },
    setDistance: (state, action: PayloadAction<number>) => {
      state.distance = action.payload;
    },
    setMaxDistance: (state, action: PayloadAction<number>) => {
      state.maxDistance = action.payload;
    },
    setIsDroneCrashed: (state, action: PayloadAction<boolean>) => {
      state.isDroneCrashed = action.payload;
    },
    setIsFinished: (state, action: PayloadAction<boolean>) => {
      state.isFinished = action.payload;
    },
    setIsEnoughWallsLoaded: (state, action: PayloadAction<boolean>) => {
      state.isEnoughWallsLoaded = action.payload;
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

export const selectIsEnoughWallsLoaded = createSelector(
  getGameLoopState,
  ({ isEnoughWallsLoaded }) => isEnoughWallsLoaded,
);

export const selectScore = createSelector(
  getGameLoopState,
  ({ score }) => score,
);

export const selectDistance = createSelector(
  getGameLoopState,
  ({ distance }) => distance,
);

export const selectMaxDistance = createSelector(
  getGameLoopState,
  ({ maxDistance }) => maxDistance,
);
