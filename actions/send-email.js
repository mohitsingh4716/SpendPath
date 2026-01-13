// import { Resend } from "resend";

// export async function sendEmail({to, subject, react}){
//     const resend = new Resend(process.env.RESEND_API_KEY || "");
    
//     try{
//         const data= await resend.emails.send({
//             from: 'SpendPath App <onboarding@resend.dev>',
//             to,
//             subject,
//             react,
//         });

//         return {success: true, data};

//     }catch(error){
//         console.log("Failed to send email:", error);
//         return {success: false, error};
//     }

// }




import nodemailer from "nodemailer";
import { render } from "@react-email/render";

export async function sendEmail({ to, subject, react }) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials are missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Convert React email to HTML
  // const html = render(react);
  const html = await render(react);


  try {
    const info = await transporter.sendMail({
      from: `"SpendPath " <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });

    // console.log("Email sent via Nodemailer", {
    //   to,
    //   messageId: info.messageId,
    // });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email via Nodemailer", {
      to,
      subject,
      error,
    });
    throw error;
  }
}
