// netlify/functions/createOrder.js
const Razorpay = require('razorpay');

// Initialize Razorpay with your keys
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,      // Your test key
    key_secret: process.env.RAZORPAY_KEY_SECRET // Your secret key (SAFE HERE)
});

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { amount, currency, receipt } = JSON.parse(event.body);

        // Validate input
        if (!amount || !currency) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing amount or currency' })
            };
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount,           // Amount in paisa
            currency: currency,       // INR
            receipt: receipt,         // Unique identifier
            notes: {
                created_at: new Date().toISOString()
            }
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

    } catch (error) {
        console.error('Razorpay Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to create order',
                message: error.message 
            })
        };
    }
};
