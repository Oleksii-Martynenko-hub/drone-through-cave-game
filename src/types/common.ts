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

export type NewSessionData = {
  name: string;
  difficulty: number;
};
