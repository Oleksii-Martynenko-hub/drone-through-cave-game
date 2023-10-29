import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { playerIdReducer } from 'src/store/playerId/playerId.slice';
import { gameSessionReducer } from 'src/store/gameSession/gameSession.slice';

export const store = configureStore({
  reducer: { playerIdReducer, gameSessionReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
