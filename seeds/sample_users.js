exports.seed = async function(knex) {
   // Deletes ALL existing entries in dependent table first
   await knex('votes').del();

  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    { id: 1, username: 'voter1', password: 'pass1' },
    { id: 2, username: 'voter2', password: 'pass2' }
  ]);
};