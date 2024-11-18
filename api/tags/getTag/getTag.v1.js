const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res) => {
    const id = req.params.tagId;

  try {
    // check if the tag already exists
    const tag = await knex('TAGS').where({ id }).select(['id', 'name', 'color']).first();

    if (!tag) {
      return res.status(404).json({ success: false, message: "This tag is not found." });
    }

    return res.status(200).json({
      success: true,
      tag: tag
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "An error occurred.", error: error.message });
  }
}