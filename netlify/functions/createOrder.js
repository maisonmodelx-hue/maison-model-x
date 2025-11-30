// netlify/functions/createOrder.js
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { amount, currency, receipt } = JSON.parse(event.body || '{}');

    if (!amount || !currency) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Missing amount or currency' })
      };
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt
    });

    return {
      statusCode
