const { getCompany } = require("../../../utils/getCompany");
const { getStudentData } = require("../../../utils/getStudentData");

module.exports = async (req, res, next) => {
  try {
    const { qrString } = req.body;

    if (typeof qrString == "undefined" || typeof qrString != "string") {
      return res.status(400).json({
        success: false,
        message: "The Qr String is missing.",
      });
    }

    const qrArray = qrString.split("-");
    const qrInfo = [
      "applicationId",
      "userId",
      "activityId",
      "qrGeneratedAt",
      "hashData",
    ];
    const qrConversionObj = [qrInfo, qrArray];
    const qrObj = Object.fromEntries(qrConversionObj);

    const application = await knex("APPLICATIONS")
      .where({ id: qrObj.applicationId })
      .select("*")
      .first();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "This application is not found.",
      });
    }

    //TODO get user
    const userObj = getStudentData(qrObj.userId);

    const activityObj = await knex("ACTIVITIES")
      .where("id", application.activity_id)
      .first();

    const activitySemesterObj = await knex("SEMESTER")
      .where({ id: activityObj.semester_id })
      .select("*")
      .first();

    const companyObj = await getCompany(activityObj.company_id);

    const applicationRes = {
      id: application.id,
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
      createdAt: application.created_at,
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
      applicationRes,
    });
  } catch {
    console.log(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};
