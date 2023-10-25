const baseUrl = import.meta.env.VITE_API_URL;
const wsURL = import.meta.env.VITE_WEBSOCKET_URL;

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
  complexity = 1,
}: NewPlayerBody) => {
  try {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({ name, complexity });

    const requestOptions = { method: 'POST', headers, body };

    const response = await fetch(`${baseUrl}/init`, requestOptions).then(
      (response) => response.json()
    );

    return response.id;
  } catch (error) {
    console.log('postNewPlayer error: ', error);
  }
};

export const getTokenByPlayerId = async (playerId: string) => {
  try {
    const requestOptions = { method: 'GET' };

    const tokenPromises = [1, 2, 3, 4].map(async (chunk) => {
      const response = await fetch(
        `${baseUrl}/token/${chunk}?id=${playerId}`,
        requestOptions
      );
      return response.json() as Promise<TokenResponse>;
    });

    const response = await Promise.all(tokenPromises);

    const completedToken = response
      .sort((a, b) => a.no - b.no)
      .map((i) => i.chunk)
      .join('');

    return completedToken;
  } catch (error) {
    console.log('getTokenByPlayerId error: ', error);
  }
};

export class CaveWebSocket {
  protected isConnected = false;
  protected socket: WebSocket = {} as WebSocket;

  constructor(readonly playerId: string, readonly token: string) {}

  connect() {
    try {
      this.socket = new WebSocket(`${wsURL}/cave`);
      this.setIsConnected();
    } catch (error) {
      console.log('CaveWebSocket connect error:', error);
    }
  }

  open(callback: () => void) {
    if (!this.IsConnected) return;

    this.socket.addEventListener('open', (event) => {
      this.socket.send(`player:${this.playerId}-${this.token}`);
      callback();
    });
  }

  getCaveWallsData(callback: (wallPosition: [number, number]) => void) {
    if (!this.IsConnected) return;

    this.socket.addEventListener('message', (event) => {
      if (event.data === 'finished') {
        return;
      }

      const data = event.data as string;
      const wallPosition = data.split(',').map((p) => +p);

      if (
        wallPosition.length === 2 &&
        wallPosition.every((n) => typeof n === 'number')
      ) {
        callback(wallPosition as [number, number]);
      }
    });
  }

  setIsConnected() {
    this.isConnected = true;
  }

  get IsConnected() {
    return this.isConnected;
  }

  get Socket() {
    return this.socket;
  }
}
