"use strict";

module.exports.handler = async (event) => {
  console.log("Received SNS notification:");
  console.log(JSON.stringify(event.Records[0].Sns, null, 2));
  return;
};