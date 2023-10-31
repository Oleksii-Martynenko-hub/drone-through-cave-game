import styled from 'styled-components';

interface Props {
  score: number;
  progress: number | null;
  speedY: number;
  speedX: number;
  yMaxSpeed?: number;
  xMaxSpeed?: number;
}

const StyledGauges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  opacity: 0.8;
  margin: 100px -120px 0 0;
`;

const Speed = styled.div`
  position: relative;
  border: 1px solid black;
  box-shadow: 0 2px 6px -2px gray;
`;

const VerticalSpeed = styled(Speed)`
  width: 50px;
  height: 120px;

  background: linear-gradient(
    to bottom,
    rgba(14, 160, 233, 0.8) 0%,
    hsl(var(--hsl-color), 95%, 35%) var(--percent),
    rgb(255, 255, 255) var(--percent)
  );
`;

const HorizontalSpeed = styled(Speed)`
  width: 180px;
  height: 50px;
  margin-bottom: 10px;
  background: linear-gradient(
      to right,
      transparent 0%,
      transparent calc(50% - 1px),
      #e75858 calc(50% - 1px),
      #e75858 calc(50% + 1px),
      transparent calc(50% + 1px)
    ),
    linear-gradient(
      to right,
      rgb(255, 255, 255) 0%,
      rgb(255, 255, 255) min(calc(var(--percent) + 50%), 50%),
      rgb(53, 150, 255) min(calc(var(--percent) + 50%), 50%),
      rgb(58, 150, 255) 50%,
      rgb(53, 150, 255) max(calc(var(--percent) + 50%), 50%),
      rgb(255, 255, 255) max(calc(var(--percent) + 50%), 50%)
    );
`;

const SpeedText = styled.span`
  display: block;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 26px;
  line-height: 50px;
  font-weight: 500;
  letter-spacing: -1px;
  text-align: center;
`;

const SpeedTextY = styled(SpeedText)`
  line-height: 120px;
  background: inherit;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: invert(1) grayscale(0) contrast(9);
`;

const Score = styled.span`
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 0px 3px white;
`;

const ScoreValue = styled.span`
  font-weight: 600;
`;

const Progress = styled(Score)``;

const ProgressValue = styled(ScoreValue)``;

const Gauges = ({
  score,
  progress,
  speedX,
  speedY,
  yMaxSpeed = 100,
  xMaxSpeed = 100,
}: Props) => {
  const percentSpeedY = (speedY / yMaxSpeed) * 100;
  const percentSpeedX = ((speedX / xMaxSpeed) * 100) / 2;

  return (
    <StyledGauges>
      <Score>
        score: <ScoreValue>{score}</ScoreValue>
      </Score>

      <HorizontalSpeed
        style={
          {
            '--percent': `${percentSpeedX}%`,
            '--hsl-color': `calc(260 - ${260 / xMaxSpeed} * ${Math.abs(
              percentSpeedX * 2,
            )})`,
          } as React.CSSProperties
        }
      >
        <SpeedText>{speedX}</SpeedText>
      </HorizontalSpeed>

      <VerticalSpeed
        style={
          {
            '--percent': `${percentSpeedY}%`,
            '--hsl-color': `calc(260 - ${260 / yMaxSpeed} * ${percentSpeedY})`,
          } as React.CSSProperties
        }
      >
        <SpeedTextY>{speedY}</SpeedTextY>
      </VerticalSpeed>

      {progress !== null && (
        <Progress>
          progress: <ProgressValue>{progress.toFixed(1)}%</ProgressValue>
        </Progress>
      )}
    </StyledGauges>
  );
};

export default Gauges;
