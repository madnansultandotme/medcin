// Email notification service using nodemailer
import nodemailer from 'nodemailer';

// Email configuration from environment variables
// Supports both GMAIL_* and SMTP_* env variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER || process.env.SMTP_USER,
    pass: process.env.GMAIL_PASSWORD || process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const emailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const emailPass = process.env.GMAIL_PASSWORD || process.env.SMTP_PASSWORD;
    
    if (!emailUser || !emailPass) {
      console.warn('Email service not configured. Missing GMAIL_USER/GMAIL_PASSWORD or SMTP_USER/SMTP_PASSWORD.');
      return false;
    }

    await transporter.sendMail({
      from: `"Medcin Platform" <${emailUser}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, '<br>'),
    });

    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Template: Center Approval Email
export async function sendCenterApprovalEmail(
  centerName: string,
  ownerEmail: string,
  ownerName: string
): Promise<boolean> {
  const subject = '🎉 Your Medical Center Has Been Approved!';
  const text = `
Dear ${ownerName},

Congratulations! Your medical center "${centerName}" has been successfully approved and is now live on the Medcin platform.

What's Next?
✓ Your center is now visible to patients across Southeast Asia
✓ You can start accepting bookings immediately
✓ Update your doctor profiles and availability schedules
✓ Set up your service catalog and pricing

Login to your dashboard to get started:
${process.env.NEXT_PUBLIC_APP_URL || 'https://medcin.health'}/login

Important Notes:
- Patients pay doctors on-site (cash/card at clinic)
- Platform is FREE for centers - no commissions or fees
- You'll receive instant notifications for new bookings

Need help? Contact our support team at support@medcin.health

Best regards,
The Medcin Team
  `.trim();

  const html = `
    <div style="font-family: 'IBM Plex Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 3px solid #1769AA;">
        <h1 style="color: #1769AA; margin: 0; font-size: 28px;">Medcin Platform</h1>
        <p style="color: #5C7185; margin: 5px 0;">Cross-Border Healthcare Booking</p>
      </div>
      
      <div style="padding: 30px 0;">
        <h2 style="color: #102A43; font-size: 22px;">🎉 Center Approved!</h2>
        
        <p style="color: #102A43; line-height: 1.6;">Dear ${ownerName},</p>
        
        <p style="color: #102A43; line-height: 1.6;">
          Congratulations! Your medical center <strong>"${centerName}"</strong> has been successfully approved and is now live on the Medcin platform.
        </p>
        
        <div style="background-color: #F0F7FF; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #1769AA; margin-top: 0;">What's Next?</h3>
          <ul style="color: #102A43; line-height: 1.8; padding-left: 20px;">
            <li>Your center is now visible to patients across Southeast Asia</li>
            <li>You can start accepting bookings immediately</li>
            <li>Update your doctor profiles and availability schedules</li>
            <li>Set up your service catalog and pricing</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://medcin.health'}/login" 
             style="background-color: #1769AA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            Login to Dashboard
          </a>
        </div>
        
        <div style="background-color: #FFF9E6; padding: 15px; border-left: 4px solid #FFA500; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #102A43; margin-top: 0; font-size: 16px;">📌 Important Notes:</h4>
          <ul style="color: #5C7185; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Patients pay doctors on-site (cash/card at clinic)</li>
            <li>Platform is <strong>FREE for centers</strong> - no commissions or fees</li>
            <li>You'll receive instant notifications for new bookings</li>
          </ul>
        </div>
        
        <p style="color: #5C7185; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          Need help? Contact our support team at <a href="mailto:support@medcin.health" style="color: #1769AA;">support@medcin.health</a>
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px 0; border-top: 1px solid #D7E7F5; color: #5C7185; font-size: 12px;">
        <p>© 2026 Medcin Platform. All rights reserved.</p>
        <p>Cross-border medical booking across Singapore, Thailand & Malaysia</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: ownerEmail,
    subject,
    text,
    html,
  });
}

// Template: Center Rejection Email
export async function sendCenterRejectionEmail(
  centerName: string,
  ownerEmail: string,
  ownerName: string,
  reason?: string
): Promise<boolean> {
  const subject = 'Update on Your Medical Center Application';
  const text = `
Dear ${ownerName},

Thank you for your interest in joining the Medcin platform.

After reviewing your application for "${centerName}", we are unable to approve your center at this time.

${reason ? `Reason: ${reason}` : ''}

What You Can Do:
- Verify all regulatory licenses and certifications
- Ensure complete facility information
- Contact our support team for specific feedback

You can resubmit your application after addressing the concerns.

For assistance, please contact: support@medcin.health

Best regards,
The Medcin Vetting Team
  `.trim();

  const html = `
    <div style="font-family: 'IBM Plex Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 3px solid #1769AA;">
        <h1 style="color: #1769AA; margin: 0; font-size: 28px;">Medcin Platform</h1>
      </div>
      
      <div style="padding: 30px 0;">
        <p style="color: #102A43; line-height: 1.6;">Dear ${ownerName},</p>
        
        <p style="color: #102A43; line-height: 1.6;">
          Thank you for your interest in joining the Medcin platform.
        </p>
        
        <p style="color: #102A43; line-height: 1.6;">
          After reviewing your application for <strong>"${centerName}"</strong>, we are unable to approve your center at this time.
        </p>
        
        ${reason ? `
        <div style="background-color: #FFF0F0; padding: 15px; border-left: 4px solid #DC2626; border-radius: 6px; margin: 20px 0;">
          <p style="color: #102A43; margin: 0;"><strong>Reason:</strong> ${reason}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #F0F7FF; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #1769AA; margin-top: 0;">What You Can Do:</h3>
          <ul style="color: #102A43; line-height: 1.8; padding-left: 20px;">
            <li>Verify all regulatory licenses and certifications</li>
            <li>Ensure complete facility information</li>
            <li>Contact our support team for specific feedback</li>
          </ul>
        </div>
        
        <p style="color: #5C7185; font-size: 14px; line-height: 1.6;">
          For assistance, please contact: <a href="mailto:support@medcin.health" style="color: #1769AA;">support@medcin.health</a>
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px 0; border-top: 1px solid #D7E7F5; color: #5C7185; font-size: 12px;">
        <p>© 2026 Medcin Platform. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: ownerEmail,
    subject,
    text,
    html,
  });
}

// Template: Booking Confirmation Email (to Patient)
export async function sendBookingConfirmationEmail(
  patientName: string,
  patientEmail: string,
  bookingReference: string,
  doctorName: string,
  clinicName: string,
  serviceName: string,
  date: string,
  time: string,
  price: number
): Promise<boolean> {
  const subject = `Booking Confirmed: ${bookingReference}`;
  const text = `
Dear ${patientName},

Your appointment has been confirmed!

Booking Reference: ${bookingReference}

Appointment Details:
Doctor: ${doctorName}
Clinic: ${clinicName}
Service: ${serviceName}
Date: ${date}
Time: ${time}
Fee: SGD ${price.toFixed(2)}

Payment: Pay at clinic (cash/card accepted)

Important Reminders:
- Arrive 15 minutes early for registration
- Bring valid ID and insurance card (if applicable)
- If you need to reschedule or cancel, please do so at least 24 hours in advance

View your booking: ${process.env.NEXT_PUBLIC_APP_URL || 'https://medcin.health'}/patient?tab=mybookings

Thank you for choosing Medcin!

Best regards,
The Medcin Team
  `.trim();

  const html = `
    <div style="font-family: 'IBM Plex Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 3px solid #1769AA;">
        <h1 style="color: #1769AA; margin: 0; font-size: 28px;">Medcin Platform</h1>
      </div>
      
      <div style="padding: 30px 0;">
        <h2 style="color: #10B981; font-size: 22px;">✓ Booking Confirmed!</h2>
        
        <p style="color: #102A43; line-height: 1.6;">Dear ${patientName},</p>
        
        <p style="color: #102A43; line-height: 1.6;">
          Your appointment has been successfully confirmed!
        </p>
        
        <div style="background-color: #F0F7FF; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #1769AA;">
          <p style="margin: 0; color: #5C7185; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Booking Reference</p>
          <p style="margin: 5px 0 0 0; color: #1769AA; font-size: 20px; font-weight: 700; font-family: 'IBM Plex Mono', monospace;">${bookingReference}</p>
        </div>
        
        <div style="background-color: #FFFFFF; border: 1px solid #D7E7F5; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #102A43; margin-top: 0; font-size: 16px;">Appointment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #5C7185; font-size: 14px;">Doctor:</td>
              <td style="padding: 8px 0; color: #102A43; font-weight: 600; text-align: right;">${doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5C7185; font-size: 14px;">Clinic:</td>
              <td style="padding: 8px 0; color: #102A43; text-align: right;">${clinicName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5C7185; font-size: 14px;">Service:</td>
              <td style="padding: 8px 0; color: #102A43; text-align: right;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5C7185; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #102A43; font-weight: 600; text-align: right;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5C7185; font-size: 14px;">Time:</td>
              <td style="padding: 8px 0; color: #102A43; font-weight: 600; text-align: right;">${time}</td>
            </tr>
            <tr style="border-top: 2px solid #D7E7F5;">
              <td style="padding: 12px 0; color: #5C7185; font-size: 14px;">Fee:</td>
              <td style="padding: 12px 0; color: #1769AA; font-weight: 700; text-align: right; font-size: 18px;">SGD ${price.toFixed(2)}</td>
            </tr>
          </table>
          <p style="margin: 15px 0 0 0; padding: 12px; background-color: #FFF9E6; border-radius: 6px; color: #5C7185; font-size: 13px;">
            💳 <strong>Payment:</strong> Pay at clinic (cash/card accepted)
          </p>
        </div>
        
        <div style="background-color: #F0FFF4; padding: 15px; border-left: 4px solid #10B981; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #102A43; margin-top: 0; font-size: 14px;">📌 Important Reminders:</h4>
          <ul style="color: #5C7185; line-height: 1.6; margin: 5px 0; padding-left: 20px; font-size: 13px;">
            <li>Arrive 15 minutes early for registration</li>
            <li>Bring valid ID and insurance card (if applicable)</li>
            <li>If you need to reschedule or cancel, please do so at least 24 hours in advance</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://medcin.health'}/patient?tab=mybookings" 
             style="background-color: #1769AA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            View My Bookings
          </a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px 0; border-top: 1px solid #D7E7F5; color: #5C7185; font-size: 12px;">
        <p>© 2026 Medcin Platform. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: patientEmail,
    subject,
    text,
    html,
  });
}

// Template: Booking Cancellation Email
export async function sendBookingCancellationEmail(
  patientName: string,
  patientEmail: string,
  bookingReference: string,
  doctorName: string,
  date: string,
  time: string,
  reason?: string
): Promise<boolean> {
  const subject = `Booking Cancelled: ${bookingReference}`;
  const text = `
Dear ${patientName},

Your appointment has been cancelled.

Booking Reference: ${bookingReference}
Doctor: ${doctorName}
Original Date: ${date}
Original Time: ${time}

${reason ? `Reason: ${reason}` : ''}

You can book a new appointment anytime through the Medcin platform.

Book Again: ${process.env.NEXT_PUBLIC_APP_URL || 'https://medcin.health'}/patient?tab=search

Thank you,
The Medcin Team
  `.trim();

  return sendEmail({
    to: patientEmail,
    subject,
    text,
  });
}
