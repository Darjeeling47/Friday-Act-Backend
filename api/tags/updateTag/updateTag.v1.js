const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res) => {
    const id = req.params.tagId;
    let { name, color } = req.body;

    // delete the white space
    name = name && name.trim();
    color = color && color.trim();

    // check if name or color is empty
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: "Some required value is missing."
      });
    }
  
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
      const existingTag = await knex('TAGS').where({ id }).first();
  
      if (!existingTag) {
        return res.status(404).json({ success: false, message: "This tag is not found." });
      }
  
      // check if the tag already exists
      if (name) {
        const duplicateTag = await knex('TAGS').where({ name }).andWhereNot({ id }).first();
        if (duplicateTag) {
          return res.status(409).json({ success: false, message: "This tag is already existed." });
        }
      }
  
      // update the tag
      await knex('TAGS').where({ id }).update({ name, color});
  
      // query the updated tag
      const updatedTag = await knex('TAGS').where({ id }).select(['id', 'name', 'color']).first();
  
      return res.status(200).json({
        success: true,
        tag: updatedTag
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "An error occurred."});
    }
}