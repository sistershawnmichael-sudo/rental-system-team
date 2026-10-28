
const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

async function sendBookingConfirmation({
  customer,
  vehicle,
  startDate,
  endDate,
  totalPrice,
}) {
  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing.");
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

  console.log("Booking confirmation email sent:", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });

  return info;
}

module.exports = { sendBookingConfirmation };
