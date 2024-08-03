module.exports = async (req, res) => {
    const { id } = req.params;

  try {
    // check if the tag already exists
    const existingTag = await knex('tags').where({ id }).first();

    if (!existingTag) {
      return res.status(404).json({ message: "This tag is not found." });
    }

    // delete the tag
    await knex('tags').where({ id }).del();

    return res.status(200).json({
      success: true,
      tag: {}
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
}