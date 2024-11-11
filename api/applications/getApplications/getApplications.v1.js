const { getStudentData } = require("../../../utils/getStudentData");

const knex = require("knex")(require("../../../knexfile").development);

module.exports = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 25 } = req.query;

    const { limit: pageLimit, offset, pageNum } = getPagination(page, limit);

    // create query
    let query = knex("APPLICATIONS");

    // filter
    query = applyFilters(query, req.query);

    // Apply sorting
    query = applySort(query, req.query);

    // Apply pagination
    query = query.limit(pageLimit).offset(offset);

    const application = await await query.select("APPLICATIONS.*");

    const userObj = await getStudentData(application.user_id);

    const activityObj = await knex("ACTIVITIES")
      .where({ id: application.activity_id })
      .select("*")
      .first();

    const applicationRes = {
      id: application.id,
      user: {
        id: userObj.studentId,
        thaiName: userObj.firstNameTh + " " + userObj.lastNameTh,
        studentId: userObj.studentId,
      },
      activity: activityObj, // to remove unused attribute
      createdAt: application.created_at, // ask if use inserted value
      updatedAt: application.updated_at,
      isQrGenerated: application.is_qr_generated,
      qrString: application.qr_string,
      qrGeneratedAt: application.qr_generated_at,
      isApproved: application.is_approved,
      isCanceled: application.is_canceled,
      cancellationReason: application.cancellation_reason,
    };

    return res.status(200).json({
      success: true,
      application: applicationRes,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

function getPagination(page, limit) {
  // Parse the page number and limit from the query string
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const pageLimit = Math.min(parseInt(limit) || 25, 100);
  const offset = (pageNum - 1) * pageLimit;

  return { limit: pageLimit, offset, pageNum };
}

// Helper for applying filters
// TODO
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
// TODO
const applySort = (query, sort) => {
  if (sort.status === "Incoming") {
    query.orderBy("ACTIVITIES.date", "asc");
  }
  return query;
};

// Helper for group by
// TODO
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
