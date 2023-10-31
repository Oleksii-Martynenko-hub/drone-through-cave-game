import { useEffect, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';

import { GameSession, WithoutNull } from 'src/types/common';

import { SCORE_BOARD_LOCAL_STORAGE_KEY } from 'src/constants';

import { CaveWebSocket } from 'src/api/cave-web-socket';

import { useAppDispatch, useAppSelector } from 'src/store/store';
import {
  fetchPlayerId,
  playerIdActions,
  selectPlayerId,
  selectPlayerIdStatus,
} from 'src/store/playerIdSlice/playerId.slice';
import {
  GameSessionType,
  gameSessionActions,
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

import { useLocalStorage } from './common/hooks/useLocalStorage';

import Modal from './common/modal';
import Loader from './common/loader';
import Button from './common/button';
import NewSessionForm from './common/new-session-form';
import Scoreboard from './scoreboard';

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

const Game = (props: any) => {
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

  const [isStartModalOpen, setIsStartModalOpen] = useState(true);
  const [isGameDataLoading, setIsGameDataLoading] = useState(false);
  const [scoreBoardData, setScoreBoardData] = useLocalStorage<GameSession[]>(
    SCORE_BOARD_LOCAL_STORAGE_KEY,
    [],
  );

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
    if (!isFinished) return;

    if (playerName && gameComplexity && playerId) {
      setScoreBoardData((prev) => [
        ...prev,
        {
          id: playerId,
          name: playerName,
          difficulty: gameComplexity,
          score,
        },
      ]);
    }
  }, [isFinished]);

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

  // TODO: move to form component
  const onSubmitNewSessionData = (session: WithoutNull<GameSessionType>) => {
    dispatch(gameSessionActions.setSession(session));
    dispatch(fetchPlayerId(session));

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
      {/* TODO: move to separated component */}
      <Modal isOpen={isStartModalOpen}>
        <StartModelContent>
          <NewSessionForm
            initData={{ name: playerName, complexity: gameComplexity }}
            onSubmit={onSubmitNewSessionData}
          />

          {Boolean(scoreBoardData.length) && (
            <Scoreboard scoreboardData={scoreBoardData} />
          )}
        </StartModelContent>
      </Modal>

      {/* TODO: move to separated component */}
      <Modal isOpen={isDroneCrashed || isFinished}>
        <StartModelContent>
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
        </StartModelContent>
      </Modal>
    </StyledGame>
  );
};

export default Game;
