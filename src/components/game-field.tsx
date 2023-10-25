export type Point = {
  x: number;
  y: number;
};

interface Props {
  dronePosition: Point;
  caveWallsData: [number, number][];
}

const GameField = ({ dronePosition, caveWallsData }: Props) => {
  const width = 500;
  const wallsHeight = (caveWallsData.length - 1) * 10;
  const height = Math.min(980, wallsHeight);

  const slicedWalls = caveWallsData.slice(
    Math.floor(dronePosition.y / 10),
    height / 10 + 1 + Math.floor(dronePosition.y / 10)
  );

  const lastVisibleWall = slicedWalls.at(-1) || [0, 0];

  const isLastWallDrawn =
    height / 10 + 1 + Math.floor(dronePosition.y / 10) >= caveWallsData.length;

  const droneSideSize = 16;
  const droneCenterX = width / 2 + dronePosition.x;
  const droneSemiPerimeter = (droneSideSize * 3) / 2;
  const droneArea = Math.sqrt(
    droneSemiPerimeter * Math.pow(droneSemiPerimeter - droneSideSize, 3)
  );

  const offsetY = isLastWallDrawn ? dronePosition.y + 980 - wallsHeight : 0;

  return (
    <svg
      style={{ background: 'white' }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isLastWallDrawn && (
        <line
          x1={width / 2 + lastVisibleWall[0] - 2}
          x2={width / 2 + lastVisibleWall[1] + 2}
          y1={height - 1 - offsetY}
          y2={height - 1 - offsetY}
          stroke="skyblue"
          strokeWidth="2"
        />
      )}
      <polygon
        fill="#646464"
        points={`0,${height} 0,${0} ${slicedWalls
          .map(([left, _], i) => `${width / 2 + left},${i * 10}`)
          .join(' ')} ${width / 2 + lastVisibleWall[0] - 2},${height}`}
      />
      <polygon
        fill="#646464"
        points={`${width},${height} ${width},${0} ${slicedWalls
          .map(([_, right], i) => `${width / 2 + right},${i * 10}`)
          .join(' ')} ${width / 2 + lastVisibleWall[1] + 2},${height}`}
      />
      {/* TODO: temp debug element */}
      {slicedWalls.map(([_, right], i) => (
        <circle
          key={i}
          cx={width / 2 + right}
          cy={i * 10}
          r="1"
          stroke="red"
          fill="red"
          strokeWidth="2"
        />
      ))}
      {/* TODO: temp debug element */}
      {slicedWalls.map(([_, right], i) => (
        <text
          key={i}
          x={width / 2 + right + 4}
          y={i * 10 + 3}
          style={{ fontSize: '12px' }}
        >
          - {i + 1 + Math.floor(dronePosition.y / 10)}
        </text>
      ))}
      <polygon
        fill="green"
        points={`${droneCenterX - droneSideSize / 2},0 ${
          droneCenterX + droneSideSize / 2
        },0 ${droneCenterX},${(droneArea * 2) / droneSideSize}`}
      />
    </svg>
  );
};

export default GameField;
