import nodeMailer from "nodemailer";

export const sendEmail = async (options) => {
  const smtpUser = process.env.SMTP_MAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpUser || !smtpPassword) {
    throw new Error("SMTP credentials are not configured");
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure =
    String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

  const transportOptions = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  };

  const transporter = nodeMailer.createTransport(transportOptions);
  const mailOptions = {
    from: smtpUser,
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:options.htmlMessage,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
  } catch (error) {
    if (
      error?.responseCode === 535 ||
      /BadCredentials|Username and Password not accepted/i.test(
        error?.message || "",
      )
    ) {
      throw new Error(
        "Gmail rejected the SMTP login. Use a Google App Password with 2-Step Verification enabled, and set SMTP_PASSWORD to that app password.",
      );
    }

    throw error;
  }
};
