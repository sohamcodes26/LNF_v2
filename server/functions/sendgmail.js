import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const random_num = () => Math.floor(Math.random() * 10);

const otp_generator = () => {
  return `${random_num()}${random_num()}${random_num()}${random_num()}${random_num()}${random_num()}`;
};

export const sendmail = async (rec_mail) => {
  const otp = otp_generator();

  try {
    await resend.emails.send({
      from: process.env.otp_mail,   // must be your verified sender in Resend
      to: rec_mail,
      subject: 'Your One-Time Password (OTP) Code',
      text: `Hello,\n\nYour one-time password (OTP) is:\n\n${otp}\n\nThis code will expire in 10 minutes.`,
    });

    console.log(`✅ OTP sent to ${rec_mail}`);
    return otp;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    throw new Error('Failed to send OTP email.');
  }
};
