import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { playerIdReducer } from 'src/store/playerIdSlice/playerId.slice';
import { gameSessionReducer } from 'src/store/gameSessionSlice/gameSession.slice';
import { tokenReducer } from 'src/store/tokenSlice/token.slice';
import { gameLoopReducer } from 'src/store/gameLoopSlice/gameLoop.slice';

export const store = configureStore({
  reducer: {
    playerIdReducer,
    gameSessionReducer,
    tokenReducer,
    gameLoopReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
