const knex = require("knex")(require("../../../knexfile").development);
const fs = require("fs").promises;
const path = require("path");
const { getCompany } = require("../../../utils/getCompany");

module.exports = async (req, res) => {
  try {
    const user = req.user;
    const activityId = req.params.id;

    if (activityId == ":id" || !activityId) {
      return res.status(404).json({
        success: false,
        message: "Undefined Parameter(s).",
      });
    }

    const activityObj = await knex("ACTIVITIES")
      .where("id", activityId)
      .first();

    if (!activityObj) {
      return res.status(404).json({
        success: false,
        message: "This activity is not found.",
      });
    }

    const activityOnTheSameDay = await knex("ACTIVITIES")
      .where("date", activityObj.date)
      .select("id");

    let actIdArray = [];
    for (let actId in Object.values(activityOnTheSameDay)) {
      actIdArray.push(Object.values(actId));
    }

    const userActivityThatDay = await knex("APPLICATIONS")
      .whereIn("activity_id", actIdArray)
      .andWhere("user_id", user.studentId)
      .select("id");

    if (userActivityThatDay.length != 0) {
      return res.status(409).json({
        success: false,
        message:
          "The user had already applied for other activities scheduled at that time. Please cancel the other application and try again.",
      });
    }

    const now = new Date(Date.now());

    const activityMilliSecondsSinceMidNight =
      (activityObj.start_time.slice(0, 2) * 60 +
        activityObj.start_time.slice(3, 5)) *
      60 *
      1000;

    const applicationCloseOffHour = await knex("SYSTEM_SETTING")
      .where("name", "application_close_hour")
      .first();
    const applicationCloseOffMilliSecond =
      applicationCloseOffHour * 60 * 60 * 1000;

    const applicationCloseTimeMilliSecond =
      Date.parse(activityObj.date) +
      activityMilliSecondsSinceMidNight -
      applicationCloseOffMilliSecond;

    if (now > applicationCloseTimeMilliSecond) {
      return res.status(409).json({
        success: false,
        message:
          "This activity registration is closed. Please apply for other activities or try again when someone has canceled.",
      });
    }

    const activityParticipantArr = await knex("APPLICATIONS")
      .where("activity_id", activityId)
      .andWhere("is_canceled", false)
      .select("id");

    if (activityParticipantArr.length >= activityObj.max_participants) {
      return res.status(409).json({
        success: false,
        message:
          "This activity is fully registered. Please apply for other activities or try again when someone has canceled.",
      });
    }

    const applicationObj = {
      activity_id: activityId,
      user_id: user.studentId,
      created_at: now,
      updated_at: now,
      is_qr_generated: false,
      qr_string: null,
      qr_generated_at: null,
      is_approved: false,
      is_canceled: false,
      cancellation_reason: null,
    };

    const insertedApplication = await knex("APPLICATIONS")
      .insert(applicationObj)
      .returning("*");

    const activitySemesterObj = await knex("SEMESTERS")
      .where({ id: activityObj.semester_id })
      .select("*")
      .first();

    const companyObj = await getCompany(activityObj.company_id);

    const applicationRes = {
      id: insertedApplication.id,
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
      createdAt: insertedApplication.created_at,
      updatedAt: insertedApplication.updated_at,
      isQrGenerated: insertedApplication.is_qr_generated,
      qrString: insertedApplication.qr_string,
      qrGeneratedAt: insertedApplication.qr_generated_at,
      isApproved: insertedApplication.is_approved,
      isCanceled: insertedApplication.is_canceled,
      cancellationReason: insertedApplication.cancellation_reason,
    };

    return res.status(201).json({
      success: true,
      application: applicationRes,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
