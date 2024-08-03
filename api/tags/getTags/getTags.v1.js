module.exports = async (req, res) => {
    const { search = '', page = 1, limit = 25 } = req.query;

  // check if page and limit are valid
  const validPage = Math.max(1, parseInt(page, 10) || 1);
  const validLimit = Math.min(100, parseInt(limit, 10) || 25);

  try {
    // create query
    let query = knex('tags');

    if (search) {
      query = query.where('name', 'like', `%${search}%`);
    }

    // count total records
    const totalCount = await query.clone().count('id as count').first();
    const count = totalCount.count;

    // calculate pagination
    const lastPage = Math.ceil(count / validLimit);
    const currentPage = Math.min(validPage, lastPage || 1);

    if (currentPage < 1) {
      return res.status(400).json({ message: "This page number is invalid." });
    }

    // query data
    const tags = await query
      .offset((currentPage - 1) * validLimit)
      .limit(validLimit)
      .select(['id', 'name', 'color']);

    return res.status(200).json({
      success: true,
      count: count,
      pagination: {
        current: currentPage,
        last: lastPage,
        next: currentPage < lastPage ? currentPage + 1 : null,
        prev: currentPage > 1 ? currentPage - 1 : null,
        limit: validLimit,
      },
      tags: tags
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
}