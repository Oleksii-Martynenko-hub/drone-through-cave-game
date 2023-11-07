import { GAME_FIELD_MIN_WIDTH, WALL_HEIGHT } from 'src/constants';

type Props = {
  lastVisibleWall: [number, number];
  dronePositionY: number;
  caveWallsDataLength: number;
  windowHeight: number;
};

const FinishLine = ({
  lastVisibleWall,
  dronePositionY,
  caveWallsDataLength,
  windowHeight,
}: Props) => {
  const wallsHeight = (caveWallsDataLength - 1) * WALL_HEIGHT;

  const isLastWallDrawn =
      windowHeight / WALL_HEIGHT + 1 + Math.floor(dronePositionY / WALL_HEIGHT) >=
    caveWallsDataLength;

  const finishLineOffsetY = isLastWallDrawn
    ? dronePositionY + windowHeight - wallsHeight
    : 0;

  return isLastWallDrawn ? (
    <line
      x1={GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[0] - 2}
      x2={GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[1] + 2}
      y1={windowHeight - 1 - finishLineOffsetY}
      y2={windowHeight - 1 - finishLineOffsetY}
      stroke="#4fccff"
      strokeWidth="2"
    />
  ) : null;
};

export default FinishLine;
