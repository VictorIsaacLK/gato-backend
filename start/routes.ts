/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/users', 'LogginsController.create').as('createUser')
Route.get('/verify/:id', 'LogginsController.verifyEmail').as('verifyEmail')
Route.post('/verify/:id', 'LogginsController.verifyCode').as('verifyCode')


Route.post('/login', 'LogginsController.login').as('login')

Route.group(()=> {
  Route.get('/logout', 'user/UsersController.logout').as('logout')
}).middleware(['auth:api'])


// start/routes.ts


Route.post('/game', 'GamesController.create')
Route.put('/game/:id/move', 'GamesController.move')

Route.get('/create', 'GamesController.create')
Route.post('/ingresar', 'GamesController.join')

