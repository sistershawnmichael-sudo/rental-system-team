
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY?.trim());

async function sendBookingConfirmation({
  customer,
  vehicle,
  startDate,
  endDate,
  totalPrice,
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing in Render Environment.");
  }

  if (!customer?.email?.trim()) {
    throw new Error("Customer email address is missing.");
  }

  const result = await resend.emails.send({
    from: "DriveEasy <onboarding@resend.dev>",
    to: [customer.email.trim()],
    subject: "DriveEasy Booking Confirmation",
    text: `Hello ${customer.fullName},

Your DriveEasy vehicle booking has been created successfully.

Vehicle: ${vehicle.brand} ${vehicle.model}
Rental dates: ${startDate} to ${endDate}
Total cost: PHP ${Number(totalPrice).toFixed(2)}

Thank you for choosing DriveEasy!

DriveEasy Vehicle Rental Team`,
  });

  if (result.error) {
    console.error("Resend email error:", result.error);
    throw new Error(result.error.message || "Resend failed to send email.");
  }

  console.log("Booking confirmation email accepted:", result.data?.id);

  return result.data;
}

module.exports = { sendBookingConfirmation };
