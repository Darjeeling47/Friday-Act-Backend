const knex = require('knex')(require('../../../knexfile').development);
const fs = require('fs').promises
const path = require('path')
const fileType = import('file-type');

module.exports = async (req, res) => {
    try {
        // get the data from the request body
        const { name, description, date, startTime, endTime, location, poster, maxParticipants, speaker, companyId, tags } = req.body;

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
            // remove the data:image;base64, prefix
            const posterImg = profile.replace(/^data:image\/\w+;base64,/, '')

            const posterFolder = path.join('image', 'activities', 'poster')
            
            // Decode the Base64 string
            const imageBuffer = Buffer.from(posterImg, 'base64')

            // check file type
            const type = await fileType.fromBuffer(imageBuffer)

            if (!type || !['jpg', 'jpeg', 'png', 'webp'].includes(type.ext)) {
                return res
                .status(400)
                .json({ success: false, message: 'Invalid image format.' })
            }

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

            const posterPath = path.join(posterFolder, `${activity.id}.jpeg`)

            // Create folder if it doesn't exist
            await fs.mkdir(posterFolder, { recursive: true })

            let posterUrl = `/image/activities/poster/${activity.id}.jpeg`
            // Save the image file
            await fs.writeFile(posterPath, imageBuffer, 'base64')

            // Update the activity with the poster url
            await knex('ACTIVITIES').where('id', activity.id).update({ poster_url: posterUrl })
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
                activity_id: activity.id,
                tag_id: tag
            })
        }

        return res.status(201).json({ success: true, activity: activity });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
    
}