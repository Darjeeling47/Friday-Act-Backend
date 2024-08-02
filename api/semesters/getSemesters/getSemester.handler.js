exports.v1 = async (req, res, next) => {
  const insertTag = require('./getSemesters.v1');
  try {
    res.status(200).json({ id });
    console.log("s");
    const id = await insertTag('test 1', 'FFFFFF');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to insert data' });
  }
};