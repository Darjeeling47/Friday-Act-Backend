const knex = require('knex')(require('../../../knexfile').development);
const { getCompany } = require('../../../utils/getCompany');

module.exports = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, date, startTime, endTime, poster, location, maxParticipants, speaker, companyId, tags } = req.body;

        // check if date is in the past
        if (new Date(date) < new Date()) {
            return res.status(400).json({ message: "The date must be today or be in the future." });
        }

        // check time
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: "The start time must be before the end time." });
        }

        // start time must be in future
        if (new Date(startTime) < new Date()) {
            return res.status(400).json({ message: "The start time must be in the future." });
        }

        // check poster
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

            const posterPath = path.join(posterFolder, `${id}.png`)

            // Create folder if it doesn't exist
            await fs.mkdir(posterFolder, { recursive: true })

            // Save the image file
            await fs.writeFile(posterPath, imageBuffer, 'base64')
        }

        // check max participants
        if (maxParticipants < 0) {
            return res.status(400).json({ message: "The max participants must be at least 0." });
        }

        if (tags) {
            //The tags must have at least 1 and not more than 3.
            if (tags.length < 1 || tags.length > 3) {
                return res.status(400).json({ message: "The tags must have at least 1 and not more than 3." });
            }
        }

        // check semester
        let semesterId = null;
        if (date){
            let semester = await knex('SEMESTERS').where('start_date', '<=', date).andWhere('end_date', '>=', date).first()
            if (!semester) {
                // get the nerest semester
                semester = await knex('SEMESTERS').where('start_date', '>', date).orderBy('start_date', 'asc').first()
            }
            if (!semester) {
                return res.status(400).json({ message: "There is no semester available." });
            }

            semesterId = semester.id
        }

        let bodyData = {
            company_id: companyId,
            name,
            description,
            start_time: startTime,
            end_time: endTime,
            location,
            max_participants: maxParticipants,
            speaker,
        }

        if (semesterId) {
            bodyData.semester_id = semesterId
        }

        // update activity
        let activity = await knex('ACTIVITIES').where('id', id).update(bodyData).returning('*')

        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
          ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // get company
        const company = await getCompany(activity[0].company_id);

        // add company to activity
        activity[0].company = company;

        //return updated activity
        return res.json({ success: true, activity: activity[0] });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
}