package com.algoboard.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.logging.Logger;
import java.util.logging.Level;

@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${app.email.testing.mode:true}")
    private boolean testingMode;

    // Send welcome email to newly registered user
    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            // Validate email before sending
            if (!isEmailValid(toEmail)) {
                logger.warning("Invalid email address provided for welcome email: " + toEmail);
                return;
            }

            String subject = "Welcome to AlgoBoard, " + firstName + "! 🎉";
            String htmlContent = processWelcomeTemplate(firstName);

            sendEmail(toEmail, subject, htmlContent);
            logger.info("Welcome email sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to send welcome email to: " + toEmail, e);
        }
    }

    // Send login notification email to user
    @Async("emailTaskExecutor")
    public void sendLoginNotification(String toEmail, String firstName) {
        try {
            // Validate email before sending
            if (!isEmailValid(toEmail)) {
                logger.warning("Invalid email address provided for login notification: " + toEmail);
                return;
            }

            String subject = "New login to your AlgoBoard account";
            String htmlContent = processLoginTemplate(firstName);

            sendEmail(toEmail, subject, htmlContent);
            logger.info("Login notification sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to send login notification to: " + toEmail, e);
        }
    }

    // send profile update notification email to user
    @Async("emailTaskExecutor")
    public void sendProfileUpdateNotification(String toEmail, String firstName, String changedField) {
        try {
            // Validate email before sending
            if (!isEmailValid(toEmail)) {
                logger.warning("Invalid email address provided for profile update notification: " + toEmail);
                return;
            }

            String subject = "Your AlgoBoard account " + changedField + " has changed";
            String message;
            if (changedField.equals("password")) {
                message = "the password has been changed";
            } else {
                message = "details have been changed";
            }
            String htmlContent = processChangeTemplate(firstName, message);

            sendEmail(toEmail, subject, htmlContent);
            logger.info("Change notification sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to send change notification to: " + toEmail, e);
        }
    }

    // send otp to email for the password reset
    @Async("emailTaskExecutor")
    public void sendOtpForPasswordReset(String toEmail, String otp) {
        try {
            // Validate email before sending
            if (!isEmailValid(toEmail)) {
                logger.warning("Invalid email address provided for OTP: " + toEmail);
                return;
            }

            String subject = "Your OTP for Password Reset";
            String htmlContent = processOtpTemplate(otp);

            sendEmail(toEmail, subject, htmlContent);
            logger.info("OTP sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to send OTP to: " + toEmail, e);
        }
    }

    @Async("emailTaskExecutor")
    public void sendPasswordResetSuccessMessage(String toEmail, String firstName) {
        try {
            // Validate email before sending
            if (!isEmailValid(toEmail)) {
                logger.warning("Invalid email address provided for password reset success notification: " + toEmail);
                return;
            }

            String subject = "Your AlgoBoard password has been changed";
            String message = "the password has been changed successfully";
            String htmlContent = processChangeTemplate(firstName, message);

            sendEmail(toEmail, subject, htmlContent);
            logger.info("Password reset success message sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to send password reset success message to: " + toEmail, e);
        }
    }

    @Async("emailTaskExecutor")
    public void sendAccountDeletionMessage(String toEmail, String firstName) {
        try {
            // Validate email before sending
            if (!isEmailValid(toEmail)) {
                logger.warning("Invalid email address provided for account deletion notification: " + toEmail);
                return;
            }

            String subject = "Your AlgoBoard account has been deleted";
            String message = "We're sorry to see you go. Your account has been deleted successfully.";
            String htmlContent = processChangeTemplate(firstName, message);

            sendEmail(toEmail, subject, htmlContent);
            logger.info("Account deletion message sent successfully to: " + toEmail);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to send account deletion message to: " + toEmail, e);
        }
    }

    // Process welcome email template with user data
    private String processWelcomeTemplate(String firstName) {
        String template = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to AlgoBoard</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .welcome-text { font-size: 18px; margin-bottom: 20px; color: #2c3e50; }
                        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .feature-item { margin: 10px 0; padding: 10px; border-left: 4px solid #667eea; }
                        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🏆 AlgoBoard</div>
                        <p>Your Competitive Programming Dashboard</p>
                    </div>

                    <div class="content">
                        <p class="welcome-text">Hi <strong>{{firstName}}</strong>,</p>

                        <p>Welcome to AlgoBoard! We're excited to have you join our competitive programming community. 🚀</p>

                        <div class="features">
                            <h3>What you can do with AlgoBoard:</h3>
                            <div class="feature-item">📊 <strong>Track Progress:</strong> Monitor your performance across multiple platforms</div>
                            <div class="feature-item">📈 <strong>Analytics:</strong> View detailed insights of your coding journey</div>
                            <div class="feature-item">🏅 <strong>Achievements:</strong> Celebrate your milestones and improvements</div>
                            <div class="feature-item">🌟 <strong>Community:</strong> Connect with other competitive programmers</div>
                        </div>

                        <p>Your account is now ready! Start by connecting your competitive programming profiles and exploring your dashboard.</p>

                        <a href="#" class="cta-button">Get Started →</a>

                        <p>If you have any questions, feel free to reach out to our support team.</p>

                        <p>Happy coding! 💻<br>
                        <strong>The AlgoBoard Team</strong></p>
                    </div>

                    <div class="footer">
                        <p>This email was sent to you because you created an account on AlgoBoard.</p>
                        <p>© 2025 AlgoBoard. All rights reserved.</p>
                    </div>
                </body>
                </html>
                """;

        return template.replace("{{firstName}}", firstName);
    }

    // Process login notification template with user data
    private String processLoginTemplate(String firstName) {
        LocalDateTime now = LocalDateTime.now();
        String timestamp = now.format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));

        String template = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login Alert - AlgoBoard</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .logo { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .alert-box { background: #e8f5e8; border: 1px solid #27ae60; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .login-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .security-note { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🔐 AlgoBoard Security</div>
                        <p>Account Activity Notification</p>
                    </div>

                    <div class="content">
                        <p>Hi <strong>{{firstName}}</strong>,</p>

                        <div class="alert-box">
                            <p><strong>✅ New login detected</strong></p>
                            <p>We noticed a new login to your AlgoBoard account.</p>
                        </div>

                        <div class="login-details">
                            <h4>Login Details:</h4>
                            <p><strong>Time:</strong> {{timestamp}}</p>
                            <p><strong>Account:</strong> Your AlgoBoard Account</p>
                        </div>

                        <div class="security-note">
                            <p><strong>🛡️ Security Check:</strong></p>
                            <p><strong>If this was you:</strong> No action needed. You can safely ignore this email.</p>
                            <p><strong>If this wasn't you:</strong> Please secure your account immediately by changing your password.</p>
                        </div>

                        <p>We send these notifications to help keep your account secure. If you have any concerns about your account security, please contact our support team.</p>

                        <p>Best regards,<br>
                        <strong>The AlgoBoard Security Team</strong></p>
                    </div>

                    <div class="footer">
                        <p>This is an automated security notification from AlgoBoard.</p>
                        <p>© 2025 AlgoBoard. All rights reserved.</p>
                    </div>
                </body>
                </html>
                """;

        return template.replace("{{firstName}}", firstName).replace("{{timestamp}}", timestamp);
    }

    private String processChangeTemplate(String firstName, String message) {
        String template = """
                <html>
                <head>
                    <style>
                        .header { text-align: center; padding: 20px; }
                        .content { margin: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🔐 AlgoBoard Security</div>
                        <p>Account Change Notification</p>
                    </div>

                    <div class="content">
                        <p>Hi <strong>{{firstName}}</strong>,</p>

                        <p>We wanted to let you know that in your AlgoBoard account, <strong>{{message}}</strong>.</p>

                        <p>If you did not make this change, please contact our support team immediately or secure your account by changing your password.</p>

                        <p>Best regards,<br>
                        <strong>The AlgoBoard Security Team</strong></p>
                    </div>

                    <div class="footer">
                        <p>This is an automated security notification from AlgoBoard.</p>
                        <p>© 2025 AlgoBoard. All rights reserved.</p>
                    </div>
                </body>
                </html>
                """;

        return template.replace("{{firstName}}", firstName).replace("{{message}}", message);
    }

    // email content format of generation ot otp
    private String processOtpTemplate(String otp) {
        String template = """
                <html>
                <head>
                    <style>
                        .header { text-align: center; padding: 20px; }
                        .content { margin: 20px; }
                        .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🔐 AlgoBoard Security</div>
                        <p>Password Reset OTP</p>
                    </div>

                    <div class="content">
                        <p>Hi,</p>

                        <p>Your OTP for password reset is: <strong>{{otp}}</strong></p>

                        <p>If you did not request this, please ignore this email.</p>

                        <p>Best regards,<br>
                        <strong>The AlgoBoard Security Team</strong></p>
                    </div>

                    <div class="footer">
                        <p>This is an automated security notification from AlgoBoard.</p>
                        <p>© 2025 AlgoBoard. All rights reserved.</p>
                    </div>
                </body>
                </html>
                """;

        return template.replace("{{otp}}", otp);
    }

    // Core method to send email
    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            // Additional validation at the core level
            if (!isEmailValid(to)) {
                logger.warning("Attempted to send email to invalid address: " + to + " - Email sending skipped");
                return; // Don't throw exception, just return silently
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML content

            // Add headers to prevent bounce-back emails
            message.setHeader("Return-Path", "<>"); // Empty return path prevents bounces
            message.setHeader("Errors-To", ""); // Prevent error notifications
            message.setHeader("X-Errors-To", ""); // Additional error prevention
            message.setHeader("Bounces-To", ""); // Prevent bounce notifications
            message.setHeader("Auto-Submitted", "auto-generated"); // Mark as automated
            message.setHeader("X-Auto-Response-Suppress", "All"); // Suppress auto-responses
            message.setHeader("Precedence", "bulk"); // Lower priority, reduces bounces

            mailSender.send(message);
            logger.info("Email sent successfully to: " + to);
        } catch (Exception e) {
            logger.log(Level.WARNING, "Failed to send email to: " + to + " - " + e.getMessage());
            // Don't re-throw the exception to prevent bounce-backs
            // Just log the failure and continue
        }
    }

    // Utility method to validate email format
    public boolean isEmailValid(String email) {
        if (email == null || email.trim().isEmpty()) {
            logger.info("Blocked null or empty email");
            return false;
        }

        // If testing mode is enabled, block ALL emails to prevent any bounce-backs
        if (testingMode) {
            logger.warning("TESTING MODE ACTIVE - Email sending blocked for: " + email);
            return false;
        }

        // Check for common test/dummy email patterns
        String emailLower = email.toLowerCase().trim();

        // Block common test email patterns
        if (emailLower.contains("test") || emailLower.contains("dummy") ||
                emailLower.contains("fake") || emailLower.contains("example") ||
                emailLower.contains("noreply") || emailLower.contains("donotreply") ||
                emailLower.contains("sample") || emailLower.contains("demo") ||
                emailLower.endsWith("@test.com") || emailLower.endsWith("@example.com") ||
                emailLower.endsWith("@dummy.com") || emailLower.endsWith("@fake.com") ||
                emailLower.endsWith("@temp.com") || emailLower.endsWith("@invalid.com") ||
                emailLower.endsWith("@sample.com") || emailLower.endsWith("@demo.com")) {
            logger.info("Blocked test/dummy email address: " + email);
            return false;
        }

        // Basic email format validation
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        boolean isValidFormat = email.matches(emailRegex);

        if (!isValidFormat) {
            logger.info("Invalid email format: " + email);
            return false;
        }

        // Additional check for common invalid domains
        String[] invalidDomains = { "localhost", "127.0.0.1", "0.0.0.0", "invalid", "null",
                "example.com", "test.com", "dummy.com", "fake.com",
                "temp.com", "sample.com", "demo.com", "mail.com" };
        String domain = email.substring(email.lastIndexOf("@") + 1).toLowerCase();

        for (String invalidDomain : invalidDomains) {
            if (domain.equals(invalidDomain)) {
                logger.info("Blocked invalid domain: " + email + " (domain: " + domain + ")");
                return false;
            }
        }

        return true;
    }
}
