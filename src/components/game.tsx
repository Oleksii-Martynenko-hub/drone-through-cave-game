import { useEffect, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';

import { CaveWebSocket } from 'src/api/cave-web-socket';

import { useAppDispatch, useAppSelector } from 'src/store/store';
import {
  playerIdActions,
  selectPlayerId,
  selectPlayerIdStatus,
} from 'src/store/playerIdSlice/playerId.slice';
import {
  fetchToken,
  selectToken,
  selectTokenStatus,
  tokenActions,
} from 'src/store/tokenSlice/token.slice';
import {
  gameLoopActions,
  selectIsDroneCrashed,
  selectIsEnoughWallsLoaded,
} from 'src/store/gameLoopSlice/gameLoop.slice';

import Loader from './common/loader';
import EndModal from './end-modal';
import StartModal from './start-modal';

const StyledGame = styled.div`
  display: flex;
  align-items: start;
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;

const Game = () => {
  const dispatch = useAppDispatch();

  const playerId = useAppSelector(selectPlayerId);
  const token = useAppSelector(selectToken);

  const playerIdStatus = useAppSelector(selectPlayerIdStatus);
  const tokenStatus = useAppSelector(selectTokenStatus);

  const isEnoughWallsLoaded = useAppSelector(selectIsEnoughWallsLoaded);
  const isDroneCrashed = useAppSelector(selectIsDroneCrashed);

  const [caveWebSocket, setCaveWebSocket] = useState<CaveWebSocket | null>(
    null,
  );

  const [isGameDataLoading, setIsGameDataLoading] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(true);

  useEffect(() => {
    if (!isGameDataLoading) return;

    const isDataLoaded = [playerIdStatus, tokenStatus].every((status) => {
      return status !== 'not loaded' && status !== 'loading';
    });

    if (isDataLoaded && isEnoughWallsLoaded) {
      setIsGameDataLoading(false);
    }
  }, [isGameDataLoading, playerIdStatus, tokenStatus, isEnoughWallsLoaded]);

  useLayoutEffect(() => {
    if (!caveWebSocket) {
      setCaveWebSocket(new CaveWebSocket());
    }
  }, []);

  useEffect(() => {
    if (token === null && playerId) {
      dispatch(fetchToken(playerId));
    }
  }, [playerId]);

  useEffect(() => {
    if (!playerId || !token || !caveWebSocket) return;

    caveWebSocket.connect();
    caveWebSocket.open(playerId, token);
    caveWebSocket.resetWindowHeight();

    caveWebSocket.getCaveWallsData(
      (wallPositions) => {
        dispatch(gameLoopActions.setCaveWallsData([...wallPositions]));
        dispatch(gameLoopActions.setIsEnoughWallsLoaded(true));
      },
      (additionalWallPositions) => {
        dispatch(
          gameLoopActions.setCaveWallsData([...additionalWallPositions]),
        );
      },
    );

    return () => {
      if (caveWebSocket.IsConnected) {
        caveWebSocket.Socket.close();
      }
    };
  }, [playerId, token, caveWebSocket]);

  useEffect(() => {
    if (isDroneCrashed) {
      caveWebSocket?.Socket.close();
    }
  }, [isDroneCrashed]);

  const handlePlayAgainBtnClick = () => {
    dispatch(playerIdActions.clear());
    dispatch(tokenActions.clear());
    dispatch(gameLoopActions.clear());

    caveWebSocket?.clearData();

    setIsStartModalOpen(true);
  };

  const handleCloseStartModal = () => {
    setIsGameDataLoading(true);
    setIsStartModalOpen(false);
  };

  if (isGameDataLoading)
    return (
      <LoaderWrapper>
        <Loader />
        <h3>Loading game data...</h3>
      </LoaderWrapper>
    );

  return (
    <StyledGame>
      <StartModal
        isOpen={isStartModalOpen}
        handleClose={handleCloseStartModal}
      />

      <EndModal onPlayAgainClick={handlePlayAgainBtnClick} />
    </StyledGame>
  );
};

export default Game;
