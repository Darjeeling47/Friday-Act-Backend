const knex = require('knex')(require('../../../knexfile').development);

module.exports =  async (req, res, next) => {
  const { year, semester, startDate, endDate } = req.body;

  // Validate required fields
  if (!year || !semester || !startDate || !endDate) {
    return res.status(400).json({ message: "Some required value is missing.", success: false });
  }

  // Validate year format
  const yearRegex = /^[0-9]{4}$/;
  if (!yearRegex.test(year)) {
    return res.status(400).json({ message: "The year format is wrong, please provide 4 digit number (0000 - 9999).", success: false });
  }

  // Validate semester range
  if (semester < 1 || semester > 3) {
    return res.status(400).json({ message: "The semester must be a number within the range 1 - 3.", success: false });
  }

  // Validate date range
  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ message: "The startDate must be before the endDate.", success: false });
  }

  try {
    // Check if the semester already exists
    const existingSemester = await knex('SEMESTERS')
      .where({ year, semester })
      .first();

    if (existingSemester) {
      return res.status(409).json({ message: "This semester is already existed.", success: false });
    }

    // Insert new semester
    const [newSemester] = await knex('SEMESTERS')
      .insert({ year, semester, start_date: startDate, end_date: endDate })
      .returning('*');

    return res.status(201).json({
      success: true,
      semester: newSemester
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "An error occurred."});
  }
}