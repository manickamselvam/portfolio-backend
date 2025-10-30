require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const formData = require("form-data");
const Mailgun = require("mailgun.js");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nagamanickamselvamportfolio.vercel.app",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY, // Your Mailgun private API key
});

app.post("/api/send-form", async (req, res) => {
  try {
    const { name, email, message, mobile } = req.body;
    if (!name || !email || !message || !mobile) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields" });
    }

    // Prepare email data
    const mailData = {
      from: `"Nags Portfolio Form Submissions" <${process.env.MAILGUN_FROM_EMAIL}>`, // verified sender
      to: process.env.MAILGUN_TO_EMAIL, // your inbox
      subject: `New form submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mobile:</strong> ${mobile}</p>
             <p><strong>Message:</strong><br/>${message.replace(
               /\n/g,
               "<br/>"
             )}</p>`,
    };

    // Send email via Mailgun API
    const response = await mg.messages.create(
      process.env.MAILGUN_DOMAIN, // your Mailgun domain
      mailData
    );

    console.log("Message sent:", response);
    res.json({ ok: true, id: response.id });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ ok: false, error: "Failed to send email" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Server running on port", port));
