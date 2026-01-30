const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: 465, // SSL Port
      secure: true, // true for 465
      auth: {
        user: process.env.SMTP_USER, // Matches .env
        pass: process.env.SMTP_PASS, // Matches .env
      },
      // Timeouts to prevent "Unexpected socket close"
      connectionTimeout: 10000, 
      greetingTimeout: 10000,   
      socketTimeout: 10000,     
    });

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message, // Plain text body
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log("✅ Email sent: %s", info.messageId);

  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
};

module.exports = sendEmail;