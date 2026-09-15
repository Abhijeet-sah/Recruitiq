import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("recruitiq.email")

class EmailService:
    """
    Automated Email & Notification Service for RecruitIQ.
    Sends notifications to candidates and recruiters during key recruitment lifecycle events:
      1. Candidate applies -> Confirmation to candidate & Alert to recruiter
      2. Recruiter shortlists candidate -> Next steps & interview invite to candidate
      3. Recruiter rejects candidate -> Professional, constructive update to candidate
    """

    def _generate_email_template(self, title: str, subtitle: str, body_html: str, action_url: Optional[str] = None, action_text: Optional[str] = None) -> str:
        """Generates a responsive, professional HTML email wrapper."""
        action_button = ""
        if action_url and action_text:
            action_button = f"""
            <div style="margin: 28px 0; text-align: center;">
                <a href="{action_url}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                    {action_text} &rarr;
                </a>
            </div>
            """

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 32px; text-align: center;">
                                    <div style="display: inline-block; background-color: #4f46e5; width: 44px; height: 44px; border-radius: 12px; line-height: 44px; color: #ffffff; font-size: 22px; font-weight: bold; margin-bottom: 12px;">
                                        &empty;
                                    </div>
                                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">RecruitIQ</h1>
                                    <p style="color: #c7d2fe; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Smart Recruitment & Explainable Decision Support</p>
                                </td>
                            </tr>
                            <!-- Title Bar -->
                            <tr>
                                <td style="padding: 28px 36px 12px 36px;">
                                    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0;">{title}</h2>
                                    <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">{subtitle}</p>
                                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0 0 0;">
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 12px 36px 28px 36px; font-size: 14px; line-height: 1.6; color: #334155;">
                                    {body_html}
                                    {action_button}
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px 36px; text-align: center; font-size: 12px; color: #94a3b8;">
                                    <p style="margin: 0;">This is an automated notification sent by <strong>RecruitIQ AI Platform</strong>.</p>
                                    <p style="margin: 4px 0 0 0;">Strictly isolated demographic proxies &bull; Explainable evaluations &bull; Human-in-the-loop decisions</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

    def _send_email(self, to_email: str, subject: str, html_body: str, plain_text: str) -> Dict[str, Any]:
        """
        Delivers email via SMTP if configured, or performs simulated dispatch with structured logging.
        """
        if not settings.ENABLE_EMAIL_NOTIFICATIONS:
            logger.info(f"[Email Disabled] Skipped dispatch to {to_email} (Subject: {subject})")
            return {"success": True, "mode": "disabled", "recipient": to_email}

        # Check if production SMTP is configured
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
                msg["To"] = to_email

                part1 = MIMEText(plain_text, "plain")
                part2 = MIMEText(html_body, "html")
                msg.attach(part1)
                msg.attach(part2)

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())

                logger.info(f"[SMTP Sent] Successfully dispatched email to {to_email} via {settings.SMTP_HOST}")
                return {"success": True, "mode": "smtp", "recipient": to_email}
            except Exception as e:
                logger.error(f"[SMTP Error] Failed to send email to {to_email}: {e}")
                # Fall back gracefully so user workflows don't fail
                return {"success": False, "mode": "smtp_error", "error": str(e), "recipient": to_email}

        # Dev / Local Simulation Mode: Log outgoing email cleanly
        print("\n" + "="*70)
        print("[EMAIL NOTIFICATION DISPATCHED] (Simulated Dev Mode)")
        print(f"To: {to_email}")
        print(f"From: {settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>")
        print(f"Subject: {subject}")
        print("-" * 70)
        print(plain_text.strip())
        print("="*70 + "\n")

        return {"success": True, "mode": "simulated", "recipient": to_email}

    def notify_application_received(self, candidate_email: str, candidate_name: str, job_title: str) -> Dict[str, Any]:
        """Notifies candidate that their application has been successfully submitted."""
        subject = f"Application Received: {job_title} at Enterprise Corp"
        title = "Application Confirmed"
        subtitle = f"Thank you for applying for {job_title}"
        body_html = f"""
        <p>Dear <strong>{candidate_name}</strong>,</p>
        <p>We are pleased to confirm that your job application for the <strong>{job_title}</strong> requisition has been successfully received by the hiring team.</p>
        <p>Our intelligent recruitment system is currently analyzing your resume credentials against the target role requirements using semantic evaluation. You may track your application status anytime via the Candidate Portal.</p>
        <p style="margin-top: 16px;"><strong>What happens next?</strong></p>
        <ul style="padding-left: 20px;">
            <li>Our recruitment team reviews your skills and experience profile.</li>
            <li>You may receive an invitation to take an adaptive competency assessment.</li>
            <li>Status changes will be reflected in real time on your dashboard.</li>
        </ul>
        <p>Best regards,<br><strong>The Talent Acquisition Team</strong></p>
        """
        plain_text = f"Dear {candidate_name},\n\nYour application for '{job_title}' has been successfully received.\nYou can track your progress on your candidate dashboard at http://localhost:5173/candidate/dashboard."
        
        return self._send_email(
            to_email=candidate_email,
            subject=subject,
            html_body=self._generate_email_template(
                title=title,
                subtitle=subtitle,
                body_html=body_html,
                action_url="http://localhost:5173/candidate/dashboard",
                action_text="View Application Status"
            ),
            plain_text=plain_text
        )

    def notify_recruiter_new_applicant(self, recruiter_email: str, recruiter_name: str, candidate_name: str, candidate_email: str, job_title: str, match_score: Optional[float] = None) -> Dict[str, Any]:
        """Alerts the recruiter when a new candidate submits an application."""
        subject = f"New Applicant Alert: {candidate_name} applied for {job_title}"
        title = "New Candidate Application"
        subtitle = f"{job_title} pipeline update"
        score_snippet = f"<p><strong>Preliminary Match Score:</strong> <span style='color: #4f46e5; font-weight: bold;'>{match_score}%</span></p>" if match_score is not None else ""
        
        body_html = f"""
        <p>Hello <strong>{recruiter_name}</strong>,</p>
        <p>A new candidate has submitted an application for your active requisition: <strong>{job_title}</strong>.</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Candidate:</strong> {candidate_name}</p>
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> {candidate_email}</p>
            {score_snippet}
        </div>
        <p>You can review their full parsed resume credentials, competency gap analysis, and explainability factors directly in the Candidate Evaluation Dossier.</p>
        """
        plain_text = f"Hello {recruiter_name},\n\n{candidate_name} ({candidate_email}) has just applied for '{job_title}'.\nPreliminary Match Score: {match_score or 'Pending'}%.\nView the dossier on your Recruiter Dashboard: http://localhost:5173/recruiter/dashboard"

        return self._send_email(
            to_email=recruiter_email,
            subject=subject,
            html_body=self._generate_email_template(
                title=title,
                subtitle=subtitle,
                body_html=body_html,
                action_url="http://localhost:5173/recruiter/dashboard",
                action_text="Open Recruiter Dashboard"
            ),
            plain_text=plain_text
        )

    def notify_candidate_shortlisted(self, candidate_email: str, candidate_name: str, job_title: str) -> Dict[str, Any]:
        """Sends congratulations and next steps when candidate is Shortlisted."""
        subject = f"Great News! You've Been Shortlisted for {job_title}"
        title = "Application Shortlisted!"
        subtitle = f"Next steps for {job_title}"
        body_html = f"""
        <p>Dear <strong>{candidate_name}</strong>,</p>
        <p style="font-size: 16px; color: #059669; font-weight: 600;">Congratulations!</p>
        <p>We are delighted to inform you that following an evaluation of your resume credentials and skills, your application for the <strong>{job_title}</strong> position has been <strong>SHORTLISTED</strong> for the next round of our hiring process.</p>
        <p>Our hiring team was impressed by your profile and domain competencies. A recruiter will be reaching out to you shortly with details regarding interview scheduling and next steps.</p>
        <p>In the meantime, you can explore personalized learning recommendations tailored for this position on your dashboard.</p>
        <p>Warm congratulations,<br><strong>The Talent Acquisition Team</strong></p>
        """
        plain_text = f"Dear {candidate_name},\n\nCongratulations! Your application for '{job_title}' has been SHORTLISTED.\nA recruiter will reach out soon regarding next steps. Check your dashboard at http://localhost:5173/candidate/dashboard."

        return self._send_email(
            to_email=candidate_email,
            subject=subject,
            html_body=self._generate_email_template(
                title=title,
                subtitle=subtitle,
                body_html=body_html,
                action_url="http://localhost:5173/candidate/dashboard",
                action_text="View Application Portal"
            ),
            plain_text=plain_text
        )

    def notify_candidate_rejected(self, candidate_email: str, candidate_name: str, job_title: str) -> Dict[str, Any]:
        """Sends a polite and constructive update when candidate is Rejected."""
        subject = f"Update Regarding Your Application for {job_title}"
        title = "Application Status Update"
        subtitle = f"Notice regarding {job_title}"
        body_html = f"""
        <p>Dear <strong>{candidate_name}</strong>,</p>
        <p>Thank you very much for your interest in the <strong>{job_title}</strong> position and for taking the time to apply and share your experience with us.</p>
        <p>After a thorough review of all applicants, we regret to inform you that we will not be moving forward with your candidacy for this particular role at this time.</p>
        <p>Because we value your professional growth, our platform has synthesized a <strong>Personalized Skill Development Plan</strong> based on your evaluation, outlining targeted areas for upskilling to enhance your future opportunities.</p>
        <p>We encourage you to explore future openings with us that match your growing skill set.</p>
        <p>Sincerely,<br><strong>The Talent Acquisition Team</strong></p>
        """
        plain_text = f"Dear {candidate_name},\n\nThank you for applying for '{job_title}'. We will not be moving forward with your application at this time.\nA personalized skill development roadmap is available on your dashboard: http://localhost:5173/candidate/dashboard."

        return self._send_email(
            to_email=candidate_email,
            subject=subject,
            html_body=self._generate_email_template(
                title=title,
                subtitle=subtitle,
                body_html=body_html,
                action_url="http://localhost:5173/candidate/dashboard",
                action_text="Access Skill Development Plan"
            ),
            plain_text=plain_text
        )

    def send_password_reset_email(self, email: str, user_name: str, reset_url: str) -> Dict[str, Any]:
        """Sends a secure password reset link to the user's registered email."""
        subject = "Reset Your Password - RecruitIQ"
        title = "Password Reset Request"
        subtitle = f"Security verification for {email}"
        body_html = f"""
        <p>Hello <strong>{user_name}</strong>,</p>
        <p>We received a request to reset your password for your <strong>RecruitIQ</strong> account.</p>
        <p>Please click the button below to choose a new password. For security reasons, this link will expire in <strong>30 minutes</strong>.</p>
        <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #475569; word-break: break-all; margin: 16px 0;">
            Direct Link: <a href="{reset_url}" style="color: #4f46e5;">{reset_url}</a>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-top: 16px;">
            If you did not request this password reset, please ignore this email. Your existing password will remain completely secure and unchanged.
        </p>
        <p>Best regards,<br><strong>The RecruitIQ Security Team</strong></p>
        """
        plain_text = (
            f"Hello {user_name},\n\n"
            f"We received a request to reset the password for your RecruitIQ account ({email}).\n\n"
            f"Please visit the following link to set a new password:\n{reset_url}\n\n"
            f"This link is valid for 30 minutes.\n"
            f"If you did not request this, you can safely ignore this message."
        )

        return self._send_email(
            to_email=email,
            subject=subject,
            html_body=self._generate_email_template(
                title=title,
                subtitle=subtitle,
                body_html=body_html,
                action_url=reset_url,
                action_text="Reset Your Password"
            ),
            plain_text=plain_text
        )

email_service = EmailService()
