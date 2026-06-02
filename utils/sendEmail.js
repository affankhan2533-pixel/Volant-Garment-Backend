import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `Volant Garment <${process.env.EMAIL_FROM}>`,
    to, subject, html,
  });
};

export const sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.orderItems
    .map((item) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name} (${item.size})</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">×${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">₹${item.price}</td>
    </tr>`)
    .join('');

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed — #${order._id}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#F8F5F0;padding:40px;">
        <h1 style="font-family:Georgia,serif;color:#0F0F0F;letter-spacing:2px;">Volant Garment</h1>
        <h2 style="color:#C8A96B;">Order Confirmed</h2>
        <p>Dear ${user.name}, thank you for your order.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead><tr style="background:#0F0F0F;color:#F8F5F0;">
            <th style="padding:10px;text-align:left;">Item</th>
            <th style="padding:10px;text-align:left;">Qty</th>
            <th style="padding:10px;text-align:left;">Price</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total: ₹${order.totalAmount}</strong></p>
      </div>`,
  });
};

export default sendEmail;
