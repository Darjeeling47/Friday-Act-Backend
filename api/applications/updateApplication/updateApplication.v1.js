const { getCompany } = require("../../../utils/getCompany");
const { getStudentData } = require("../../../utils/getStudentData");
const knex = require("knex")(require("../../../knexfile").development);

module.exports = async (req, res, next) => {
  try {
    const applicationId = req.params.id;

    let {
      userId,
      activityId,
      createdAt,
      updatedAt,
      isQrGenerated,
      qrString,
      qrGeneratedAt,
      isApproved,
      isCanceled,
      cancellationReason,
    } = req.body;

    if (applicationId == ":id") {
      return res.status(404).json({
        success: false,
        message: "Undefined Parameter(s).",
      });
    }

    const user = req.user;
    const now = new Date(Date.now() + process.env.TIME_OFFSET_MS);
    let applicationUpdateObj = {};

    const applicationObj = await knex("APPLICATIONS")
      .where({ id: applicationId })
      .select("*")
      .first();

    if (!applicationObj) {
      return res.status(404).json({
        success: false,
        message: "This application is not found.",
      });
    }

    // Get current user data
    const userArray = await getStudentData([applicationObj.user_id]);
    const userObj = userArray.items.at(0);

    // Validate userId
    if (typeof userId !== "undefined") {
      const newUserArray = await getStudentData([userId]);
      const newUserObj = newUserArray.items.at(0);
      if (!newUserObj) {
        return res.status(404).json({
          success: false,
          message: "This user is not found.",
        });
      }
      applicationUpdateObj.user_id = userId;
    }

    // Validate activityId
    let activityObj;
    if (typeof activityId !== "undefined") {
      activityObj = await knex("ACTIVITIES")
        .where({ id: activityId })
        .select("*")
        .first();
      if (!activityObj) {
        return res.status(404).json({
          success: false,
          message: "This activity is not found.",
        });
      }
      applicationUpdateObj.activity_id = activityId;
    }

    // Skip business logic if the user is admin
    if (!user.isApplicationAdmin) {
      if (!userObj) {
        return res.status(404).json({
          success: false,
          message: "This user is not found.",
        });
      }
    }

    // Handle createdAt
    if (typeof createdAt !== "undefined") {
      if (isNaN(Date.parse(createdAt))) {
        createdAt = now;
      } else {
        createdAt = new Date(createdAt);
      }
    } else {
      createdAt = now;
    }
    applicationUpdateObj.created_at = createdAt;

    // Handle updatedAt
    if (typeof updatedAt !== "undefined") {
      if (isNaN(Date.parse(updatedAt))) {
        updatedAt = now;
      } else {
        updatedAt = new Date(updatedAt);
      }
    } else {
      updatedAt = now;
    }
    applicationUpdateObj.updated_at = updatedAt;

    // Handle isQrGenerated
    if (typeof isQrGenerated !== "undefined") {
      applicationUpdateObj.is_qr_generated = Boolean(isQrGenerated);
    }

    // Handle qrString
    if (typeof qrString !== "undefined") {
      applicationUpdateObj.qr_string = String(qrString);
    }

    // Handle qrGeneratedAt
    if (typeof qrGeneratedAt !== "undefined") {
      if (isNaN(Date.parse(qrGeneratedAt))) {
        qrGeneratedAt = now;
      } else {
        qrGeneratedAt = new Date(qrGeneratedAt);
      }
      applicationUpdateObj.qr_generated_at = qrGeneratedAt;
    }

    // Handle isApproved
    if (typeof isApproved !== "undefined") {
      applicationUpdateObj.is_approved = Boolean(isApproved);
    }

    // Handle isCanceled
    if (typeof isCanceled !== "undefined") {
      applicationUpdateObj.is_canceled = Boolean(isCanceled);
    }

    // Handle cancellationReason
    if (typeof cancellationReason !== "undefined") {
      applicationUpdateObj.cancellation_reason = String(cancellationReason);
    }

    const [updatedApplication] = await knex("APPLICATIONS")
      .where({ id: applicationId })
      .update(applicationUpdateObj)
      .returning("*");

    if (!activityObj) {
      activityObj = await knex("ACTIVITIES")
        .where({ id: updatedApplication.activity_id })
        .select("*")
        .first();
    }

    const activitySemesterObj = await knex("SEMESTERS")
      .where({ id: activityObj.semester_id })
      .select("*")
      .first();

    const companyObj = await getCompany(activityObj.company_id);

    const applicationRes = {
      id: updatedApplication.id,
      user: {
        id: userObj.id,
        thaiName: `${userObj.firstNameTh} ${userObj.lastNameTh}`,
        studentId: userObj.studentId,
      },
      activity: {
        id: activityObj.id,
        name: activityObj.name,
        company: {
          id: companyObj.id,
          name: companyObj.companyNameTh,
          logoUrl: companyObj.logoUrl,
        },
        semester: {
          year: activitySemesterObj.year,
          semester: activitySemesterObj.semester,
        },
        date: activityObj.date,
      },
      createdAt: updatedApplication.created_at,
      updatedAt: updatedApplication.updated_at,
      isQrGenerated: updatedApplication.is_qr_generated,
      qrString: updatedApplication.qr_string,
      qrGeneratedAt: updatedApplication.qr_generated_at,
      isApproved: updatedApplication.is_approved,
      isCanceled: updatedApplication.is_canceled,
      cancellationReason: updatedApplication.cancellation_reason,
    };

    return res.status(200).json({
      success: true,
      application: applicationRes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};