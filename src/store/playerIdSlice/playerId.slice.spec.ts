import { WithoutNull } from 'src/types/common';
import { GameSessionType } from '../gameSessionSlice/gameSession.slice';
import {
  fetchPlayerId,
  initialPlayerIdState,
  playerIdReducer,
} from './playerId.slice';

const session: WithoutNull<GameSessionType> = {
  name: 'PlayerOne',
  complexity: 1,
};

describe('userData reducer', () => {
  it('should handle initial state', () => {
    expect(playerIdReducer(undefined, { type: '' })).toEqual(
      initialPlayerIdState
    );
  });

  it('should handle fetchUserData', () => {
    let state = playerIdReducer(undefined, fetchPlayerId.pending('', session));

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        playerId: null,
      })
    );

    state = playerIdReducer(
      state,
      fetchPlayerId.fulfilled('id123', '', session)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        playerId: 'id123',
      })
    );

    state = playerIdReducer(
      state,
      fetchPlayerId.rejected(new Error('Uh oh'), '', session)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        playerId: 'id123',
      })
    );
  });
});
