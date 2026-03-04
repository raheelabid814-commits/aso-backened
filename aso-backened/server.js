const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let otpStorage = {}; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: 'astralswordonline@gmail.com', 
        pass: 'lgew sgsp tngr spxk' 
    }
});

app.post('/register', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = otp;

    try {
        await transporter.sendMail({
            from: '"Astral Sword Online" <astralswordonline@gmail.com>',
            to: email,
            subject: 'ASO - Verification Code',
            html: `<h1>Your Code: ${otp}</h1>`
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otpStorage[email] === otp) {
        delete otpStorage[email];
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

// RAILWAY KE LIYE YE LINE ZAROORI HAI
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});