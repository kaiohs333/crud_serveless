"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { name, description } = body;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name is a required field." }),
    };
  }

  const newItem = {
    id: uuidv4(),
    name,
    description: description || null,
    createdAt: new Date().toISOString(),
  };

  const dynamoParams = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: newItem,
  };

  const snsParams = {
    Message: `A new item has been created: ${JSON.stringify(newItem)}`,
    TopicArn: process.env.SNS_TOPIC_ARN,
  };

  try {
    await dynamoDb.put(dynamoParams).promise();
    await sns.publish(snsParams).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(newItem),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create item." }),
    };
  }
};