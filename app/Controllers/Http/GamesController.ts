import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { GameService } from 'App/services/GameService';
import { Player } from 'App/types';

const gameService = new GameService();

export default class GameController {
  public async create({ response }: HttpContextContract) {
    const game = gameService.createGame();
    response.status(201).json(game);
  }

  public async join({ params, response }: HttpContextContract) {
    const gameId = params.id;
    const game = gameService.joinGame(gameId);

    if (!game) {
      response.status(404).json({ message: 'Game not found' });
    } else {
      response.json(game);
    }
  }

  public async makeMove({ request, params, response }: HttpContextContract) {
    const gameId = params.id;
    const { player, x, y } = request.body();

    const game = gameService.makeMove(gameId, player, x, y);

    if (!game) {
      response.status(404).json({ message: 'Game not found' });
    } else if (game.winner) {
      response.json({ message: `${game.winner} wins!`, board: game.board });
    } else if (game.isDraw) {
      response.json({ message: 'Draw!', board: game.board });
    } else {
      response.json(game);
    }
  }
}
