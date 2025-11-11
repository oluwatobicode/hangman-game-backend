const resend = require("resend");

require("dotenv").config({ path: "./config.env" });

const resendClient = new resend.Resend(process.env.RESEND_EMAIL);

exports.sendEmail = async (email, username, subject) => {
  try {
    resendClient.emails.send({
      from: "Coding Ninja 🥷🏾 <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: `
        <h1>🎉 Welcome ${username}! 🎉</h1>
        <p>Thanks for joining Hangman Game!</p>
        <p>Get ready to guess some words and have fun!</p>
        <a href="#">Start Playing</a>
        <p>Happy guessing! 🎉</p>
        <p>Best regards,<br/> Coding Ninja 🥷🏾</p>
      `,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};
