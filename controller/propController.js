const dotenv = require('dotenv');
dotenv.config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

const docClient = new DynamoDBClient({ regions: process.env.AWS_REGION });
const coursevilleUtils = require('../utils/coursevilleUtils');

exports.getProps = async (req, res) => {
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${req.session.token.access_token}`,
      },
    };
    const profile = await coursevilleUtils.getProfileInformation(options);
    const courses = await coursevilleUtils.getCourses(options);
    const assignments = await coursevilleUtils.getAssignments(options);
    const params = {
      TableName: process.env.aws_reminders_table_name,
      Key: {
        user_id: profile.user.id,
      },
    };
    const reminders = await docClient.send(new ScanCommand(params));
    res.send({
      courses: courses,
      assignments: assignments,
      reminders: reminders.Items,
    });
    res.end();
  } catch (error) {
    console.error(error);
    res.send({ error: error });
    res.end();
  }
};
