
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
  tls: {
    rejectUnauthorized: true,
  },
});

async function sendBookingConfirmation({
  customer,
  vehicle,
  startDate,
  endDate,
  totalPrice,
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials are missing.");
  }

  if (!customer.email) {
    throw new Error("Customer email address is missing.");
  }

  return transporter.sendMail({
    from: `"DriveEasy" <${process.env.EMAIL_USER.trim()}>`,
    to: customer.email,
    subject: "DriveEasy Booking Confirmation",
    text: `Hello ${customer.fullName},

Your DriveEasy vehicle booking has been created successfully.

Vehicle: ${vehicle.brand} ${vehicle.model}
Rental dates: ${startDate} to ${endDate}
Total cost: PHP ${Number(totalPrice).toFixed(2)}

Thank you for choosing DriveEasy!

DriveEasy Vehicle Rental Team`,
  });
}

module.exports = { sendBookingConfirmation };
