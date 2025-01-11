const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res, next) => {
    const { name, value } = req.body;

    // Validate required fields
    if (!name && !value) {
        return res.status(400).json({ message: "Some required value is missing." });
    }

    try {
        // check if this system setting exists
        const existingSystemSetting = await knex('SYSTEM_SETTING').where({ name }).first();

        if (!existingSystemSetting) {
            return res.status(404).json({ message: "This system setting is not found." });
        }

        // update the system setting
        const updatedSystemSetting = await knex('SYSTEM_SETTING')
            .where({ name })
            .update({
                value: value || existingSystemSetting.value,
            })
            .returning('*');

        return res.status(200).json({
            success: true,
            setting : updatedSystemSetting[0]
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}