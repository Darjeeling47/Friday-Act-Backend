const { getCompany } = require("../../../utils/getCompany");
const { getStudentData } = require("../../../utils/getStudentData");

const knex = require("knex")(require("../../../knexfile").development);

module.exports = async (req, res, next) => {
  try {
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

    const user = req.user;

    const now = new Date(Date.now() + Number(process.env.TIME_OFFSET_MS));

    // Check if user exist
    const userArray = await getStudentData([userId]);
    const userObj = userArray.items.at(0);

    // Check if the activity id exist
    const activityIdObj = await knex("ACTIVITIES")
      .where({ id: activityId })
      .select("*")
      .first();

    if (!activityIdObj) {
      return res.status(404).json({
        success: false,
        message: "This activity is not found.",
      });
    }

    if (typeof createdAt == "undefined" || isNaN(Date.parse(createdAt))) {
      createdAt = now;
    }
    if (typeof updatedAt == "undefined" || isNaN(Date.parse(updatedAt))) {
      updatedAt = now;
    }

    if (
      typeof isQrGenerated == "undefined" ||
      typeof isQrGenerated != "boolean"
    ) {
      isQrGenerated = false;
    }

    if (
      typeof qrGeneratedAt == "undefined" ||
      isNaN(Date.parse(qrGeneratedAt))
    ) {
      qrGeneratedAt = now;
    }

    if (typeof isApproved == "undefined" || typeof isApproved != "boolean") {
      isApproved = false;
    }

    if (typeof isCanceled == "undefined" || typeof isCanceled != "boolean") {
      isCanceled = false;
    }

    if (typeof qrString == "undefined" || typeof qrString != "string") {
      qrString = null;
    }

    if (
      typeof cancellationReason == "undefined" ||
      typeof cancellationReason != "string"
    ) {
      cancellationReason = null;
    }

    const applicationObj = {
      activity_id: activityId,
      user_id: userId,
      created_at: createdAt,
      updated_at: updatedAt,
      is_qr_generated: isQrGenerated,
      qr_string: qrString,
      qr_generated_at: qrGeneratedAt,
      is_approved: isApproved,
      is_canceled: isCanceled,
      cancellation_reason: cancellationReason,
    };

    const insertedApplicationArray = await knex("APPLICATIONS")
      .insert(applicationObj)
      .returning("*");

      
      if (!insertedApplicationArray || insertedApplicationArray.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Internal database malfunction.",
        });
      }

      const insertedApplication = insertedApplicationArray[0]

    const activitySemesterObj = await knex("SEMESTERS")
      .where({ id: activityIdObj.semester_id })
      .select("*")
      .first();

    const companyObj = await getCompany(activityIdObj.company_id);

    const applicationRes = {
      id: insertedApplication.id,
      user: {
        id: userObj.studentId,
        thaiName: userObj.firstNameTh + " " + userObj.lastNameTh,
        studentId: userObj.studentId,
      },
      activity: {
        id: activityIdObj.id,
        name: activityIdObj.name,
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

    res.status(201).json({
      success: true,
      application: applicationRes,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};
