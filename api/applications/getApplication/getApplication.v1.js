const { getStudentData } = require("../../../utils/getStudentData");
const { getCompany } = require("../../../utils/getCompany");

const knex = require("knex")(require("../../../knexfile").development);

module.exports = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await knex("APPLICATIONS")
      .where({ id: applicationId })
      .select("*")
      .first();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "This application is not found.",
      });
    }

    const userArray = await getStudentData([application.user_id]);
    const userObj = userArray.items.at(0);

    const activityObj = await knex("ACTIVITIES")
      .where({ id: application.activity_id })
      .select("*")
      .first();

    const activitySemesterObj = await knex("SEMESTERS")
      .where({ id: activityObj.semester_id })
      .select("*")
      .first();

    const companyObj = await getCompany(activityObj.company_id);
    const status = determineStatus(application.is_canceled, application.is_approved, activityObj.date)
    if (status === "Unknown") {
      console.log(`Failed to determine status of activity ID:${activityObj.id}`)
    }

    const applicationRes = {
      id: application.id,
      user: {
        id: userObj.studentId,
        thaiName: userObj.firstNameTh + " " + userObj.lastNameTh,
        studentId: userObj.studentId,
      },
      activity: {
        id: activityObj.id,
        name: activityObj.name,
        company: {
          id: companyObj.companyId,
          name: companyObj.companyNameTh,
          logoUrl: companyObj.logoUrl,
        },
        semester: {
          year: activitySemesterObj.year,
          semester: activitySemesterObj.semester,
        },
        date: activityObj.date,
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

    return res.status(200).json({
      success: true,
      application: applicationRes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
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