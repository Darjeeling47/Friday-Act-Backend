const crypto = require("node:crypto");
const { getStudentData } = require("../../../utils/getStudentData");

module.exports = async (req, res, next) => {
  // TODO Convert to promise
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
        message: "This Qr String is invalid.",
      });
    }

    const user = await getStudentData(application.user_id);
    
    if (!application.is_qr_generated) {
      return res.status(409).json({
        success: true,
        message:
          "You cannot approve attendance check the application that is not generate qr code.",
      });
    }

    if (application.is_approved) {
      return res.status(409).json({
        success: true,
        message:
          "You cannot approve attendance check the application that is already approved.",
      });
    }

    if (application.is_canceled) {
      return res.status(409).json({
        success: false,
        message:
          "You cannot approve attendance check the application that is already canceled.",
      });
    }

    const activityObj = await knex("ACTIVITIES")
      .where("id", application.activity_id)
      .first();

    if (!activityObj) {
      return res.status(400).json({
        success: false,
        message: "This Qr String is invalid",
      });
    }

    // check with standard_cancellation_cutoff_hour
    const now = Date.now();
    const attendanceCheckOpenHour = await knex("SYSTEM_SETTING")
      .where("name", "attendance_check_open_hour ")
      .first();

    const attendanceCheckCloseHour = await knex("SYSTEM_SETTING")
      .where("name", "attendance_check_close_hour")
      .first();

    const activityStartMilliSecondsSinceMidNight =
      (activityObj.start_time.slice(0, 2) * 60 +
        activityObj.start_time.slice(3,5)) *
      60 *
      1000;
    const activityEndMilliSecondsSinceMidNight =
      (activityObj.end_time.slice(0, 2) * 60 + activityObj.end_time.slice(3,5)) *
      60 *
      1000;
    const todayMilliSecondsSinceMidNight = now % 86400000;

    const timeAtAttendanceCheckOpenHour =
      activityStartMilliSecondsSinceMidNight -
      attendanceCheckOpenHour * 60 * 60 * 1000;

    const timeAtAttendanceCheckCloseHour =
      activityEndMilliSecondsSinceMidNight +
      attendanceCheckCloseHour * 60 * 60 * 1000;

    if (now > Date.parse(activityObj.date) + 8640000) {
      return res.status(409).json({
        success: false,
        message: "This activity attendance checking is already closed.",
      });
    }

    if (now > Date.parse(activityObj.date)) {
      if (todayMilliSecondsSinceMidNight > timeAtAttendanceCheckCloseHour) {
        return res.status(409).json({
          success: false,
          message: "This activity attendance checking is already closed.",
        });
      } else if (
        todayMilliSecondsSinceMidNight < timeAtAttendanceCheckOpenHour
      ) {
        return res.status(409).json({
          success: false,
          message: "This activity attendance checking is not open yet.",
        });
      }
    }

    const validHashString =
      application.id +
      user.userId +
      application.activity_id +
      application.qr_generated_at;
    const validHash = crypto.hash("md5", validHashString);

    if (
      qrObj.hashData !== validHash ||
      user.userId !== application.user_id ||
      qrObj.activityId !== application.activity_id ||
      qrObj.qrGeneratedAt !== application.qr_generated_at
    ) {
      return res.status(400).json({
        success: false,
        message: "This Qr String is invalid.",
      });
    }

    const applicationObj = {
      updated_at: now,
      is_approved: true,
    };

    const updatedApplication = await knex("APPLICATIONS")
      .where({ id: application.id })
      .update(applicationObj)
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
        thaiName: user.firstNameTh + " " + user.lastNameTh,
        studentId: user.studentId,
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
  } catch {
    console.log(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};
