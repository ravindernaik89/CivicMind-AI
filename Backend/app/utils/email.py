# app/utils/email.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)


def send_password_reset_email(email: str, token: str, name: str = None):
    """
    Send password reset email to the user.
    
    Args:
        email: User's email address
        token: Password reset token
        name: User's name (optional)
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email will not be sent.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"
        msg['To'] = email
        msg['Subject'] = "Reset Your Password - CivicMind AI"
        
        # Build the reset URL (you may need to adjust based on your frontend URL)
        reset_url = f"http://localhost:5173/reset-password?token={token}"
        
        # HTML body
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>CivicMind AI</h1>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>Hello{name and f" {name}" or ""},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #7c3aed;">{reset_url}</p>
                    <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                </div>
                <div class="footer">
                    <p>© 2024 CivicMind AI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text alternative
        text_body = f"""
        Hello{name and f" {name}" or ""},
        
        We received a request to reset your password.
        
        Click the following link to reset your password:
        {reset_url}
        
        Note: This link will expire in 1 hour for security reasons.
        
        If you didn't request a password reset, please ignore this email.
        
        © 2026 CivicMind AI. All rights reserved.
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        msg.attach(MIMEText(text_body, 'plain'))
        
        # Connect to SMTP server and send
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.FROM_EMAIL, email, msg.as_string())
        
        logger.info(f"Password reset email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
        return False


def send_welcome_email(email: str, name: str):
    """
    Send welcome email to new users.
    
    Args:
        email: User's email address
        name: User's name
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email will not be sent.")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"
        msg['To'] = email
        msg['Subject'] = "Welcome to CivicMind AI!"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>CivicMind AI</h1>
                </div>
                <div class="content">
                    <h2>Welcome, {name}!</h2>
                    <p>Thank you for registering with CivicMind AI.</p>
                    <p>You can now:</p>
                    <ul>
                        <li>Submit complaints about civic issues</li>
                        <li>Track the status of your complaints</li>
                        <li>Receive updates on resolution progress</li>
                    </ul>
                    <p>We look forward to helping you build a better community!</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Welcome, {name}!
        
        Thank you for registering with CivicMind AI.
        
        You can now:
        - Submit complaints about civic issues
        - Track the status of your complaints
        - Receive updates on resolution progress
        
        We look forward to helping you build a better community!
        
        © 2024 CivicMind AI. All rights reserved.
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        msg.attach(MIMEText(text_body, 'plain'))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.FROM_EMAIL, email, msg.as_string())
        
        logger.info(f"Welcome email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email: {str(e)}")
        return False

