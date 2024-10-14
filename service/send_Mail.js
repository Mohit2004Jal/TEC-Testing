const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
async function sendEmailAlert(subject, message) {
    const mailOptions = {
        from: "mohitdavar2004@gmail.com",
        to: "davarrajni@gmail.com",
        subject,
        text: message
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        console.log(`Alert: ${subject}`);
    } catch (error) { console.error("Error sending email:", error) }
}

module.exports = { sendEmailAlert }