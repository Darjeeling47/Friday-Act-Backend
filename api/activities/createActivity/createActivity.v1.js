const knex = require('knex')(require('../../../knexfile').development);
const fs = require('fs').promises
const path = require('path')
const {convertKeysToCamelCase} = require('../../../utils/toCamel')

module.exports = async (req, res) => {
    try {
        // get the data from the request body
        const { name, description, date, startTime, endTime, location, maxParticipants, speaker, companyId, tags } = req.body;
        // get the poster buffer file from the request body
        const poster = req.file ? req.file.buffer : null;

        // validate required fields
        if (!name || !date || !startTime || !endTime || !maxParticipants || !tags) {
            return res.status(400).json({ message: "Some required value is missing." });
        }

        // validate date, date must be in the future
        if (new Date(date) < new Date()) {
            return res.status(400).json({ message: "The date must be today or be in the future." });
        }

        // validate time range
        if (new Date(`${date} ${startTime}`) >= new Date(`${date} ${endTime}`)) {
            return res.status(400).json({ message: "The startTime must be before the endTime." });
        }

        // validate startTime and endTime
        if (new Date(`${date} ${startTime}`) < new Date()) {
            return res.status(400).json({ message: "The startTime and endTime must be in the future." });
        }

        let activity = null

        if (poster) {
            // check poster file type png jpeg jpg webp
            if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(req.file.mimetype)) {
                return res.status(400).json({ message: "The poster must be an image file." });
            }

            const posterFolder = path.join('image', 'activities', 'poster')

            // get semester id
            let semester = await knex('SEMESTERS').where('start_date', '<=', date).andWhere('end_date', '>=', date).first()
            if (!semester) {
                // get the nerest semester
                semester = await knex('SEMESTERS').where('start_date', '>', date).orderBy('start_date', 'asc').first()
            }
            if (!semester) {
                return res.status(400).json({ message: "There is no semester available." });
            }
            const semesterId = semester.id

            // create the activity
            activity = await knex('ACTIVITIES').insert({
                company_id: companyId,
                semester_id: semesterId,
                name,
                description,
                date,
                start_time: startTime,
                end_time: endTime,
                location,
                max_participants: maxParticipants,
                speaker,
                poster_url: null,
                semester_id: semesterId
            }).returning('*')

            const posterPath = path.join(posterFolder, `${activity[0].id}.png`)

            // Create folder if it doesn't exist
            await fs.mkdir(posterFolder, { recursive: true })

            let posterUrl = `/image/activities/poster/${activity[0].id}.png`
            // Save the image file
            await fs.writeFile(posterPath, poster)

            // Update the activity with the poster url
            activity = await knex('ACTIVITIES').where('id', activity[0].id).update({ poster_url: posterUrl }).returning('*')
        } else {
            // get semester id
            let semester = await knex('SEMESTERS').where('start_date', '<=', date).andWhere('end_date', '>=', date).first()
            if (!semester) {
                // get the nearest semester
                semester = await knex('SEMESTERS').where('start_date', '>', date).orderBy('start_date', 'asc').first()
            }
            if (!semester) {
                return res.status(400).json({ message: "There is no semester available." });
            }
            const semesterId = semester.id

            // create the activity
            activity = await knex('ACTIVITIES').insert({
                company_id: companyId,
                semester_id: semesterId,
                name,
                description,
                date,
                start_time: startTime,
                end_time: endTime,
                location,
                max_participants: maxParticipants,
                speaker,
                poster_url: null,
                semester_id: semesterId
            }).returning('*')
        }

        // insert tags
        for (const tag of tags) {
            await knex('ACTIVITY_TAGS').insert({
                activity_id: activity[0].id,
                tag_id: tag
            })
        }

        return res.status(201).json({ success: true, activity: convertKeysToCamelCase(activity) });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
    
}