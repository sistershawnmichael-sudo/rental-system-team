
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
});

async function sendBookingConfirmation({
  customer,
  vehicle,
  startDate,
  endDate,
  totalPrice,
}) {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass) {
    throw new Error(
      "Email credentials are missing. Check EMAIL_USER and EMAIL_PASS in .env."
    );
  }

  if (!customer?.email?.trim()) {
    throw new Error("Customer email address is missing.");
  }

  const recipient = customer.email.trim();

  const mailOptions = {
    from: `"DriveEasy" <${emailUser}>`,
    to: recipient,
    subject: "DriveEasy Booking Confirmation",
    text: `Hello ${customer.fullName},

Your DriveEasy vehicle booking has been created successfully.

Vehicle: ${vehicle.brand} ${vehicle.model}
Rental dates: ${startDate} to ${endDate}
Total cost: PHP ${Number(totalPrice).toFixed(2)}

Thank you for choosing DriveEasy!

DriveEasy Vehicle Rental Team`,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Email sender:", emailUser);
  console.log("Email recipient:", recipient);
  console.log("Accepted recipients:", info.accepted);
  console.log("Rejected recipients:", info.rejected);
  console.log("Email message ID:", info.messageId);
  console.log("Mail server response:", info.response);

  return info;
}

module.exports = { sendBookingConfirmation };
