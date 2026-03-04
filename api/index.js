const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ye temporary hai, Vercel par server restart hone par reset ho jayega
let otpStorage = {}; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'astralswordonline@gmail.com', pass: 'lgew sgsp tngr spxk' }
});

app.post('/api/register', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = otp;

    try {
        await transporter.sendMail({
            from: '"Astral Sword Online" <astralswordonline@gmail.com>',
            to: email,
            subject: 'ASO - Verification Code',
            html: `<h1>Code: ${otp}</h1>`
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otpStorage[email] === otp) {
        delete otpStorage[email];
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

module.exports = app;