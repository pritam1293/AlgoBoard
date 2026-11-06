package com.algoboard.services;

import com.algoboard.entities.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Objects;

/**
 * Sends transactional account emails. When SMTP is not configured (for
 * example during local development) the verification link is logged instead
 * of failing the request, so registration and login still work.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.email.from:no-reply@algoboard.app}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    /**
     * Sends the verification email on a background thread so signup and resend
     * requests are not blocked by slow SMTP servers.
     */
    @Async
    public void sendVerificationEmail(User user, String token) {
        String verificationUrl = buildVerificationUrl(token);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || mailHost == null || mailHost.isBlank()) {
            logger.warn("SMTP is not configured. Verification link for {}: {}", user.getEmail(), verificationUrl);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress == null ? "no-reply@algoboard.app" : fromAddress);
            helper.setTo(Objects.requireNonNull(user.getEmail(), "User email must not be null"));
            helper.setSubject("Verify your AlgoBoard email address");
                helper.setText(
                    Objects.requireNonNull(buildTextBody(user, verificationUrl)),
                    Objects.requireNonNull(buildHtmlBody(user, verificationUrl)));
            mailSender.send(message);
            logger.info("Verification email sent to {}", user.getEmail());
        } catch (Exception e) {
            // Never fail signup/login because the mail server is temporarily unavailable.
            logger.error("Failed to send verification email to {}. Verification link: {}",
                    user.getEmail(), verificationUrl, e);
        }
    }

    public String buildVerificationUrl(String token) {
        String baseUrl = frontendUrl == null ? "" : frontendUrl.trim();
        while (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + "/verify-email?token=" + token;
    }

    private String buildTextBody(User user, String verificationUrl) {
        return "Hi " + user.getFirstName() + ",\n\n"
                + "Thanks for signing up for AlgoBoard. Please verify your email address by opening the link below:\n\n"
                + verificationUrl + "\n\n"
                + "If you did not create an AlgoBoard account, you can safely ignore this email.";
    }

    private String buildHtmlBody(User user, String verificationUrl) {
        return "<div style=\"font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;max-width:520px\">"
                + "<h2 style=\"margin:0 0 16px\">Verify your email address</h2>"
                + "<p>Hi " + escapeHtml(user.getFirstName()) + ",</p>"
                + "<p>Thanks for signing up for AlgoBoard. Click the button below to verify your email address "
                + "and activate your account.</p>"
                + "<p style=\"margin:24px 0\">"
                + "<a href=\"" + verificationUrl + "\" "
                + "style=\"display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;"
                + "padding:12px 20px;border-radius:8px;font-weight:600\">Verify email</a>"
                + "</p>"
                + "<p>Or copy and paste this link into your browser:<br>"
                + "<a href=\"" + verificationUrl + "\">" + verificationUrl + "</a></p>"
                + "<p style=\"color:#6b7280;font-size:13px\">If you did not create an AlgoBoard account, "
                + "you can safely ignore this email.</p>"
                + "</div>";
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
