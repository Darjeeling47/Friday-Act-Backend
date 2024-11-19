const knex = require("knex")(require("../../../knexfile").development);
const axios = require("axios");
const { getCompanies } = require("../../../utils/getCompanies");
const { getCompany } = require("../../../utils/getCompany");
const { convertKeysToCamelCase } = require("../../../utils/toCamel");

module.exports = async (req, res) => {
  try {
    let { search = "", page = 1, limit = 25 } = req.query;

    // get total items
    let totalItems = await knex("ACTIVITIES").count("id as total").first();
    totalItems = totalItems.total;
    totalItems = parseInt(totalItems);

    if (page > Math.ceil(totalItems / limit)) {
      page = Math.ceil(totalItems / limit);
    }

    // get pagination
    const pagination = getPagination(page, limit, totalItems);

    // create query
    let query = knex("ACTIVITIES");

    // filter
    query = applyFilters(query, req.query);

        let companies
        // search by company name
        if (search) {
            let searchParam = {};
            searchParam.search = search;
            companies = await getCompanies(searchParam);

            const companyIds = companies.items.map(company => company.companyId);

            query = query.whereIn('company_id', companyIds);
            
        } else {
            companies = await getCompanies();
        }

    // Apply sorting
    query = applySort(query, req.query);

    // Apply pagination
    query = query.limit(limit).offset((page - 1) * limit);

    // Get activities
    const activities = await query.select("ACTIVITIES.*").modify((qb) => {
      if (search) {
        qb.where("ACTIVITIES.name", "like", `%${search}%`);
      }
    });

    // get currentParticipants
    for (const activity of activities) {
      const currentParticipants = await knex("APPLICATIONS")
        .where("activity_id", activity.id)
        .where("is_canceled", false)
        .count("id as current_participants")
        .first();

      activity.currentParticipants = parseInt(
        currentParticipants.current_participants
      );
    }

    if (req.user) {
      // Get user applications
      const userApplications = await knex("APPLICATIONS")
        .where("user_id", req.user.studentId)
        .where("is_canceled", false)
        .select("activity_id");

      // Add isApplied to each activity
      activities.forEach((activity) => {
        activity.isApplied = userApplications.some(
          (application) => application.activity_id == activity.id
        );
      });
    }

    // get semester
    for (const activity of activities) {
      // get semester
      const semester = await knex("SEMESTERS")
        .where("id", activity.semester_id)
        .first();

      activity.semester = semester;

            // map company to activity
            activity.company = companies.items.find(company => company.companyId === activity.company_id);
            
            // get tags id
            const tagsId = await knex('ACTIVITY_TAGS')
                .where('activity_id', activity.id)
                .select('tag_id');

      // get tags
      const tags = await knex("TAGS").whereIn(
        "id",
        tagsId.map((tag) => tag.tag_id)
      );
      activity.tags = tags;
    }

    const groupActivities = applyGroupBy(activities, req.query.group);

    if (req.query.group === "date") {
      return res.status(200).json({
        success: true,
        count: activities.length,
        dates: convertKeysToCamelCase(groupActivities),
        pagination,
      });
    }

    if (req.query.group === "semester") {
      return res.status(200).json({
        success: true,
        count: activities.length,
        semesters: convertKeysToCamelCase(groupActivities),
        pagination,
      });
    }

    // response
    return res.status(200).json({
      success: true,
      count: activities.length,
      activities: convertKeysToCamelCase(activities),
      pagination,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

function getPagination(page, limit, totalItems) {
  const pageLimit = parseInt(limit);
  let pageNum = parseInt(page);

  if (pageNum > Math.ceil(totalItems / limit)) {
    pageNum = Math.ceil(totalItems / limit);
  }

  let pagination = {
    now: pageNum,
    last: Math.ceil(totalItems / limit),
    next: pageNum < Math.ceil(totalItems / limit) ? pageNum + 1 : null,
    prev: pageNum > 1 ? pageNum - 1 : null,
    limit: pageLimit,
  };
  return pagination;
}

// Helper for applying filters
const applyFilters = (query, filters) => {
  const { status, company, semester, tags, date } = filters;

  if (status) {
    if (status === "All") {
    } else if (status === "Incoming") {
      query.where("ACTIVITIES.date", ">", new Date());
    } else if (status === "Achieved") {
      query.where("ACTIVITIES.date", "<", new Date());
    }
  }

  if (company) {
    query.where("ACTIVITIES.company_id", company);
  }

  if (semester) {
    -query.where("ACTIVITIES.semester_id", semester);
  }

  if (tags) {
    query
      .join("ACTIVITY_TAGS", "ACTIVITIES.id", "ACTIVITY_TAGS.activity_id")
      .whereIn("ACTIVITY_TAGS.tag_id", tags);
  }

  if (date) {
    query.where("ACTIVITIES.date", date);
  }

  return query;
};

// Helper for sorting
const applySort = (query, sort) => {
  if (sort.status === "Incoming") {
    query.orderBy("ACTIVITIES.date", "asc");
  }
  return query;
};

// Helper for group by
const applyGroupBy = (activities, group) => {
  if (group === "semester") {
    // Group activities by semester
    const groupedBySemester = activities.reduce((acc, activity) => {
      const semesterKey = activity.semester_id;

      if (!acc[semesterKey]) {
        const semester = {
          semester: activity.semester,
        };
        semester.activities = [];
        acc[semesterKey] = semester;
      }

      acc[semesterKey].activities.push(activity);

      return acc;
    }, {});

    return Object.values(groupedBySemester);
  } else if (group === "date") {
    // Group activities by semester
    const groupedByDate = activities.reduce((acc, activity) => {
      const dateKey = activity.date;

      if (!acc[dateKey]) {
        const dates = {
          date: activity.date,
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
