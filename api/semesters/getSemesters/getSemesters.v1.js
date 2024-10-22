const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res, next) => {
  let { page = 1, limit = 25, search = '' } = req.query;

  // convert to integer
  page = parseInt(page);
  limit = parseInt(limit);

  // Validate page และ limit
  if (page < 1) {
    return res.status(400).json({ message: "This page number is invalid." });
  }
  if (limit > 100) {
    limit = 100;
  }

  try {
    // create query
    const query = knex('SEMESTERS')
    .select('id', 'year', 'semester', 'start_date', 'end_date', 'created_at', 'updated_at')
    .groupBy('id', 'year', 'semester', 'start_date', 'end_date', 'created_at', 'updated_at')
    .modify((builder) => {
      if (search) {
        builder.where(knex.raw('CAST(year AS TEXT)'), 'LIKE', `%${search}%`)
              .orWhere(knex.raw('CAST(semester AS TEXT)'), 'LIKE', `%${search}%`);
      }
    })
    .limit(limit > 100 ? 100 : limit)
    .offset((page - 1) * limit);

    // query data
    const semesters = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('year', 'desc')
      .orderBy('semester', 'desc');

    // Count total records
    
    const total = semesters.length;
    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && totalPages > 0) {
      return res.status(400).json({ message: "This page number is invalid." });
    }

    // pagination
    const pagination = {
      current: page,
      last: totalPages,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
      limit: limit
    };

    return res.status(200).json({
      success: true,
      count: total,
      pagination: pagination,
      semesters: semesters
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
};