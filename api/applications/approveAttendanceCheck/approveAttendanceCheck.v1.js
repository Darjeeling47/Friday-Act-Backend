const crypto = require("node:crypto");
const knex = require("knex")(require("../../../knexfile"));
const { getStudentData } = require("../../../utils/getStudentData");

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { qrString } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Application id is missing.",
      });
    }

    if (typeof qrString !== "string") {
      return res.status(400).json({
        success: false,
        message: "The Qr String is missing.",
      });
    }

    const applicationId = parseInt(id, 10);

    // Retrieve application, activity, semester, and company data in one query
    const applicationData = await knex("APPLICATIONS as app")
      .join("ACTIVITIES as act", "app.activity_id", "act.id")
      .join("SEMESTER as sem", "act.semester_id", "sem.id")
      .join("COMPANY as comp", "act.company_id", "comp.id")
      .select(
        "app.*",
        "act.date as activity_date",
        "act.start_time",
        "act.end_time",
        "act.name as activity_name",
        "act.company_id",
        "sem.year as semester_year",
        "sem.semester as semester_semester",
        "comp.companyNameTh as company_name",
        "comp.logoUrl as company_logo"
      )
      .where("app.id", applicationId)
      .first();

    if (!applicationData) {
      return res.status(404).json({
        success: false,
        message: "This application is not found.",
      });
    }

    const application = applicationData;

    // Validations
    if (!application.is_qr_generated) {
      return res.status(409).json({
        success: false,
        message:
          "You cannot approve attendance check for an application that has not generated a QR code.",
      });
    }

    if (application.is_approved) {
      return res.status(409).json({
        success: false,
        message:
          "You cannot approve attendance check for an application that is already approved.",
      });
    }

    if (application.is_canceled) {
      return res.status(409).json({
        success: false,
        message:
          "You cannot approve attendance check for an application that is already canceled.",
      });
    }

    // Retrieve system settings in a single query
    const settings = await knex("SYSTEM_SETTING")
      .whereIn("name", ["attendance_check_open_hour", "attendance_check_close_hour"]);

    const settingsMap = {};
    settings.forEach((setting) => {
      settingsMap[setting.name] = parseFloat(setting.value);
    });

    const attendanceCheckOpenHour = settingsMap["attendance_check_open_hour"];
    const attendanceCheckCloseHour = settingsMap["attendance_check_close_hour"];

    // Time validations
    const now = Date.now();
    const activityDate = new Date(application.activity_date);
    const [startHour, startMinute] = application.start_time.split(":").map(Number);
    const [endHour, endMinute] = application.end_time.split(":").map(Number);

    const activityStart = new Date(activityDate);
    activityStart.setHours(startHour, startMinute, 0, 0);

    const activityEnd = new Date(activityDate);
    activityEnd.setHours(endHour, endMinute, 0, 0);

    const attendanceCheckOpenTime =
      activityStart.getTime() - attendanceCheckOpenHour * 3600000;
    const attendanceCheckCloseTime =
      activityEnd.getTime() + attendanceCheckCloseHour * 3600000;

    if (now < attendanceCheckOpenTime) {
      return res.status(409).json({
        success: false,
        message: "This activity attendance checking is not open yet.",
      });
    }

    if (now > attendanceCheckCloseTime) {
      return res.status(409).json({
        success: false,
        message: "This activity attendance checking is already closed.",
      });
    }

    // Update application
    const [updatedApplication] = await knex("APPLICATIONS")
      .where({ id: application.id })
      .update(
        {
          updated_at: new Date(),
          is_approved: true,
        },
        "*"
      );

    // Get student data
    const user = await getStudentData(application.user_id);

    // Build response
    const applicationRes = {
      id: updatedApplication.id,
      user: {
        id: user.id,
        thaiName: `${user.firstNameTh} ${user.lastNameTh}`,
        studentId: user.studentId,
      },
      activity: {
        id: application.activity_id,
        name: application.activity_name,
        company: {
          id: application.company_id,
          name: application.company_name,
          logoUrl: application.company_logo,
        },
        semester: {
          year: application.semester_year,
          semester: application.semester_semester,
        },
        date: application.activity_date,
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
    });
  }
};