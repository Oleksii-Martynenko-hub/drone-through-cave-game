import styled from 'styled-components';

interface Props {
  speedY: number;
  speedX: number;
  yMaxSpeed?: number;
  xMaxSpeed?: number;
}

const StyledSpeedometer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #a1db4a;
  padding: 10px;
  border: 1px solid white;
  border-radius: 6px;
`;

const Speed = styled.div`
  position: relative;
  border: 1px solid black;
  box-shadow: 0 2px 6px -2px gray;
`;

const VerticalSpeed = styled(Speed)`
  width: 50px;
  height: 100px;

  background: linear-gradient(
    to bottom,
    rgba(14, 160, 233, 0.8) 0%,
    hsl(var(--hsl-color), 95%, 35%) var(--percent),
    rgb(255, 255, 255) var(--percent)
  );
`;

const HorizontalSpeed = styled(Speed)`
  width: 100px;
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
  line-height: 100px;
  background: inherit;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: invert(1) grayscale(0) contrast(9);
`;

const Speedometer = ({
  speedX,
  speedY,
  yMaxSpeed = 100,
  xMaxSpeed = 100,
}: Props) => {
  const percentSpeedY = (speedY / yMaxSpeed) * 100;
  const percentSpeedX = ((speedX / xMaxSpeed) * 100) / 2;

  return (
    <StyledSpeedometer>
      <HorizontalSpeed
        style={
          {
            '--percent': `${percentSpeedX}%`,
            '--hsl-color': `calc(260 - ${260 / xMaxSpeed} * ${Math.abs(
              percentSpeedX * 2
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
    </StyledSpeedometer>
  );
};

export default Speedometer;
