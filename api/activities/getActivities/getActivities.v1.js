const knex = require('knex')(require('../../../knexfile').development);
const axios = require('axios');
const { getCompanies } = require('../../../utils/getCompanies');
const { getCompany } = require('../../../utils/getCompany');

module.exports = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 25 } = req.query;

        const { limit: pageLimit, offset, pageNum } = getPagination(page, limit);

        // create query
        let query = knex('ACTIVITIES');

        // filter
        query = applyFilters(query, req.query);

        // search by company name
        if (search) {
            let searchParam = {};
            searchParam.search = search;
            const company = await getCompanies(searchParam);

            const companyIds = company.items.map(company => company.companyId);

            query = query.whereIn('company_id', companyIds);

        }

        // Apply sorting
        query = applySort(query, req.query);

        // Apply pagination
        query = query.limit(pageLimit).offset(offset);

        // Get activities
        const activities = await query.select('ACTIVITIES.*');

        // get currentParticipants
        for (const activity of activities) {
            const currentParticipants = await knex('APPLICATIONS')
                .where('activity_id', activity.id)
                .count('id as current_participants')
                .first();

            activity.currentParticipants = currentParticipants.current_participants;
        }

        if (req.user && req.user.role !== 'applicationAdmin') {
            // Get user applications
            const userApplications = await knex('APPLICATIONS')
                .where('user_id', req.user.userId)
                .select('activity_id');

            // Add isApplied to each activity
            activities.forEach(activity => {
                activity.isApplied = userApplications.some(application => application.activity_id === activity.id);
            });
        } 

        // get semester
        for (const activity of activities) {

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
        }

        const groupActivities = applyGroupBy(activities, req.query.group);

        if (req.query.group === 'date') {
            return res.status(200).json({
                success: true,
                count: activities.length,
                dates: groupActivities,
                pagination: {
                    currentPage: pageNum,
                    pageLimit: pageLimit,
                }
            });
        }

        if (req.query.group === 'semester') {
            return res.status(200).json({
                success: true,
                count: activities.length,
                semesters: groupActivities,
                pagination: {
                    currentPage: pageNum,
                    pageLimit: pageLimit,
                }
            });
        }

        // response
        return res.status(200).json({
            success: true,
            count: activities.length,
            groupActivities,
            pagination: {
                currentPage: pageNum,
                pageLimit: pageLimit,
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

function getPagination(page, limit) {

    // Parse the page number and limit from the query string
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageLimit = Math.min(parseInt(limit) || 25, 100);
    const offset = (pageNum - 1) * pageLimit;

    return { limit: pageLimit, offset, pageNum };

}

// Helper for applying filters
const applyFilters = (query, filters) => {
    const { status, company, semester, tags, date } = filters;
  
    if (status) {
        if (status === 'All') {

        }
        else if (status === 'Incoming') {
            query.where('ACTIVITIES.date', '>', new Date());
        }
        else if (status === 'Achieved') {
            query.where('ACTIVITIES.date', '<', new Date());
        }
    }
  
    if (company) {
        query.where('ACTIVITIES.company_id', company);
    }
  
    if (semester) {
-       query.where('ACTIVITIES.semester_id', semester);
    }

    if (tags) {
        query.join('ACTIVITY_TAGS', 'ACTIVITIES.id', 'ACTIVITY_TAGS.activity_id')
            .whereIn('ACTIVITY_TAGS.tag_id', tags);
    }

    if (date) {
        query.where('ACTIVITIES.date', date);
    }
  
    return query;
};

// Helper for sorting
const applySort = (query, sort) => {
    if (sort.status === 'Incoming') {
        query.orderBy('ACTIVITIES.date', 'asc');
    }
    return query;
};

// Helper for group by
const applyGroupBy = (activities, group) => {
    if (group === 'semester') {
        // Group activities by semester
        const groupedBySemester = activities.reduce((acc, activity) => {
            const semesterKey = activity.semester_id;
            
            if (!acc[semesterKey]) {
                const semester = {
                    semester: activity.semester
                };
                semester.activities = [];
                acc[semesterKey] = semester;
            }
            
            acc[semesterKey].activities.push(activity);
            
            return acc;
        }, {});

        return Object.values(groupedBySemester);

    }
    else if (group === 'date') {
        // Group activities by semester
        const groupedByDate = activities.reduce((acc, activity) => {
            const dateKey = activity.date;
            
            if (!acc[dateKey]) {
                const dates = {
                    date: activity.date
                };
                dates.activities = [];
                dates.semester = activity.semester;
                acc[dateKey] = dates;
            }
            
            acc[dateKey].activities.push(activity);
            
            return acc;
        }, {});

        return Object.values(groupedByDate);

    }

    return activities;
};