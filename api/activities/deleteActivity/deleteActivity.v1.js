const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res) => {
    try {
        const { id } = req.params;

        // delete application
        await knex('APPLICATIONS').where('activity_id', id).del();

        // delete activity
        await knex('ACTIVITIES').where('id', id).del();

        return res.json({ success: true, activities: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};