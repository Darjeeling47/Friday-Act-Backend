const { getCompany } = require("../../../utils/getCompany");
const { getStudentData } = require("../../../utils/getStudentData");
const knex = require("knex")(require("../../../knexfile").development);

module.exports = async (req, res, next) => {
  try {
    const {
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
      .select(
        "APPLICATIONS.*",
        "ACTIVITIES.name as activity_name",
        "ACTIVITIES.date as activity_date",
        "ACTIVITIES.semester_id",
        "ACTIVITIES.company_id as company_id"
      );

    // Search functionality
    if (search) {
      query = query.where((builder) => {
        builder.where("ACTIVITIES.name", "like", `%${search}%`);
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
        const studentData = await getStudentData([application.user_id]);
        const companyData = await getCompany(application.company_id);
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
              id: companyData.id,
              name: companyData.name,
            },
          },
          createdAt: application.created_at,
          updatedAt: application.updated_at,
          isQrGenerated: application.is_qr_generated,
          qrString: application.qr_string,
          qrGeneratedAt: application.qr_generated_at,
          isApproved: application.is_approved,
          isCanceled: application.is_canceled,
          cancellationReason: application.cancellation_reason,
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
      const semesters = {};
      applicationRes.forEach((app) => {
        const key = app.activity.semester_id;
        if (!semesters[key]) {
          semesters[key] = {
            semester: {
              id: app.activity.semester_id,
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