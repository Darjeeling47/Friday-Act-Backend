const knex = require('knex')(require('../../../knexfile').development);
const { getCompany } = require('../../../utils/getCompany');
const {convertKeysToCamelCase} = require('../../../utils/toCamel')

module.exports = async (req, res) => {
    try {
        const id = req.params.id;

        const activity = await knex('ACTIVITIES')
            .where('id', id)
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
                .where('user_id', req.user.userId)
                .orderBy('created_at', 'desc')
                .first();

            activity.application = latestApplication;
        }

        // get semester
        const semester = await knex('SEMESTERS')
        .where('id', activity.semester_id)
        .first();
        activity.semester = semester;

        // get company
        const company = await getCompany(activity.company_id);
        activity.company = company;

        // get tags id
        const tagsId = await knex('ACTIVITY_TAGS')
            .where('activity_id', activity.id)
            .select('tag_id');

        // get tags
        const tags = await knex('TAGS').whereIn('id', tagsId.map(tag => tag.tag_id));
        activity.tags = tags;

        return res.status(200).json({ success: true, activity: { ...(convertKeysToCamelCase(activity)), currentParticipants: currentParticipants.current_participants } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false , message: 'Internal server error.' });
    }
}