const dotenv = require('dotenv');
dotenv.config();
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const coursevilleUtils = require('../utils/coursevilleUtils');

const docClient = new DynamoDBClient({ regions: process.env.AWS_REGION });

exports.getReminders = async (req, res) => {
  const profile = await coursevilleUtils.getProfileInformation(req);
  const params = {
    TableName: process.env.aws_reminders_table_name,
    Key: {
      user_id: profile.user.id,
    },
  };
  try {
    const data = await docClient.send(new ScanCommand(params));
    res.send(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

exports.addReminder = async (req, res) => {
  const profile = await coursevilleUtils.getProfileInformation(req);
  const reminder_id = uuidv4();
  const created_date = Date.now();
  const reminder = {
    user_id: profile.user.id,
    reminder_id: reminder_id,
    ...req.body,
    created_date: created_date,
  };

  const params = {
    TableName: process.env.aws_reminders_table_name,
    Item: reminder,
  };
  try {
    const response = await docClient.send(new PutCommand(params));
    res.send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

exports.deleteReminder = async (req, res) => {
  const profile = await coursevilleUtils.getProfileInformation(req);
  const reminder_id = req.params.reminder_id;
  const params = {
    TableName: process.env.aws_reminders_table_name,
    Key: { 
      user_id: profile.user.id, 
      reminder_id: reminder_id 
    },
  };
  try {
    const response = await docClient.send(new DeleteCommand(params));
    res.send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};
