const nodemailer = require("nodemailer");
require("dotenv").config();

const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

async function send_Email_Alert(subject, message) {
    const mailOptions = {
        from: process.env.EMAIL, // Use environment variable for sender email
        to: "davarrajni@gmail.com", // Consider parameterizing this for flexibility
        subject,
        text: message,
    };

    try {
        // Validate transporter configuration
        if (!emailTransporter || !emailTransporter.transporter) {
            throw new Error("Email transporter is not configured correctly.");
        }

        await emailTransporter.sendMail(mailOptions);
        console.log(`\x1b[42m Email Sent: ${subject} \x1b[0m`);
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error sending email: ${error.message}`);

        if (error.response) {
            console.error(`Response data: ${error.response.data}`);
            console.error(`Response status: ${error.response.status}`);
        }

        console.error("Failed to send email alert. Please check your email configuration.");
    }
}

module.exports = {
    send_Email_Alert
};
