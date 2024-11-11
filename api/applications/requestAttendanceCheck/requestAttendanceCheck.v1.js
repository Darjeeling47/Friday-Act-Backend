const crypto = require("node:crypto");

module.exports = async (req, res, next) => {
  const { applicationId } = req.params;

  const user = req.user;

  const now = new Date(Date.now());

  let applicationObj = await knex("APPLICATIONS")
    .where({ id: applicationId })
    .select("*")
    .first();

  if (!applicationObj) {
    return res.status(404).json({
      success: false,
      message: "This application is not found.",
    });
  }

  const activityObj = await knex("ACTIVITIES")
    .where({ id: activityId })
    .select("*")
    .first();

  if (!activityObj) {
    return res.status(404).json({
      success: false,
      message: "This activity is not found.",
    });
  }

  if (
    user.userId !== applicationObj.user_id &&
    user.role !== "applicationAdmin"
  ) {
    return res.status(401).json({
      success: false,
      message: "You cannot request attendance check for others",
    });
  }

  if (applicationObj.is_approved) {
    return res.status(409).json({
      success: false,
      message:
        "You cannot request attendance check the application that is already approved.",
    });
  }

  if (applicationObj.is_canceled) {
    return res.status(409).json({
      success: false,
      message:
        "You cannot request attendance check the application that is already canceled.",
    });
  }

  const attendanceCheckOpenHour = await knex("SYSTEM_SETTING")
    .where("name", "attendance_check_open_hour ")
    .first();

  const attendanceCheckCloseHour = await knex("SYSTEM_SETTING")
    .where("name", "attendance_check_close_hour")
    .first();

  const activityStartMilliSecondsSinceMidNight =
    (activityObj.start_time.slice(0, 2) * 60 +
      activityObj.start_time.slice(3, 5)) *
    60 *
    1000;
  const activityEndMilliSecondsSinceMidNight =
    (activityObj.end_time.slice(0, 2) * 60 + activityObj.end_time.slice(3, 5)) *
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
    } else if (todayMilliSecondsSinceMidNight < timeAtAttendanceCheckOpenHour) {
      return res.status(409).json({
        success: false,
        message: "This activity attendance checking is not open yet.",
      });
    }
  }

  if (!applicationObj.is_qr_generated) {
    const qrData = `${applicationId}-${applicationObj.user_id}-${applicationObj.activity_id}-${now}`;
    const qrHashString = crypto.hash("md5", qrHashString);
    const qrString = `${qrData}-${qrHashString}`;
    const applicationUpdateObj = {
      updated_at: now,
      is_qr_generated: true,
      qr_string: qrString,
      qr_generated_at: now,
    };

    applicationObj = await knex("APPLICATIONS")
      .where({ id: applicationId })
      .update(applicationUpdateObj)
      .returning("*");
  }

  const activitySemesterObj = await knex("SEMESTER")
    .where({ id: activityObj.semester_id })
    .select("*")
    .first();

  const companyObj = await getCompany(activityObj.company_id);

  const applicationRes = {
    id: applicationObj.id,
    user: {
      id: user.id,
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
    createdAt: applicationObj.created_at,
    updatedAt: applicationObj.updated_at,
    isQrGenerated: applicationObj.is_qr_generated,
    qrString: applicationObj.qr_string,
    qrGeneratedAt: applicationObj.qr_generated_at,
    isApproved: applicationObj.is_approved,
    isCanceled: applicationObj.is_canceled,
    cancellationReason: applicationObj.cancellation_reason,
  };

  return res.status(200).json({
    success: true,
    application: applicationRes,
  });
};
