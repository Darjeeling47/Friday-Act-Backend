const db = require("../../../utils/db");

module.exports = (req, res, next) => {
  db('TAGS')
    .insert({ name: 'test 1', color: 'FFFFFF' })
    .returning('id')
    .then((ids) => {
      const id = ids[0];
      console.log(id);
      res.status(200).json({ id });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to insert data' });
    });
};