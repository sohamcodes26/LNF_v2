import nodemailer from 'nodemailer';

const random_num = () => {
    let randomInt = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    return randomInt;
};

const otp_generator = () => {
    const otp = `${random_num()}${random_num()}${random_num()}${random_num()}${random_num()}${random_num()}`;
    return otp;
};

export const sendmail = async (rec_mail) => {
    
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_USER,
            pass: process.env.BREVO_PASS,
        }
    });

    const otp = otp_generator();

    const mailOption = {
        from: `Lost & Found <${process.env.BREVO_USER}>`,
        to: rec_mail,
        subject: 'Your One-Time Password (OTP) Code',
        text: `Hello New User,\n\nYour one-time password (OTP) for Lost & Found authentication is:\n\n${otp}\n\nThis code will expire in 10 minutes. Please use it to complete your action. If you did not request this OTP, please ignore this email.\n\nThank you,\nLost & Found Team`
    };

    try {
        await transporter.sendMail(mailOption);
        return otp;
    } catch (err) {
        console.error('Error sending email:', err);
        throw new Error('Failed to send OTP email.');
    }
};