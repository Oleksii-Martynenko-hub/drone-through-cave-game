import { GAME_FIELD_MIN_WIDTH, WALL_HEIGHT } from 'src/constants';

import Hangar from './hangar';

type Props = {
  dronePositionY: number;
  caveWallsData: [number, number][];
  windowHeight: number;
};

const FinishLine = ({ dronePositionY, caveWallsData, windowHeight }: Props) => {
  const generalWallsHeight = (caveWallsData.length - 1) * WALL_HEIGHT;
  const passedWallsAmount = Math.floor(dronePositionY / WALL_HEIGHT);
  const windowHeightWallsAmount = Math.ceil(windowHeight / WALL_HEIGHT);

  const lastWall = caveWallsData.at(-1) || [0, 0];

  const finishLineOffsetY = dronePositionY + windowHeight - generalWallsHeight;

  const windowCenter = GAME_FIELD_MIN_WIDTH / 2;
  const lineY = windowHeight - 1 - finishLineOffsetY;

  const point1 = {
    x: windowCenter + lastWall[0],
    y: lineY,
  };

  const point2 = {
    x: windowCenter + lastWall[1],
    y: lineY,
  };

  const isDrawFinishLine =
    windowHeightWallsAmount + passedWallsAmount >= caveWallsData.length;

  const lastSegmentWidth = point2.x - point1.x + 2;

  return isDrawFinishLine ? (
    <>
      <path
        fill="#646464"
        d={`M ${point1.x - 1},${lineY}
           Q ${point1.x - 1},${lineY + lastSegmentWidth}
            ${point1.x + lastSegmentWidth / 2 - 1},${lineY + lastSegmentWidth}
           Q ${point1.x + lastSegmentWidth - 1},${lineY + lastSegmentWidth}
           ${point1.x + lastSegmentWidth - 1},${lineY}
           l 0 ${finishLineOffsetY} l ${-lastSegmentWidth - 1} 0 z`}
      />

      <text
        x={point1.x + lastSegmentWidth / 2 - 43}
        y={lineY + 40}
        fontSize={24}
        fontWeight={600}
        stroke="black"
        fill="#32c800"
      >
        FINISH
      </text>

      <Hangar x={point1.x + lastSegmentWidth / 2 - 0} y={lineY + 55} />

      <line
        x1={point1.x - 2}
        y1={point1.y}
        x2={point2.x + 2}
        y2={point2.y}
        stroke="#4fccff"
        strokeWidth="2"
      />
    </>
  ) : null;
};

export default FinishLine;
