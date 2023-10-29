export type WithoutNull<T extends object> = {
  [P in keyof T]: Exclude<T[P], null>;
};

export type Point = {
  x: number;
  y: number;
};

export type GameSession = {
  id: string;
  name: string;
  difficulty: number;
  score: number;
};
