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
  selectComplexity,
  selectName,
} from 'src/store/gameSessionSlice/gameSession.slice';
import {
  fetchToken,
  selectToken,
  selectTokenStatus,
  tokenActions,
} from 'src/store/tokenSlice/token.slice';
import {
  gameLoopActions,
  selectCaveWallsData,
  selectIsDroneCrashed,
  selectIsFinished,
  selectLoopTime,
  selectScore,
} from 'src/store/gameLoopSlice/gameLoop.slice';

import Modal from './common/modal';
import Loader from './common/loader';
import Button from './common/button';
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

const StartModelContent = styled.div`
  background-color: #646464;
  padding: 26px;
  border-radius: 6px;
`;

const EndModelContent = styled(StartModelContent)`
  color: #f3f3f3;
`;

const Game = () => {
  const dispatch = useAppDispatch();

  const playerName = useAppSelector(selectName);
  const gameComplexity = useAppSelector(selectComplexity);
  const playerId = useAppSelector(selectPlayerId);
  const token = useAppSelector(selectToken);

  const playerIdStatus = useAppSelector(selectPlayerIdStatus);
  const tokenStatus = useAppSelector(selectTokenStatus);

  const caveWallsData = useAppSelector(selectCaveWallsData);
  const isFinished = useAppSelector(selectIsFinished);
  const isDroneCrashed = useAppSelector(selectIsDroneCrashed);
  const loopTime = useAppSelector(selectLoopTime);
  const score = useAppSelector(selectScore);

  const [caveWebSocket, setCaveWebSocket] = useState<CaveWebSocket | null>(
    null,
  );

  const [isGameDataLoading, setIsGameDataLoading] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(true);

  useEffect(() => {
    if (!isGameDataLoading || !caveWallsData.length) return;

    const isDataLoaded = [playerIdStatus, tokenStatus].every((status) => {
      return status !== 'not loaded' && status !== 'loading';
    });

    if (isDataLoaded) {
      setIsGameDataLoading(false);
    }
  }, [isGameDataLoading, playerIdStatus, tokenStatus, caveWallsData]);

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
      {/* TODO: move to separated component */}
      <Modal isOpen={isDroneCrashed || isFinished}>
        <EndModelContent>
          <h3>
            {isFinished
              ? 'Congratulations!'
              : 'The drone has been destroyed...'}
          </h3>
          <p>name: {playerName}</p>
          <p>difficulty: {gameComplexity}</p>
          <p>score: {score}</p>
          <p>
            time:{' '}
            {`${Math.floor(loopTime / 60000)}:${Math.floor(
              (loopTime % 60000) / 1000,
            )}`}
          </p>

          <Button onClick={handlePlayAgainBtnClick}>Play again</Button>
        </EndModelContent>
      </Modal>
    </StyledGame>
  );
};

export default Game;
