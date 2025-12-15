const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

const TABLE_NAME = process.env.ITEMS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

async function createItem(item) {
    const params = {
        TableName: TABLE_NAME,
        Item: item,
    };
    await dynamodb.put(params).promise();
    await publishSnsNotification('ITEM_CREATED', item);
    return item;
}

async function getItem(id) {
    const params = {
        TableName: TABLE_NAME,
        Key: { id },
    };
    const result = await dynamodb.get(params).promise();
    return result.Item;
}

async function getAllItems() {
    const params = {
        TableName: TABLE_NAME,
    };
    const result = await dynamodb.scan(params).promise();
    return result.Items;
}

async function updateItem(id, updatedAttributes) {
    const params = {
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set ' + Object.keys(updatedAttributes).map(attr => `#${attr} = :${attr}`).join(', '),
        ExpressionAttributeNames: Object.keys(updatedAttributes).reduce((acc, attr) => ({ ...acc, [`#${attr}`]: attr }), {}),
        ExpressionAttributeValues: Object.keys(updatedAttributes).reduce((acc, attr) => ({ ...acc, [`:${attr}`]: updatedAttributes[attr] }), {}),
        ReturnValues: 'ALL_NEW',
    };
    const result = await dynamodb.update(params).promise();
    await publishSnsNotification('ITEM_UPDATED', result.Attributes);
    return result.Attributes;
}

async function deleteItem(id) {
    const params = {
        TableName: TABLE_NAME,
        Key: { id },
    };
    await dynamodb.delete(params).promise();
    await publishSnsNotification('ITEM_DELETED', { id });
    return { message: 'Item deleted' };
}

async function publishSnsNotification(eventType, data) {
    const params = {
        TopicArn: SNS_TOPIC_ARN,
        Message: JSON.stringify({ eventType, data }),
        Subject: `CRUD Event: ${eventType}`,
        MessageAttributes: {
            eventType: {
                DataType: 'String',
                StringValue: eventType,
            },
        },
    };
    await sns.publish(params).promise();
}

module.exports = {
    createItem,
    getItem,
    getAllItems,
    updateItem,
    deleteItem,
};
