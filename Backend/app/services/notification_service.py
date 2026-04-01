# app/services/notification_service.py

import smtplib
import os
from email.message import EmailMessage
from app.models.notification import Notification
from app.models.user import User


# Get email credentials from environment or use placeholder
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")


def send_email(to_email: str, subject: str, content: str):
    # Skip sending if credentials are not configured
    if not SMTP_EMAIL or not SMTP_PASSWORD or SMTP_EMAIL == "your_email@gmail.com":
        print(f"[Notification] Email would be sent to {to_email}: {subject}")
        return
    
    try:
        msg = EmailMessage()
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(content)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"[Notification] Failed to send email: {e}")


def create_notification(db, user: User, message: str):

    notification = Notification(
        user_id=user.id,
        message=message
    )

    db.add(notification)
    db.commit()


def notify_user(db, user: User, complaint):

    message = f"""
    Hello {user.name},

    Your complaint (ID: {complaint.id}) status has been updated to: {complaint.status}.

    Thank you,
    CivicMind AI
    """

    send_email(user.email, "Complaint Status Update", message)
    create_notification(db, user, message)
