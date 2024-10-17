const knex = require('knex')(require('../../../knexfile').development);
const getCompanies = require('../../../utils/getCompanies');

module.exports = async (req, res) => {
    try {
        const { activityId } = req.params;

        const activity = await knex('ACTIVITIES')
            .where('id', activityId)
            .first();

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found.' });
        }

        // get currentParticipants
        const currentParticipants = await knex('APPLICATIONS')
            .where('activity_id', activity.id)
            .count('id as current_participants')
            .first();

        // get lastest application
        if (req.user) {
            const latestApplication = await knex('APPLICATIONS')
                .where('activity_id', activity.id)
                .where('user_id', req.user.id)
                .orderBy('created_at', 'desc')
                .first();

            activity.application = latestApplication;
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false , message: 'Internal server error.' });
    }
}