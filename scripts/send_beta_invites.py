#!/usr/bin/env python3
"""
Beta Tester Email Invitation System for EigoMaster
Generates personalized email invitations for beta testers
Uses SendGrid API for email delivery
"""

import os
import csv
import json
import logging
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BetaInvitationManager:
    """Manages beta tester email invitations"""

    def __init__(
        self,
        sendgrid_api_key: Optional[str] = None,
        from_email: str = "beta@eigomaster.jp",
        from_name: str = "EigoMaster Beta Team"
    ):
        """
        Initialize invitation manager

        Args:
            sendgrid_api_key: SendGrid API key (or use SENDGRID_API_KEY env var)
            from_email: Sender email address
            from_name: Sender display name
        """
        self.sendgrid_api_key = sendgrid_api_key or os.getenv('SENDGRID_API_KEY')
        self.from_email = from_email
        self.from_name = from_name
        self.stats = {
            'total': 0,
            'sent': 0,
            'failed': 0,
            'skipped': 0,
            'failed_emails': []
        }

    def _get_email_template(self, template_type: str, tester: Dict) -> Dict:
        """Get email template content"""

        templates = {
            'welcome': self._template_welcome,
            'reminder': self._template_reminder,
            'feedback': self._template_feedback_request,
            'phase2': self._template_phase2_transition
        }

        template_func = templates.get(template_type, self._template_welcome)
        return template_func(tester)

    def _template_welcome(self, tester: Dict) -> Dict:
        """Welcome email template for Phase 1"""

        download_link = "https://eigomaster.jp/download"
        feedback_url = "https://eigomaster.jp/beta/feedback"
        guidelines_url = "https://eigomaster.jp/docs/beta-guidelines"

        subject = "Welcome to EigoMaster Beta Testing - Phase 1!"

        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
        .section {{ margin: 20px 0; }}
        .cta-button {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }}
        .features {{ list-style: none; padding-left: 0; }}
        .features li {{ padding: 8px 0; padding-left: 24px; position: relative; }}
        .features li:before {{ content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }}
        .footer {{ color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to EigoMaster Beta!</h1>
            <p>You're invited to test the next generation of English learning</p>
        </div>

        <div class="content">
            <p>Hello {tester.get('email', 'Beta Tester')},</p>

            <p>Thank you for being selected as a beta tester for <strong>EigoMaster Phase 1</strong>! We're excited to have you help shape the future of our learning platform.</p>

            <div class="section">
                <h2>📱 What's New in Phase 1</h2>
                <ul class="features">
                    <li>1,482 EIKEN vocabulary words (準2級 → 1級)</li>
                    <li>AI-powered spaced repetition learning</li>
                    <li>Daily goals and achievement system</li>
                    <li>Audio pronunciation for all words</li>
                    <li>Parent dashboard for tracking progress</li>
                    <li>Offline support for learning anywhere</li>
                </ul>
            </div>

            <div class="section">
                <h2>🚀 Getting Started</h2>
                <ol>
                    <li>Download EigoMaster from the link below</li>
                    <li>Sign up with your email: <strong>{tester.get('email')}</strong></li>
                    <li>Explore the 1,482 vocabulary words</li>
                    <li>Start learning and earn XP!</li>
                </ol>
                <p>
                    <a href="{download_link}" class="cta-button">📥 Download EigoMaster</a>
                </p>
            </div>

            <div class="section">
                <h2>📋 Testing Guidelines</h2>
                <p>Please review our testing guidelines to understand what we're looking for:</p>
                <ul>
                    <li><strong>Focus Areas</strong>: UI/UX, performance, stability, feature completeness</li>
                    <li><strong>Report Issues</strong>: Use the in-app feedback form or submit to {feedback_url}</li>
                    <li><strong>Expected Time</strong>: 30-60 minutes per week for 2-3 weeks</li>
                    <li><strong>Compensation</strong>: Free premium access for 1 year after beta</li>
                </ul>
                <p>
                    <a href="{guidelines_url}" class="cta-button">📖 Read Full Guidelines</a>
                </p>
            </div>

            <div class="section">
                <h2>🎯 Your Testing Mission</h2>
                <p>Help us identify:</p>
                <ul>
                    <li>✓ Critical bugs and crashes</li>
                    <li>✓ Performance issues (slow load times, etc.)</li>
                    <li>✓ Unclear UI or confusing features</li>
                    <li>✓ Missing or broken functionality</li>
                    <li>✓ Suggestions for improvement</li>
                </ul>
            </div>

            <div class="section">
                <h2>💬 Feedback</h2>
                <p>Your feedback is valuable! Please submit feedback regularly:</p>
                <p>
                    <a href="{feedback_url}" class="cta-button">📝 Submit Feedback</a>
                </p>
            </div>

            <div class="section">
                <h2>🤝 Support</h2>
                <p>If you encounter any issues or have questions:</p>
                <ul>
                    <li>Email: support@eigomaster.jp</li>
                    <li>Slack: #beta-testing channel</li>
                    <li>Discord: EigoMaster Beta Community</li>
                </ul>
            </div>

            <div class="section">
                <p><strong>Thank you for your participation!</strong></p>
                <p>We look forward to your feedback and insights.</p>
                <p>Happy learning! 📚</p>
            </div>

            <div class="footer">
                <p>EigoMaster Beta Testing - Phase 1</p>
                <p>Started: 2026-03-20 | Duration: 2-3 weeks</p>
            </div>
        </div>
    </div>
</body>
</html>
"""

        text_body = f"""
Welcome to EigoMaster Beta Testing - Phase 1!

Hello {tester.get('email', 'Beta Tester')},

Thank you for being selected as a beta tester! We're excited to have you.

WHAT'S NEW:
- 1,482 EIKEN vocabulary words (準2級 → 1級)
- AI-powered spaced repetition learning
- Daily goals and achievement system
- Audio pronunciation for all words
- Parent dashboard for tracking progress
- Offline support for learning anywhere

GETTING STARTED:
1. Download: {download_link}
2. Sign up with: {tester.get('email')}
3. Explore the vocabulary
4. Start learning and earn XP!

TESTING GUIDELINES:
{guidelines_url}

SUBMIT FEEDBACK:
{feedback_url}

YOUR MISSION:
Help us find bugs, performance issues, and usability problems.
Your feedback directly influences the final product!

SUPPORT:
Email: support@eigomaster.jp
Slack: #beta-testing
Discord: EigoMaster Beta Community

Thank you for participating!
EigoMaster Beta Team
"""

        return {
            'subject': subject,
            'html_body': html_body,
            'text_body': text_body
        }

    def _template_reminder(self, tester: Dict) -> Dict:
        """Reminder email for active testing"""
        subject = "Reminder: EigoMaster Beta Testing - Share Your Feedback!"

        html_body = f"""
<h2>Let's Keep Testing!</h2>
<p>Hi {tester.get('email')},</p>
<p>Thank you for testing EigoMaster! We'd love to hear your feedback on your experience so far.</p>
<p>Have you found any issues? Any features you'd like to see? Please share your thoughts:</p>
<p><a href="https://eigomaster.jp/beta/feedback">Submit Feedback</a></p>
"""

        return {
            'subject': subject,
            'html_body': html_body,
            'text_body': f"Hi {tester.get('email')}, please submit your feedback at https://eigomaster.jp/beta/feedback"
        }

    def _template_feedback_request(self, tester: Dict) -> Dict:
        """Specific feedback request"""
        subject = "Help Shape EigoMaster: Your Feedback Needed!"

        html_body = f"""
<h2>Your Feedback Matters!</h2>
<p>Hi {tester.get('email')},</p>
<p>We're in the critical phase of beta testing and need your input on:</p>
<ul>
    <li>Learning effectiveness</li>
    <li>App stability and performance</li>
    <li>UI/UX improvements</li>
    <li>Missing features</li>
</ul>
<p><a href="https://eigomaster.jp/beta/feedback">Rate Your Experience (1-5 stars)</a></p>
"""

        return {
            'subject': subject,
            'html_body': html_body,
            'text_body': f"Please rate your experience: https://eigomaster.jp/beta/feedback"
        }

    def _template_phase2_transition(self, tester: Dict) -> Dict:
        """Phase 2 transition email"""
        subject = "Congratulations! You've Been Selected for Phase 2 Beta Testing"

        html_body = f"""
<h2>🎉 Welcome to Phase 2!</h2>
<p>Hi {tester.get('email')},</p>
<p>Congratulations! Based on your excellent feedback and engagement in Phase 1, you've been selected for <strong>Phase 2 Beta Testing</strong>!</p>
<p>Phase 2 includes:</p>
<ul>
    <li>Advanced features and improvements from Phase 1 feedback</li>
    <li>New learning modes</li>
    <li>Enhanced parent dashboard</li>
    <li>Beta access to premium features</li>
</ul>
<p><a href="https://eigomaster.jp/beta/phase2">Get Started with Phase 2</a></p>
"""

        return {
            'subject': subject,
            'html_body': html_body,
            'text_body': f"Congratulations! You're in Phase 2 beta: https://eigomaster.jp/beta/phase2"
        }

    def send_email(
        self,
        recipient_email: str,
        subject: str,
        html_body: str,
        text_body: str = "",
        **kwargs
    ) -> bool:
        """
        Send email via SendGrid API

        Args:
            recipient_email: Recipient email address
            subject: Email subject
            html_body: HTML email body
            text_body: Plain text email body

        Returns:
            True if sent successfully
        """
        if not self.sendgrid_api_key:
            logger.info(f"DEMO MODE: Would send email to {recipient_email}")
            logger.info(f"  Subject: {subject}")
            return True

        try:
            import requests

            headers = {
                "Authorization": f"Bearer {self.sendgrid_api_key}",
                "Content-Type": "application/json"
            }

            data = {
                "personalizations": [
                    {
                        "to": [{"email": recipient_email}],
                        "subject": subject
                    }
                ],
                "from": {
                    "email": self.from_email,
                    "name": self.from_name
                },
                "content": [
                    {
                        "type": "text/plain",
                        "value": text_body or subject
                    },
                    {
                        "type": "text/html",
                        "value": html_body
                    }
                ]
            }

            response = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers=headers,
                json=data,
                timeout=10
            )

            if response.status_code in [200, 202]:
                logger.info(f"✓ Email sent to {recipient_email}")
                return True
            else:
                logger.error(f"Failed to send to {recipient_email}: {response.text}")
                return False

        except Exception as e:
            logger.error(f"Error sending email to {recipient_email}: {e}")
            return False

    def send_batch(
        self,
        testers: List[Dict],
        template_type: str = "welcome"
    ) -> Dict:
        """
        Send emails to multiple testers

        Args:
            testers: List of tester dictionaries
            template_type: Type of email template

        Returns:
            Stats dictionary
        """
        self.stats['total'] = len(testers)

        logger.info(f"Sending {template_type} emails to {len(testers)} testers...")

        for i, tester in enumerate(testers, 1):
            email = tester.get('email')

            if not email:
                logger.warning(f"Skipping tester with no email: {tester}")
                self.stats['skipped'] += 1
                continue

            # Get template
            template = self._get_email_template(template_type, tester)

            # Send email
            success = self.send_email(
                recipient_email=email,
                subject=template['subject'],
                html_body=template['html_body'],
                text_body=template['text_body']
            )

            if success:
                self.stats['sent'] += 1
            else:
                self.stats['failed'] += 1
                self.stats['failed_emails'].append(email)

            # Progress logging
            if i % 10 == 0:
                logger.info(f"Progress: {i}/{len(testers)} ({i*100//len(testers)}%)")

        return self.stats

    def send_from_csv(
        self,
        csv_path: str,
        template_type: str = "welcome"
    ) -> Dict:
        """Send emails from CSV file"""

        if not os.path.exists(csv_path):
            logger.error(f"CSV file not found: {csv_path}")
            return self.stats

        testers = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            testers = list(reader)

        return self.send_batch(testers, template_type)

    def print_stats(self):
        """Print sending statistics"""
        print("\n" + "=" * 60)
        print("Email Invitation Statistics")
        print("=" * 60)
        print(f"Total:     {self.stats['total']}")
        print(f"Sent:      {self.stats['sent']} ({self.stats['sent']*100//max(1,self.stats['total'])}%)")
        print(f"Failed:    {self.stats['failed']}")
        print(f"Skipped:   {self.stats['skipped']}")

        if self.stats['failed_emails']:
            print(f"\nFailed emails: {', '.join(self.stats['failed_emails'][:5])}")
            if len(self.stats['failed_emails']) > 5:
                print(f"... and {len(self.stats['failed_emails']) - 5} more")

        print("=" * 60 + "\n")


def main():
    """Main CLI"""
    parser = argparse.ArgumentParser(description="Send beta tester invitations")
    parser.add_argument(
        "--csv",
        help="CSV file with tester list"
    )
    parser.add_argument(
        "--email",
        help="Single email address"
    )
    parser.add_argument(
        "--template",
        default="welcome",
        choices=["welcome", "reminder", "feedback", "phase2"],
        help="Email template type"
    )
    parser.add_argument(
        "--phase",
        type=int,
        help="Phase number (for generating default CSV)"
    )
    parser.add_argument(
        "--count",
        type=int,
        help="Number of testers (with --phase)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be sent without actually sending"
    )
    parser.add_argument(
        "--api-key",
        help="SendGrid API key (or use SENDGRID_API_KEY env var)"
    )

    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("EigoMaster Beta Tester Invitation System")
    print("=" * 60)
    print(f"Template: {args.template}")
    if args.csv:
        print(f"CSV File: {args.csv}")
    if args.email:
        print(f"Email: {args.email}")
    if args.dry_run:
        print("Mode: DRY RUN (emails will not be sent)")
    print("=" * 60 + "\n")

    # Initialize manager
    manager = BetaInvitationManager(sendgrid_api_key=args.api_key)

    # Send emails
    if args.csv:
        if not os.path.exists(args.csv):
            logger.error(f"CSV file not found: {args.csv}")
            return

        logger.info(f"Reading testers from: {args.csv}")
        stats = manager.send_from_csv(args.csv, template_type=args.template)

    elif args.email:
        stats = manager.send_batch(
            [{'email': args.email}],
            template_type=args.template
        )

    elif args.phase and args.count:
        logger.info(f"Generating {args.count} test emails for Phase {args.phase}...")
        testers = [
            {'email': f"beta{args.phase}.tester{i:04d}@eigomaster.local"}
            for i in range(1, args.count + 1)
        ]
        stats = manager.send_batch(testers, template_type=args.template)

    else:
        parser.print_help()
        return

    manager.print_stats()

    print("Next steps:")
    print("1. Verify email delivery")
    print("2. Monitor open rates and clicks")
    print("3. Collect feedback from testers")
    print("4. Generate phase report")


if __name__ == "__main__":
    main()
