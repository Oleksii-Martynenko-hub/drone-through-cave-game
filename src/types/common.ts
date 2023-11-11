export type WithoutNull<T extends object> = {
  [P in keyof T]: Exclude<T[P], null>;
};

export type AppendToKeys<T extends object, K extends string> = {
  [P in keyof T & string as `${P}${K}`]: T[P];
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
  distance?: number;
  time?: number;
};

export type APIStatus = 'not loaded' | 'loading' | 'loaded' | 'error';
