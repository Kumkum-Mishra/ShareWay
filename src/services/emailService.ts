import emailjs from '@emailjs/browser';

// EmailJS Configuration
// You'll need to set up a free account at https://www.emailjs.com/
const EMAILJS_CONFIG = {
  serviceId: 'service_shareway', // Replace with your EmailJS service ID
  templateId: 'template_verification', // Replace with your template ID
  publicKey: 'YOUR_PUBLIC_KEY', // Replace with your public key
};

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
export async function sendVerificationEmail(
  toEmail: string,
  userName: string,
  verificationCode: string
): Promise<boolean> {
  try {
    // Initialize EmailJS
    emailjs.init(EMAILJS_CONFIG.publicKey);

    const templateParams = {
      to_email: toEmail,
      to_name: userName,
      verification_code: verificationCode,
      company_name: 'ShareWay',
      from_name: 'ShareWay Team',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send email:', error);
    
    // For demo/development: show the code in console
    if (process.env.NODE_ENV === 'development') {
      console.log('=== DEVELOPMENT MODE ===');
      console.log('Email would be sent to:', toEmail);
      console.log('Verification Code:', verificationCode);
      console.log('=======================');
    }
    
    return false;
  }
}

// Send verification SMS (uses a similar service or Twilio)
export async function sendVerificationSMS(
  toPhone: string,
  verificationCode: string
): Promise<boolean> {
  try {
    // In production, integrate with Twilio or similar SMS service
    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== SMS VERIFICATION (Demo) ===');
      console.log('Phone:', toPhone);
      console.log('Code:', verificationCode);
      console.log('==============================');
    }

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

// Verify code
export function verifyCode(enteredCode: string, actualCode: string): boolean {
  return enteredCode === actualCode;
}

// Email template for EmailJS (save this as a template in EmailJS dashboard)
export const EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #0891b2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: white; padding: 40px; border: 1px solid #e5e7eb; }
    .code-box { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
    .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10b981; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 ShareWay</h1>
      <p style="color: white; margin: 10px 0 0;">Email Verification</p>
    </div>
    <div class="content">
      <h2>Hello {{to_name}},</h2>
      <p>Welcome to ShareWay! Please verify your email address to complete your registration.</p>
      <div class="code-box">
        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Your Verification Code</p>
        <div class="code">{{verification_code}}</div>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't create a ShareWay account, please ignore this email.</p>
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>{{from_name}}</strong>
      </p>
    </div>
    <div class="footer">
      <p>ShareWay - Share Your Way Forward</p>
      <p>Sustainable Cities and Communities • SDG 11</p>
    </div>
  </div>
</body>
</html>
`;

