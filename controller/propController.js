const dotenv = require('dotenv');
dotenv.config();
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const docClient = new DynamoDBClient({ regions: process.env.AWS_REGION });
const coursevilleUtils = require('../utils/coursevilleUtils');

exports.getProps = async (req, res) => {
  try {
    const courses = await coursevilleUtils.getCourses(req);
    const assignments = await coursevilleUtils.getAssignments(req);
    const params = {
      TableName: process.env.aws_reminders_table_name,
    };
    const reminders = await docClient.send(new ScanCommand(params));
    res.send({
      courses: courses,
      assignments: assignments,
      reminders: reminders.Items,
    });
    res.end();
  } catch (error) {
    console.log(error);
  }
};
