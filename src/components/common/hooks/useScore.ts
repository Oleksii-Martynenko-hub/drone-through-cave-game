import { useEffect, useRef, useState } from 'react';
import { Point } from 'src/components/game-field';

export const useScore = (
  wallsPassed: number,
  droneVerticalSpeed: number,
  complexity: number
) => {
  const [score, setScore] = useState(0);
  const scoreMultiplier = 1;

  useEffect(() => {
    setScore(
      (prev) => prev + scoreMultiplier * (droneVerticalSpeed + complexity)
    );
  }, [wallsPassed]);

  return score;
};
export const useScoreBetter = (
  lastPassedWall: [number, number],
  droneSpeed: Point,
  complexity: number
) => {
  const [score, setScore] = useState(0);
  const scoreMultiplier = 0.1;
  const prevWall = useRef(lastPassedWall);
  const distance = useRef(0);

  function getObjectVelocity(xSpeed: number, ySpeed: number) {
    return Math.sqrt(Math.pow(xSpeed, 2) + Math.pow(ySpeed, 2));
  }

  function calculateDistance(p1: Point, p2: Point) {
    const xDistance = p2.x - p1.x;
    const yDistance = p2.y - p1.y;

    return getObjectVelocity(xDistance, yDistance);
  }

  useEffect(() => {
    if (prevWall.current && lastPassedWall) {
      const distancePassedLeft = calculateDistance(
        { x: prevWall.current?.[0] || 0, y: 0 },
        { x: lastPassedWall?.[0] || 0, y: 10 }
      );
      const distancePassedRight = calculateDistance(
        { x: prevWall.current?.[1] || 0, y: 0 },
        { x: lastPassedWall?.[1] || 0, y: 10 }
      );

      const distancePassed = (distancePassedLeft + distancePassedRight) / 2;

      distance.current += distancePassed;

      const droneVelocity = getObjectVelocity(droneSpeed.x, droneSpeed.y);

      setScore((prev) =>
        Math.round(
          prev +
            distancePassed * scoreMultiplier * (droneVelocity + complexity * 2)
        )
      );
    }

    prevWall.current = lastPassedWall;
  }, [lastPassedWall]);

  return score;
};
