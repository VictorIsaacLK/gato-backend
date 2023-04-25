import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('player_x_id').unsigned().notNullable()
      table.foreign('player_x_id').references('id').inTable('users')
      table.integer('player_o_id').unsigned().nullable()
      table.foreign('player_o_id').references('id').inTable('users')
      table.integer('current_player_id').unsigned().notNullable()
      table.foreign('current_player_id').references('id').inTable('users')
      table.string('game_state').notNullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
