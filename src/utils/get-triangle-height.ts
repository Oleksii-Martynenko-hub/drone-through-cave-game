export function getTriangleHeight(sideA: number, sideB: number, sideC: number) {
  const semiPerimeter = (sideA + sideB + sideC) / 2;

  const area = Math.sqrt(
    semiPerimeter *
      (semiPerimeter - sideA) *
      (semiPerimeter - sideB) *
      (semiPerimeter - sideC)
  );

  const height = (2 * area) / sideA;

  return height;
}
