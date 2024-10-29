const knex = require("knex")(require("../../../knexfile").development);
const fs = require("fs").promises;
const path = require("path");

module.exports = async (req, res) => {
  try {
    const user = req.user;
    const { activityId } = req.params;

    if (!activityId) {
      return res.status(404).json({
        success: false,
        message: "This activity is not found.",
      });
    }

    const activityObj = await knex("ACTIVITIES")
      .where("activity_id", activityId)
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

    const userActivityThatDay = await knex("APPLICATIONS")
      .whereIn("activity_id", activityOnTheSameDay)
      .andWhere("user_id", user.userId)
      .select("id");

    if (userActivityThatDay) {
      return res.status(409).json({
        success: false,
        message:
          "The user had already applied for other activities scheduled at that time. Please cancel the other application and try again.",
      });
    }

    const now = Date.now();

    const activityMilliSecondsSinceMidNight =
      (activityObj.start_time.slice(0, 2) * 60 +
        activityObj.start_time.slice(3,5)) *
      60 *
      1000;

      const applicationCloseOffHour = await knex("SYSTEM_SETTING")
      .where("name", "application_close_hour")
      .first();
      const applicationCloseOffMilliSecond = applicationCloseOffHour * 60 * 60 * 1000

    const applicationCloseTimeMilliSecond = Date.parse(activityObj.date) + activityMilliSecondsSinceMidNight - applicationCloseOffMilliSecond

    if (now > applicationCloseTimeMilliSecond) {
      return res.status(409).json({
        success: false,
        message: "This activity is fully registered. Please apply for other activities or try again when someone has canceled."
      })
    }

    const activityParticipantArr = await knex("APPLICATIONS")
      .where("activity_id", activityId)
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
      user_id: user.userId,
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

    const activitySemesterObj = await knex("SEMESTER")
      .where({ id: activityObj.semester_id })
      .select("*")
      .first();

    const companyObj = await getCompany(activityIdObj.company_id);

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
        date: activityIdObj.date,
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
