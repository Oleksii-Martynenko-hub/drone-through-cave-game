const baseUrl = import.meta.env.VITE_API_URL;

type NewPlayerBody = {
  name: string;
  complexity?: number;
};

type TokenResponse = {
  no: number;
  chunk: string;
};

export const postNewPlayer = async ({
  name,
  complexity,
}: NewPlayerBody): Promise<string> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const body = JSON.stringify({ name, complexity });

  const requestOptions = { method: 'POST', headers, body };

  const response = await fetch(`${baseUrl}/init`, requestOptions).then(
    (response) => response.json(),
  );

  return response.id;
};

export const getTokenByPlayerIdAndChunk = async (
  playerId: string,
  chunk: number,
) => {
  const requestOptions = { method: 'GET' };

  const response = await fetch(
    `${baseUrl}/token/${chunk}?id=${playerId}`,
    requestOptions,
  );

  return response.json() as Promise<TokenResponse>;
};
