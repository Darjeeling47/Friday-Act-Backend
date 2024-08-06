module.exports = async (req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;
  
    // check if the length of name or color is too long
    if ((name && name.length > 50) || (color && color.length > 6)) {
      return res.status(400).json({
        success: false,
        message: `The length of ${name && name.length > 50 ? 'name' : 'color'} is too long.`
      });
    }
  
    // check if the color is in HEX format
    const hexRegex = /^[0-9a-f]{6}$/;
    if (color && !hexRegex.test(color)) {
      return res.status(400).json({
        success: false,
        message: "The color format is not in HEX format."
      });
    }
  
    try {
      // check if this tag exists
      const existingTag = await knex('tags').where({ id }).first();
  
      if (!existingTag) {
        return res.status(404).json({ message: "This tag is not found." });
      }
  
      // check if the tag already exists
      if (name) {
        const duplicateTag = await knex('tags').where({ name }).andWhereNot({ id }).first();
        if (duplicateTag) {
          return res.status(409).json({ message: "This tag is already existed." });
        }
      }
  
      // update the tag
      await knex('tags').where({ id }).update({ name, color, updated_at: knex.fn.now() });
  
      // query the updated tag
      const updatedTag = await knex('tags').where({ id }).first();
  
      return res.status(200).json({
        success: true,
        tag: updatedTag
      });
    } catch (error) {
      return res.status(500).json({ message: "An error occurred.", error: error.message });
    }
}