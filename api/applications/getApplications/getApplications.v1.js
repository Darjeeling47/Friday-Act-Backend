const { getCompany } = require("../../../utils/getCompany");
const { getStudentData } = require("../../../utils/getStudentData");
const knex = require("knex")(require("../../../knexfile").development);

module.exports = async (req, res, next) => {
  try {
    let {
      search = "",
      page = 1,
      limit = 25,
      "group-by": groupBy,
      semester,
      tags,
      date,
      "is-qr-generated": isQrGenerated,
      "is-approved": isApproved,
      "is-canceled": isCanceled,
    } = req.query;

    // Parse pagination parameters
    const pageNum = Math.max(parseInt(page) || 1, 1);
    let pageLimit = Math.min(parseInt(limit) || 25, 100);
    if (pageLimit > 100) pageLimit = 100;
    const offset = (pageNum - 1) * pageLimit;

    // Base query
    let query = knex("APPLICATIONS")
      .join("ACTIVITIES", "APPLICATIONS.activity_id", "ACTIVITIES.id")
      .join("SEMESTERS", "ACTIVITIES.semester_id", "SEMESTERS.id")
      .select(
        "SEMESTERS.*",
        "APPLICATIONS.*",
        "ACTIVITIES.name as activity_name",
        "ACTIVITIES.date as activity_date",
        "ACTIVITIES.semester_id",
        "ACTIVITIES.company_id as company_id"
      );

    // Search functionality
    if (search) {
      query = query.where((builder) => {
        builder
          .where("ACTIVITIES.name", "like", `%${search}%`)
          .orWhereRaw('CAST("ACTIVITIES"."company_id" AS TEXT) LIKE ?', [`%${search}%`])
          .orWhereRaw('CAST("APPLICATIONS"."user_id" AS TEXT) LIKE ?', [`%${search}%`])
          .orWhereRaw('CAST("APPLICATIONS"."id" AS TEXT) LIKE ?', [`%${search}%`])
      });
    }

    // Filters
    if (semester) {
      query = query.where("ACTIVITIES.semester_id", semester);
    }

    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      query = query
        .join("ACTIVITY_TAGS", "ACTIVITIES.id", "ACTIVITY_TAGS.activity_id")
        .whereIn("ACTIVITY_TAGS.tag_id", tagsArray);
    }

    if (date) {
      query = query.where("ACTIVITIES.date", date);
    }

    if (isQrGenerated !== undefined && isQrGenerated === true) {
      query = query.where(
        "APPLICATIONS.is_qr_generated",
        isQrGenerated === "true"
      );
    }

    if (isApproved !== undefined && isApproved === true) {
      query = query.where("APPLICATIONS.is_approved", isApproved === "true");
    }

    if (isCanceled !== undefined && isCanceled === true) {
      query = query.where("APPLICATIONS.is_canceled", isCanceled === "true");
    }

    // Total count before pagination
    const totalCountResult = await query
      .clone()
      .clearSelect()
      .countDistinct("APPLICATIONS.id as count")
      .first();
    const totalCount = parseInt(totalCountResult.count) || 0;

    // Validate page number
    const lastPage = Math.ceil(totalCount / pageLimit);
    if (pageNum > lastPage && totalCount > 0) {
      return res
        .status(400)
        .json({ success: false, message: "This page number is invalid." });
    }

    // Sorting
    query = query.orderBy([
      { column: "ACTIVITIES.date", order: "desc" },
      { column: "APPLICATIONS.created_at", order: "desc" },
    ]);

    // Pagination
    query = query.limit(pageLimit).offset(offset);

    // Fetch applications
    const applications = await query;

    // Build application responses
    const applicationRes = await Promise.all(
      applications.map(async (application) => {
        const studentDataArray = await getStudentData([application.user_id]);
        const studentData = studentDataArray.items[0];
        const companyData = await getCompany(application.company_id);
        const status = determineStatus(application.is_canceled, application.is_approved, application.activity_date)
        if (status === "Unknown") {
          console.log(`Failed to determine status of activity ID:${application.activity_id}`)
        }

        return {
          id: application.id,
          user: {
            id: application.user_id,
            thaiName: `${studentData.firstNameTh} ${studentData.lastNameTh}`,
            studentId: studentData.studentId,
          },
          activity: {
            id: application.activity_id,
            name: application.activity_name,
            company: {
              id: companyData.companyId,
              name: companyData.companyNameTh,
              logoUrl: companyData.logoUrl,
            },
            semester: {
              id: application.semester_id,
              year: application.year,
              semester: application.semester
            }
          },
          createdAt: application.created_at,
          updatedAt: application.updated_at,
          isQrGenerated: application.is_qr_generated,
          qrString: application.qr_string,
          qrGeneratedAt: application.qr_generated_at,
          isApproved: application.is_approved,
          isCanceled: application.is_canceled,
          cancellationReason: application.cancellation_reason,
          status: status
        };
      })
    );

    // Pagination info
    const pagination = {
      current: pageNum,
      last: lastPage,
      next: pageNum < lastPage ? pageNum + 1 : null,
      prev: pageNum > 1 ? pageNum - 1 : null,
      limit: pageLimit,
    };

    // Response data
    let responseData = {
      success: true,
      count: totalCount,
      pagination,
    };

    if (groupBy === "semester") {
      // Group by semester
      let semesters = {};
      applicationRes.forEach((app) => {
        const key = app.activity.semester.id;
        if (!semesters[key]) {
          semesters[key] = {
            semester: {
              year: app.activity.semester.year,
              semester: app.activity.semester.semester
            },
            applications: [],
          };
        }
        semesters[key].applications.push(app);
      });
      responseData.semesters = Object.values(semesters);
    } else if (groupBy === "activity") {
      // Group by activity
      const activities = {};
      applicationRes.forEach((app) => {
        const key = app.activity.id;
        if (!activities[key]) {
          activities[key] = {
            id: app.activity.id,
            name: app.activity.name,
            applications: [],
          };
        }
        activities[key].applications.push(app);
      });
      responseData.activities = Object.values(activities);
    } else {
      // Not grouped
      responseData.applications = applicationRes;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};

function determineStatus(isCanceled, isApproved, activityDateTime) {
    // Check if activityDateTime is valid
    if (!activityDateTime) {
        console.log("Warning: activityDateTime is null/undefined");
        return "Unknown";
    }

    // Ensure activityDateTime is a Date object
    if (!(activityDateTime instanceof Date)) {
        activityDateTime = new Date(activityDateTime);
        if (isNaN(activityDateTime.getTime())) {
          return "Unknown"
        }
    }

    const now = new Date(Date.now() + Number(process.env.TIME_OFFSET_MS)).getTime();
    const activityDateTimeUnixMS = activityDateTime.getTime();

    if (isApproved) return "Approved";
    if (isCanceled) return "Canceled";
    if (now > (activityDateTimeUnixMS - (activityDateTimeUnixMS % 86400000) + 86400000)) {
        return "Absent";
    }
    return "Pending";
}