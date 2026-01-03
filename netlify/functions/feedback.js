// netlify/functions/feedback.js

const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { fbname, fbemail, fbsubject, fbmessage } = JSON.parse(event.body);

        // Validate inputs
        if (!fbname || !fbemail || !fbsubject || !fbmessage) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,      // Store in Netlify env vars
                pass: process.env.EMAIL_PASS       // App password
            }
        });

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'mentionmodelx@richemail.com',
            replyTo: fbemail,
            subject: `Feedback from ${fbname}: ${fbsubject}`,
            html: `
                <h3>Feedback Submission</h3>
                <p><strong>Name:</strong> ${fbname}</p>
                <p><strong>Email:</strong> ${fbemail}</p>
                <p><strong>Subject:</strong> ${fbsubject}</p>
                <p><strong>Message:</strong></p>
                <p>${fbmessage.replace(/\n/g, '<br>')}</p>
                <hr>
                <p style="color: #999; font-size: 12px;">Submitted at: ${new Date().toLocaleString()}</p>
            `
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Feedback sent successfully' })
        };

    } catch (error) {
        console.error('Feedback error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                error: error.message 
            })
        };
    }
};
