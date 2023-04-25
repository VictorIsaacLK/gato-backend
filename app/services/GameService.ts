// app/services/GameService.ts

type Player = 'X' | 'O';
type Board = (Player | null)[][];

interface Game {
  id: string;
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
}

export class GameService {
  private games: Map<string, Game> = new Map();

  // app/services/GameService.ts

  createGame(): Game {
    const gameId = Date.now().toString();
    const emptyBoard: Board = Array(3)
      .fill(null)
      .map(() => Array(3).fill(null));

    const game: Game = {
      id: gameId,
      board: emptyBoard,
      currentPlayer: 'X',
      winner: null,
      isDraw: false
    };

    this.games.set(gameId, game);
    return game;
  }

  joinGame(gameId: string): Game | null {
    const game = this.games.get(gameId);

    if (game && !game.isDraw && !game.winner) {
      return game;
    }

    return null;
  }

  makeMove(gameId: string, player: Player, x: number, y: number): Game | null {
    const game = this.games.get(gameId);

    if (!game || game.isDraw || game.winner || game.board[x][y]) {
      return null;
    }

    game.board[x][y] = player;
    game.winner = this.checkWinner(game.board);

    if (!game.winner) {
      game.isDraw = !game.board.some(row => row.includes(null));
    }

    game.currentPlayer = player === 'X' ? 'O' : 'X';

    return game;
  }

  private checkWinner(board: Board): Player | null {
    const lines: number[][][] = [
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]]
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      const [ax, ay] = a;
      const [bx, by] = b;
      const [cx, cy] = c;

      const first = board[ax][ay];
      const second = board[bx][by];
      const third = board[cx][cy];

      if (first && first === second && second === third) {
        return first;
      }
    }

    return null;
  }

}
