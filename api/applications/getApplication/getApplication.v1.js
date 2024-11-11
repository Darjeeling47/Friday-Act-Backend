const knex = require("knex")(require("../../../knexfile").development);

module.exports = async (req, res, next) => {
  try {
    const applicationId = req.params.id;

    const application = await knex("APPLICATIONS")
      .where({ id: applicationId })
      .select("*")
      .first();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "This application is not found.",
      });
    }

    const userObj = null;

    const activityObj = await knex("ACTIVITIES")
      .where({ id: activityId })
      .select("*")
      .first();

    const applicationRes = {
      id: insertedApplication.id,
      user: {
        id: userObj.id,
        thaiName: userObj.firstNameTh + " " + userObj.lastNameTh,
        studentId: userObj.studentId,
      },
      activity: activityObj, // to remove unused attribute
      createdAt: application.created_at, // ask if use inserted value
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
      application: applicationRes,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};
