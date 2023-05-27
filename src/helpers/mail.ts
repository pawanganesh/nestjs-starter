import { createTransport, SendMailOptions } from 'nodemailer';
import { Printer } from './printer';
import { SMTP } from 'src/constant';

const transporter = createTransport({
  host: SMTP.SMTP_HOST,
  port: SMTP.SMTP_PORT,
  secure: SMTP.SMTP_SECURE,
  auth: {
    user: SMTP.SMTP_USER,
    pass: SMTP.SMTP_PASSWORD,
  },
});

export const sendMail = async (options: SendMailOptions) => {
  try {
    options.from = `${SMTP.SMTP_USER} <${SMTP.SMTP_FROM_NAME}>`;
    const result = await transporter.sendMail(options);
    Printer('SEND MAIL RESULT START', result);
  } catch (err) {
    Printer('SEND MAIL ERROR START', err);
  }
};
