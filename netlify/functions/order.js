const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const orderData = JSON.parse(event.body);

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Format order data for email
    const emailContent = `
      New Order Received
      
      CLIENT DETAILS:
      Name: ${orderData.clientname || 'N/A'}
      Email: ${orderData.clientemail || 'N/A'}
      Phone: ${orderData.clientphone || 'N/A'}
      
      BRAND DETAILS:
      Brand Name: ${orderData.brandname || 'N/A'}
      
      MODEL & GARMENT INFO:
      ${Object.keys(orderData)
        .filter(key => key.startsWith('model_') || key.startsWith('garment_'))
        .map(key => `${key}: ${orderData[key]}`)
        .join('\n')}
      
      ADDITIONAL NOTES:
      ${orderData.basicRequirements || 'None'}
      
      Timestamp: ${new Date().toISOString()}
    `;

    // Send email to business address
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'machinemodelx@redgmail.com',
      subject: `New Order from ${orderData.clientname}`,
      text: emailContent
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Order submitted successfully' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit order', details: error.message })
    };
  }
};
