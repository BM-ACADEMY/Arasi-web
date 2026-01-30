const sendEmail = require("../utils/sendEmail");

// @desc    Send Contact Form Data to Admin Email
// @route   POST /api/contact
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }

    // --- HTML Template for Admin ---
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; color: #fff; text-align: center;">
          <h2 style="margin: 0;">New Contact Inquiry</h2>
        </div>
        <div style="padding: 20px; background-color: #fff;">
          <p style="color: #555;">You have received a new message from your website contact form.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${phone || "Not Provided"}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${subject || "General Inquiry"}</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Message:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; color: #333; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          This email was sent from your website contact form.
        </div>
      </div>
    `;

    // Send Email to Admin (using your SMTP_USER from .env)
    await sendEmail({
      email: process.env.SMTP_USER, // Send to yourself/admin
      subject: `New Inquiry: ${subject} - ${name}`,
      message: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`, // Fallback text
      html: emailContent,
    });

    res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (error) {
    console.error("Contact Email Error:", error);
    res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
  }
};