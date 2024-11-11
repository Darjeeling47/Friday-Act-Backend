const { getStudentData } = require("../../../utils/getStudentData");

module.exports = async (req, res, next) => {
  try {
    const applicationId = req.params.id;

    const {
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

    const user = req.user;

    const now = new Date(Date.now());

    let applicationUpdateObj = {};

    const applicationObj = await knex("APPLICATIONS")
    .where({ id: applicationId })
    .select("*")
    .first();

    if (!applicationObj) {
      return res.status(404).json({
        success: false,
        message: "This application is not found."
      })
    }

    // Check if user exist
    const userObj = await getStudentData(applicationObj.user_id)
    // Check if the activity id exist
    const activityObj = await knex("ACTIVITIES")
      .where({ id: activityId })
      .select("*")
      .first();

    // skip business logic if the user is admin
    if (!user.isApplicationAdmin) {
      if (!userObj) {
        return res.status(404).json({
          success: false,
          message: "This user is not found.",
        });
      }

      if (!activityObj) {
        return res.status(404).json({
          success: false,
          message: "This activity is not found.",
        });
      }
    }
    applicationUpdateObj.activity_id = activityId;
    applicationUpdateObj.user_id = userId;

    if (createdAt) {
      if (isNaN(Date.parse(createdAt))) {
        createdAt = now;
      }
      applicationUpdateObj.created_at = createdAt;
    }

    if (updatedAt) {
      if (isNaN(Date.parse(updatedAt))) {
        updatedAt = now;
      }
      applicationUpdateObj.updated_at = updatedAt;
    }

    if (isQrGenerated) {
      if (typeof isQrGenerated != "boolean") {
        isQrGenerated = false;
      }
      applicationUpdateObj.is_qr_generated = isQrGenerated;
    }

    if (qrGeneratedAt) {
      if (isNaN(Date.parse(qrGeneratedAt))) {
        qrGeneratedAt = now;
      }
      applicationUpdateObj.qr_generated_at = qrGeneratedAt;
    }

    if (isApproved) {
      if (typeof isApproved != "boolean") {
        isApproved = false;
      }
      applicationUpdateObj.is_approved = isApproved;
    }

    if (isCanceled) {
      if (typeof isCanceled != "boolean") {
        isCanceled = false;
      }
      applicationUpdateObj.is_canceled = isCanceled;
    }

    if (qrString) {
      if (typeof qrString != "string") {
        qrString = null;
      }
      applicationUpdateObj.qr_string = qrString;
    }

    if (cancellationReason) {
      if (typeof cancellationReason != "string") {
        cancellationReason = null;
      }
      applicationUpdateObj.cancellation_reason = cancellationReason;
    }

    const updatedApplication = await knex("APPLICATIONS")
      .where({ id: applicationId })
      .update(applicationUpdateObj)
      .returning("*");

      const activitySemesterObj = await knex("SEMESTER")
      .where({ id: activityObj.semester_id })
      .select("*")
      .first();

    const companyObj = await getCompany(activityObj.company_id);

    const applicationRes = {
      id: updatedApplication.id,
      user: {
        id: userObj.id,
        thaiName: userObj.firstNameTh + " " + userObj.lastNameTh,
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
  } catch {}
};
