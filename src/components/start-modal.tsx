import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { GameSession, WithoutNull } from 'src/types/common';

import { SCORE_BOARD_LOCAL_STORAGE_KEY } from 'src/constants';

import { useAppDispatch, useAppSelector } from 'src/store/store';
import {
  fetchPlayerId,
  selectPlayerId,
} from 'src/store/playerIdSlice/playerId.slice';
import {
  GameSessionType,
  gameSessionActions,
  selectComplexity,
  selectName,
} from 'src/store/gameSessionSlice/gameSession.slice';
import {
  selectIsFinished,
  selectScore,
} from 'src/store/gameLoopSlice/gameLoop.slice';

import { useLocalStorage } from './common/hooks/useLocalStorage';

import Modal from './common/modal';
import Scoreboard from './scoreboard';
import NewSessionForm from './new-session-form';

const StartModelContent = styled.div`
  background-color: #646464;
  padding: 26px;
  border-radius: 6px;
  min-height: 480px;
`;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

const StartModal = ({ isOpen, handleClose }: Props) => {
  const dispatch = useAppDispatch();

  const id = useAppSelector(selectPlayerId);
  const name = useAppSelector(selectName);
  const complexity = useAppSelector(selectComplexity);
  const score = useAppSelector(selectScore);

  const isFinished = useAppSelector(selectIsFinished);

  const [scoreBoardData, setScoreBoardData] = useLocalStorage<GameSession[]>(
    SCORE_BOARD_LOCAL_STORAGE_KEY,
    [],
  );

  const [acceleration, setAcceleration] =
    useState<DeviceMotionEventAcceleration>({ x: 0, y: 0, z: 0 });

  const [orientation, setOrientation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    window.addEventListener('devicemotion', (event) => {
      setAcceleration({
        z: event.accelerationIncludingGravity?.z ?? 0,
        x: event.accelerationIncludingGravity?.x ?? 0,
        y: event.accelerationIncludingGravity?.y ?? 0,
      });
    });
    window.addEventListener(
      'deviceorientation',
      (event) => {
        setOrientation({
          z: event.alpha ?? 0,
          x: event.beta ?? 0,
          y: event.gamma ?? 0,
        });
      },
      true,
    );
  }, []);

  useEffect(() => {
    if (!isFinished) return;

    if (id && name && complexity !== null) {
      const newSession = { id, name, difficulty: complexity, score };
      setScoreBoardData((prev) => [...prev, newSession]);
    }
  }, [isFinished]);

  const onSubmitNewSessionData = (session: WithoutNull<GameSessionType>) => {
    dispatch(gameSessionActions.setSession(session));
    dispatch(fetchPlayerId(session));

    handleClose();
  };

  return (
    <Modal isOpen={isOpen}>
      <div style={{ color: '#fff' }}>
        <h3>orientation</h3>
        <span>
          x: {orientation.x}, y: {orientation.y}, z: {orientation.z}
        </span>

        <h3>acceleration</h3>
        <span>
          x: {acceleration.x}, y: {acceleration.y}, z: {acceleration.z}
        </span>
      </div>
      <StartModelContent>
        <NewSessionForm
          initData={{ name, complexity }}
          onSubmit={onSubmitNewSessionData}
        />

        {Boolean(scoreBoardData.length) && (
          <Scoreboard scoreboardData={scoreBoardData} />
        )}
      </StartModelContent>
    </Modal>
  );
};

export default StartModal;
