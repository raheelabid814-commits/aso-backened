const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MY_EMAIL = 'astralswordonline@gmail.com'; 
const APP_PASSWORD = 'lgew sgsp tngr spxk'; 

let otpStorage = {}; // OTPs temporarily save karne ke liye

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: MY_EMAIL, pass: APP_PASSWORD }
});

app.post('/register', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = otp;

    const mailOptions = {
        from: `"Astral Sword Online" <${MY_EMAIL}>`,
        to: email,
        subject: 'ASO - 6 Digit Verification Code',
        html: `<div style="background:#0f172a; color:white; padding:20px; text-align:center; border:1px solid #f59e0b;">
               <h1 style="color:#f59e0b;">VERIFICATION CODE</h1>
               <p>Your 6-digit code for Astral ID is:</p>
               <h2 style="letter-spacing:10px; font-size:40px;">${otp}</h2>
               </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otpStorage[email] && otpStorage[email] === otp) {
        delete otpStorage[email];
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
