"use strict";

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

module.exports.handler = async (event) => {
  const { id } = event.pathParameters;
  const { name, description } = JSON.parse(event.body);

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name is a required field." }),
    };
  }

  const dynamoParams = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { id },
    UpdateExpression: "set #name = :name, description = :description",
    ExpressionAttributeNames: {
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":description": description || null,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamoDb.update(dynamoParams).promise();

    const snsParams = {
      Message: `An item has been updated: ${JSON.stringify(result.Attributes)}`,
      TopicArn: process.env.SNS_TOPIC_ARN,
    };
    await sns.publish(snsParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update item." }),
    };
  }
};