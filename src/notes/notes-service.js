const NotesService = {
  getAllNotes(knex) {
    return knex.select("*").from("notes");
  },
  insertNote(knex, newNote) {
    return knex
      .insert(newNote)
      .into("notes")
      .returning("*")
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .from("notes")
      .select("*")
      .where("id", id)
      .first();
  },
  deleteNote(knex, id) {
    return knex("notes")
      .where({ id })
      .delete();
  },
  updateNote(knex, id, newNoteName) {
    return knex("note")
      .where({ id })
      .update(newNoteName);
  }
};

module.exports = NotesService;
