module.exports = async (req, res, next) => {
  const { id } = req.params.id;

  try {
    // check if the semester already exists
    const semester = await knex('semesters').where({ id }).first();

    if (!semester) {
      return res.status(404).json({ 
        success: false,
        message: "This semester is not found." 
      });
    }

    return res.status(200).json({
      success: true,
      semester: semester
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message
    });
  }
}