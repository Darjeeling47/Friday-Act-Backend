const knex = require('knex')(require('../../../knexfile').development);
const {getStudentData} = require('../../../utils/getStudentData');
const {convertKeysToCamelCase} = require('../../../utils/toCamel')

module.exports = async (req, res) => {
    try {
        const { id } = req.params;
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        const activity = await knex('ACTIVITIES').where('id', id).first();
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found.' });
        }

        // Get the participants of the activity
        const participants = await knex('APPLICATIONS').where('activity_id', id).select('user_id');
        console.log(participants);
        // check if the participants is empty
        if (!participants.length) {
            return res.status(200).json({ success: true, count: 0, participants: [] });
        }

        // Get the student data of the participants
        let studentIds = participants.map(participant => participant.user_id);
        
        let studentData = await getStudentData(studentIds);
        studentData = studentData.items;

        // serch params for student data
        if (req.query.search) {
            studentData = studentData.filter(student => student.studentId.includes(req.query.search) || student.firstNameTh.includes(req.query.search) || student.lastNameTh.includes(req.query.search) || student.firstNameEn.includes(req.query.search) || student.lastNameEn.includes(req.query.search));
        }

        // filter by admission year
        if (req.query.admissionYear) {
            studentData = studentData.filter(student => student.admissionYear == req.query.admissionYear);
        }

        // return the student data
        return res.status(200).json({ success: true, count: studentData.length, participants: convertKeysToCamelCase(studentData) });

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false , message: 'Internal server error.' });
    }
}