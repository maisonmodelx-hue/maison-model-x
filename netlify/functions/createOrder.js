// netlify/functions/createOrder.js
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

function getRazorpayPublicKey() {
  return process.env.RAZORPAY_KEY_ID;
}

// 🔥 ADD THIS FUNCTION RIGHT HERE (after razorpay init, before exports.handler)
function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  return generatedSignature === signature;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // ✅ NEW: Handle GET request for fetching key
    return {
      statusCode: 200,
      body: JSON.stringify({
        key: getRazorpayPublicKey()
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const bodyData = JSON.parse(event.body || '{}');

    // 🔥 NEW ENDPOINT: /createOrder (for creating orders)
    if (bodyData.action === 'createOrder') {
      const { amount, currency, receipt } = bodyData;

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
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency
        })
      };
    }

    // 🔥 NEW ENDPOINT: /verifyPayment (for payment verification)
    if (bodyData.action === 'verifyPayment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = bodyData;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            success: false, 
            message: 'Missing Razorpay payment details' 
          })
        };
      }

      // VERIFY PAYMENT SIGNATURE
      const isAuthentic = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET
      );

      if (!isAuthentic) {
        console.error('Payment signature verification failed');
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            success: false, 
            message: 'Payment verification failed' 
          })
        };
      }

      // FETCH ORDER DETAILS TO CONFIRM PAYMENT STATUS
      const order = await razorpay.orders.fetch(razorpay_order_id);
      
      if (order.status !== 'paid') {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            success: false, 
            message: 'Payment not completed' 
          })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Payment verified successfully',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id
        })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid action' })
    };

  } catch (error) {
    console.error('Razorpay Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Failed to process request'
      })
    };
  }
};

