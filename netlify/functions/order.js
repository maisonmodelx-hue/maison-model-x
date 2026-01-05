const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // App password (not regular password)
      }
    });

    // Format order details
    const orderDetails = `
      NEW ORDER SUBMISSION
      ====================
      
      Contact Information:
      - Name: ${data.clientname}
      - Email: ${data.clientemail}
      - Phone: +${data.countrycode} ${data.clientphone}
      - Brand: ${data.brandname}
      
      Requirements:
      ${data.requirements}
      
      Submitted: ${new Date().toLocaleString()}
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'maisonmodelx@gmail.com',
      subject: `New Order - ${data.brandname}`,
      text: orderDetails,
      replyTo: data.clientemail
    });

    // Send confirmation to client
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.clientemail,
      subject: 'Order Confirmation - Maison Model X',
      text: `Dear ${data.clientname},

Thank you for your order! We've received your requirements and will review them shortly.

We'll contact you within 24 hours to discuss your project in detail.

Requirements Summary:
${data.requirements}

Best regards,
Maison Model X Team

---
This is an automated confirmation. Please do not reply to this email.
For questions, contact: maisonmodelx@gmail.com`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Order submitted successfully',
        success: true 
      })
    };

  } catch (error) {
    console.error('Order submission error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to submit order',
        error: error.message 
      })
    };
  }
};
