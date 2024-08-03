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
    const query = knex('semesters')
      .where('year', 'like', `%${search}%`)
      .orWhere('semester', 'like', `%${search}%`);

    // count total records
    const totalRecords = await query.clone().count({ count: '*' }).first();

    const total = parseInt(totalRecords.count);
    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && totalPages > 0) {
      return res.status(400).json({ message: "This page number is invalid." });
    }

    // query data
    const semesters = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('year', 'desc')
      .orderBy('semester', 'desc');

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
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
};