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

function send_Email_Alert(subject, message) {
    const mailOptions = {
        from: process.env.EMAIL, 
        to: "davarrajni@gmail.com", 
        subject,
        text: message,
    };

    try {
        emailTransporter.sendMail(mailOptions);
        console.log(`\x1b[42m Email Sent: ${subject} \x1b[0m`);
    }
    catch (error) {
        console.error(`[${new Date().toLocaleString("en-GB")}] Error sending email: ${error.message}`);
    }
}

module.exports = {
    send_Email_Alert
};
