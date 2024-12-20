const knex = require("knex")(require("../../../knexfile").development);
const { getCompany } = require("../../../utils/getCompany");

module.exports = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);

    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

  const user = req.user;

  const now = new Date(Date.now() + Number(process.env.TIME_OFFSET_MS));
  console.log(`current time: ${now}`);

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
    .where({ id: applicationObj.activity_id })
    .select("*")
    .first();

  if (!activityObj) {
    return res.status(404).json({
      success: false,
      message: "This activity is not found.",
    });
  }

  if (
    user.studentId !== applicationObj.user_id &&
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

  // Retrieve attendance check open and close hours from SYSTEM_SETTING
  const attendanceCheckOpenHourSetting = await knex("SYSTEM_SETTING")
    .where("name", "attendance_check_open_hour")
    .first();
  const attendanceCheckCloseHourSetting = await knex("SYSTEM_SETTING")
    .where("name", "attendance_check_close_hour")
    .first();
  
  const attendanceCheckOpenHour = parseFloat(attendanceCheckOpenHourSetting.value);
  const attendanceCheckCloseHour = parseFloat(attendanceCheckCloseHourSetting.value);

  console.log(`attendanceCheckOpenHour ${attendanceCheckOpenHour}, attendanceCheckCloseHour ${attendanceCheckCloseHour}`);
  
  // Parse activity date and times to construct Date objects
  const activityDate = new Date(activityObj.date);
  
  // Activity start datetime
  const [startHour, startMinute] = activityObj.start_time.split(":").map(Number);
  const activityStartDateTime = new Date(activityDate);
  activityStartDateTime.setHours(startHour, startMinute, 0, 0);
  
  // Activity end datetime
  const [endHour, endMinute] = activityObj.end_time.split(":").map(Number);
  const activityEndDateTime = new Date(activityDate);
  activityEndDateTime.setHours(endHour, endMinute, 0, 0);
  
  // Calculate attendance check open and close times
  const attendanceCheckOpenTime = new Date(activityStartDateTime);
  console.log(`attendanceCheckOpenTime ${attendanceCheckOpenTime}`);
  console.log(`attendanceCheckOpenTime.getHours() - attendanceCheckOpenHour ${attendanceCheckOpenTime.getHours() - attendanceCheckOpenHour}`);
  attendanceCheckOpenTime.setHours(attendanceCheckOpenTime.getHours() - attendanceCheckOpenHour);
  
  const attendanceCheckCloseTime = new Date(activityEndDateTime);
  console.log(`attendanceCheckCloseTime ${attendanceCheckCloseTime}`);
  console.log(`attendanceCheckCloseTime.getHours() + attendanceCheckCloseHour ${attendanceCheckCloseTime.getHours() + attendanceCheckCloseHour}`);
  attendanceCheckCloseTime.setHours(attendanceCheckCloseTime.getHours() + attendanceCheckCloseHour);

  console.log(`attendanceCheckOpenTime ${attendanceCheckOpenTime}, attendanceCheckCloseTime ${attendanceCheckCloseTime}`);
  
  // Validate attendance check time window
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

  if (!applicationObj.is_qr_generated) {
    const qrString = `/admin/application/check/${applicationId}?profile=${user.profileImageUrl}`;
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

  console.log(activityObj.semester_id);

  const activitySemesterObj = await knex("SEMESTERS")
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
} catch(error) {
  console.error(error);
  return res.status(500).json({
    success: false,
    message: "An error occurred.",
  });
}
};
