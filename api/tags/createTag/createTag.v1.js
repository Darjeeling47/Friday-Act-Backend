const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res) => {
    let { name, color } = req.body;

    // delete the white space
    name = name && name.trim();
    color = color && color.trim();

  // Validate required fields
  if (!name || !color) {
    return res.status(400).json({ success: false, message: "Some required value is missing." });
  }

  // Validate length of name and color
  if (name.length > 50) {
    return res.status(400).json({ success: false, message: "The length of name is too long." });
  }

  if (color.length > 6) {
    return res.status(400).json({ success: false, message: "The length of color is too long." });
  }

  // Validate color format (HEX format)
  const hexColorRegex = /^[0-9a-fA-Z]{3,6}$/;
  if (!hexColorRegex.test(color)) {
    return res.status(400).json({ success: false, message: "The color format is not in HEX format." });
  }

  try {
    // check if tag already exists
    const existingTag = await knex('TAGS').where({ name }).first();

    if (existingTag) {
      return res.status(409).json({ success: false, message: "This tag is already existed." });
    }

    // create new tag
    const [newTag] = await knex('TAGS')
      .insert({
        name,
        color
      })
      .returning(['id', 'name', 'color']);

    return res.status(201).json({
      success: true,
      tag: newTag
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "An error occurred.", error: error.message });
  }
};