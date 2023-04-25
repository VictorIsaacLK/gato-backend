import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

const WINNINGS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

export default class GameController {
  private games = new Map<string, { gameState: string[], currentPlayer: string }>()

  public async create({ response }: HttpContextContract) {
    const gameId = Date.now().toString()
    this.games.set(gameId, {
      gameState: Array(9).fill(''),
      currentPlayer: 'X'
    })

    response.status(201).json({ gameId })
  }

  public async move({ request, response }: HttpContextContract) {
    const gameId = request.param('id')
    const { cellIndex } = request.body()

    const game = this.games.get(gameId)

    if (!game || game.gameState[cellIndex] !== '') {
      response.status(400).json({ message: 'Invalid move' })
      return
    }

    game.gameState[cellIndex] = game.currentPlayer
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X'

    const result = this.checkGameState(game.gameState)

    response.json({
      gameState: game.gameState,
      result,
      currentPlayer: game.currentPlayer
    })
  }

  private checkGameState(gameState: string[]) {
    for (const winCondition of WINNINGS) {
      const [a, b, c] = winCondition
      const position1 = gameState[a]
      const position2 = gameState[b]
      const position3 = gameState[c]

      if (position1 === '' || position2 === '' || position3 === '') {
        continue
      }

      if (position1 === position2 && position2 === position3) {
        return {
          status: 'win',
          winner: position1
        }
      }
    }

    if (!gameState.includes('')) {
      return { status: 'draw' }
    }

    return { status: 'ongoing' }
  }
}
