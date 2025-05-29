/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Make a new user
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old notes')");

  // Change the value of `owner` for notes with a NULL `owner`
  pgm.sql("UPDATE notes SET owner='old_notes' WHERE owner IS NULL");

  /** Add a foreign key constrain to the `owner` column
   * referencing the `id` column in the `users` table.
  */
  pgm.addConstraint('notes', 'fk_notes.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop the `fk_notes.owner_users.id` constraint from the `notes` table.
  pgm.dropConstraint('notes', 'fk_notes.owner_users.id');

  // Set the value of the `owner` column to `NULL` for notes where the `owner` is `old_notes`
  pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");

  // Delete the `old_notes` user.
  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};
