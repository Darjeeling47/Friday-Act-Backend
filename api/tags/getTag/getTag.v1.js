module.exports = async (req, res) => {
    const { id } = req.params;

  try {
    // check if the tag already exists
    const tag = await knex('tags').where({ id }).first();

    if (!tag) {
      return res.status(404).json({ message: "This tag is not found." });
    }

    return res.status(200).json({
      success: true,
      tag: tag
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
}