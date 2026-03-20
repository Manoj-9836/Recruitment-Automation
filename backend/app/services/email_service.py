from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(
        self,
        smtp_server: str = "smtp.gmail.com",
        smtp_port: int = 587,
        sender_email: str = "",
        sender_password: str = "",
    ):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.sender_email = sender_email
        self.sender_password = sender_password

    def send_authorization_email(
        self,
        recipient_email: str,
        candidate_name: str,
        username: str,
        password: str,
        job_title: str,
        portal_url: str = "http://localhost:5173",
    ) -> bool:
        """Send authorization email with login credentials to candidate."""
        try:
            # Create email message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Congratulations! You've Been Shortlisted - Portal Access Granted"
            msg["From"] = self.sender_email
            msg["To"] = recipient_email

            # HTML email body
            html = f"""
            <html>
                <head>
                    <style>
                        body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }}
                        .credentials-box {{ background-color: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }}
                        .credential-row {{ margin: 10px 0; font-size: 14px; }}
                        .label {{ font-weight: bold; color: #667eea; display: inline-block; width: 120px; }}
                        .value {{ font-family: 'Courier New', monospace; background-color: #f0f0f0; padding: 5px 10px; border-radius: 3px; display: inline-block; }}
                        .cta-button {{ display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                        .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
                        h2 {{ color: #667eea; }}
                        .emphasis {{ color: #667eea; font-weight: bold; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Congratulations!</h1>
                        </div>
                        <div class="content">
                            <p>Dear <span class="emphasis">{candidate_name}</span>,</p>
                            
                            <p>We are pleased to inform you that you have been <span class="emphasis">shortlisted</span> for the position of <span class="emphasis">{job_title}</span>!</p>
                            
                            <p>Your application impressed our team, and we would like to move forward with you in our recruitment process. To access your candidate portal and begin the assessment rounds, please use the credentials below:</p>
                            
                            <div class="credentials-box">
                                <div class="credential-row">
                                    <span class="label">Username:</span>
                                    <span class="value">{username}</span>
                                </div>
                                <div class="credential-row">
                                    <span class="label">Password:</span>
                                    <span class="value">{password}</span>
                                </div>
                            </div>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Log in to your candidate portal using the credentials above</li>
                                <li>Complete the assessment rounds as per the schedule</li>
                                <li>You will receive further communication regarding interview dates</li>
                            </ol>
                            
                            <p><strong>Important:</strong> Please keep your password secure and do not share it with anyone. We recommend changing your password on first login.</p>
                            
                            <a href="{portal_url}" class="cta-button">Access Your Portal</a>
                            
                            <p style="margin-top: 30px;">If you have any questions or technical issues, please don't hesitate to contact our HR team.</p>
                            
                            <p>Best regards,<br><strong>Recruitment Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 Recruitment Automation. All rights reserved.</p>
                        </div>
                    </div>
                </body>
            </html>
            """

            msg.attach(MIMEText(html, "html"))

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)

            logger.info(f"Authorization email sent successfully to {recipient_email}")
            return True

        except smtplib.SMTPAuthenticationError:
            logger.error("SMTP authentication failed. Check sender_email and sender_password.")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error occurred: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to send authorization email: {e}")
            return False

    def send_test_email(self, recipient_email: str) -> bool:
        """Send a test email to verify SMTP configuration."""
        try:
            msg = MIMEMultipart()
            msg["Subject"] = "Test Email - Recruitment Automation"
            msg["From"] = self.sender_email
            msg["To"] = recipient_email

            body = "This is a test email from the Recruitment Automation system."
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)

            logger.info(f"Test email sent successfully to {recipient_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send test email: {e}")
            return False
