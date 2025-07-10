exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('username').unique().notNullable();
      table.string('password').notNullable();
    })
    .createTable('votes', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('users.id');
      table.integer('candidate_id').notNullable();
      table.timestamp('timestamp').defaultTo(knex.fn.now());
    })
    .createTable('results', table => {
      table.increments('id').primary();
      table.text('encrypted_results').notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('results')
    .dropTableIfExists('votes')
    .dropTableIfExists('users');
};
