require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.YAHOO_EMAIL,
    pass: process.env.YAHOO_APP_PASSWORD,
  },
});

transporter.verify(function (err, success) {
  if (err) {
    console.error("SMTP config error :", err);
  } else {
    console.log("Yahoo SMTP Ready to sent");
  }
});

app.post("/api/send-form", async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, message, mobile } = req.body;
    console.log("Condition Check::", !name || !email || !message || !mobile);

    if (!name || !email || !message || !mobile) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields" });
    }

    const mailOptions = {
      from: `"Website Form" <${process.env.YAHOO_EMAIL}>`, // sender address
      to: process.env.YAHOO_EMAIL, // send to your yahoo inbox
      subject: `New form submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\nMobile:\n${mobile}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mobile No:</strong> ${mobile}</p>
             <p><strong>Message:</strong><br/>${message.replace(
               /\n/g,
               "<br/>"
             )}</p>`,
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);
    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ ok: false, error: "Failed to send email" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Server is running! port no :", port));
