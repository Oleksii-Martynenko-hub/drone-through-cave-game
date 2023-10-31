import { GAME_FIELD_MIN_WIDTH } from 'src/constants';

type Props = {
  lastVisibleWall: [number, number];
  finishLineOffsetY: number;
  calcHeight: number;
};

const FinishLine = ({
  lastVisibleWall,
  finishLineOffsetY,
  calcHeight,
}: Props) => {
  return (
    <line
      x1={GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[0] - 2}
      x2={GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[1] + 2}
      y1={calcHeight - 1 - finishLineOffsetY}
      y2={calcHeight - 1 - finishLineOffsetY}
      stroke="#4fccff"
      strokeWidth="2"
    />
  );
};

export default FinishLine;
