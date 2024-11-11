/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('SEMESTERS', function(table) {
      table.increments('id').primary();
      table.smallint('year');
      table.smallint('semester');
      table.date('start_date');
      table.date('end_date');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at');
    })
    .createTable('TAGS', function(table) {
      table.increments('id').primary();
      table.string('name', 50).unique();
      table.string('color', 6);
      table.timestamp('updated_at');
    })
    .createTable('ACTIVITIES', function(table) {
      table.increments('id').primary();
      table.integer('company_id').notNullable();
      table.integer('semester_id');
      table.text('name');
      table.text('description');
      table.date('date');
      table.time('start_time');
      table.time('end_time');
      table.text('poster_url');
      table.text('location');
      table.smallint('max_participants').checkPositive();
      table.text('speaker');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at');
      table.foreign('semester_id').references('SEMESTERS.id');
    })
    .createTable('ACTIVITY_TAGS', function(table) {
      table.integer('activity_id').notNullable();
      table.integer('tag_id').notNullable();
      table.primary(['activity_id', 'tag_id']);
      table.foreign('activity_id').references('ACTIVITIES.id');
      table.foreign('tag_id').references('TAGS.id');
    })
    .createTable('APPLICATIONS', function(table) {
      table.increments('id').primary();
      table.integer('activity_id').notNullable();
      table.text('user_id').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at');
      table.boolean('is_qr_generated');
      table.text('qr_string');
      table.timestamp('qr_generated_at');
      table.boolean('is_approved');
      table.boolean('is_canceled');
      table.text('cancellation_reason');
      table.foreign('activity_id').references('ACTIVITIES.id');
    })
    .createTable('SYSTEM_SETTING', function(table) {
      table.increments('id').primary();
      table.string('name').unique();
      table.string('value');
      table.string('data_type');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('APPLICATIONS')
    .dropTableIfExists('ACTIVITY_TAGS')
    .dropTableIfExists('ACTIVITIES')
    .dropTableIfExists('TAGS')
    .dropTableIfExists('SEMESTERS')
    .dropTableIfExists('SYSTEM_SETTING');
};
