import styled from 'styled-components';

import { formatTime } from 'src/services/formatTime';

import { useAppSelector } from 'src/store/store';
import {
  selectComplexity,
  selectName,
} from 'src/store/gameSessionSlice/gameSession.slice';
import {
  selectDistance,
  selectIsDroneCrashed,
  selectIsFinished,
  selectLoopTime,
  selectMaxDistance,
  selectScore,
} from 'src/store/gameLoopSlice/gameLoop.slice';

import Modal from './common/modal';
import Button from './common/button';

const EndModelContent = styled.div`
  background-color: #646464;
  padding: 26px;
  border-radius: 6px;
  color: #f3f3f3;
`;

interface Props {
  onPlayAgainClick: () => void;
}

const EndModal = ({ onPlayAgainClick }: Props) => {
  const name = useAppSelector(selectName);
  const complexity = useAppSelector(selectComplexity);
  const score = useAppSelector(selectScore);
  const loopTime = useAppSelector(selectLoopTime);
  const maxDistance = useAppSelector(selectMaxDistance);
  const distance = useAppSelector(selectDistance);

  const isFinished = useAppSelector(selectIsFinished);
  const isDroneCrashed = useAppSelector(selectIsDroneCrashed);

  return (
    <Modal isOpen={isDroneCrashed || isFinished}>
      <EndModelContent>
        <h3>
          {isFinished ? 'Congratulations!' : 'The drone has been destroyed...'}
        </h3>
        <p>name: {name}</p>
        <p>difficulty: {complexity}</p>
        <p>score: {score}</p>
        <p>
          progress: {distance.toFixed(2)}m{' '}
          {!!maxDistance && `/ ${maxDistance.toFixed(2)}m`}
        </p>
        <p>time: {`${formatTime(loopTime)}`}</p>

        <Button onClick={onPlayAgainClick} autoFocus>
          Play again
        </Button>
      </EndModelContent>
    </Modal>
  );
};

export default EndModal;
