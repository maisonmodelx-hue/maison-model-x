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
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Format feedback
    const feedbackDetails = `
      NEW FEEDBACK SUBMISSION
      =======================
      
      From: ${data.fbname}
      Email: ${data.fbemail}
      Subject: ${data.fbsubject}
      
      Message:
      ${data.fbmessage}
      
      Submitted: ${new Date().toLocaleString()}
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'maisonmodelx@gmail.com',
      subject: `Feedback: ${data.fbsubject}`,
      text: feedbackDetails,
      replyTo: data.fbemail
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Feedback submitted successfully',
        success: true 
      })
    };

  } catch (error) {
    console.error('Feedback submission error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to submit feedback',
        error: error.message 
      })
    };
  }
};
