const db = require("../../../utils/db");

module.exports = async (name, color) => {
  try {
    const ids = await db('TAGS').insert({ name, color }).returning('id');
    const id = ids[0];
    console.log(id);
    return id;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to insert data');
  }
};