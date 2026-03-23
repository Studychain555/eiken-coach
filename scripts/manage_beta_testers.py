#!/usr/bin/env python3
"""
Beta Tester Management System for EigoMaster
Manages beta tester enrollment, feedback tracking, and phase progression
"""

import os
import json
import csv
import secrets
import argparse
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional
import sqlite3

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BetaTesterManager:
    """Manages beta tester enrollment and tracking"""

    def __init__(self, db_path: str = "/tmp/beta_testers.db"):
        """Initialize beta tester manager"""
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize local SQLite database for beta tester tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create beta testers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS beta_testers (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                user_id TEXT UNIQUE,
                phase INTEGER NOT NULL DEFAULT 1,
                group_name TEXT DEFAULT 'internal',
                status TEXT DEFAULT 'active',
                feedback_count INTEGER DEFAULT 0,
                critical_bugs_found INTEGER DEFAULT 0,
                overall_rating REAL,
                enrolled_at TEXT,
                completed_at TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create feedback table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tester_feedback (
                id TEXT PRIMARY KEY,
                tester_id TEXT NOT NULL,
                feedback_text TEXT,
                rating REAL,
                bugs_count INTEGER DEFAULT 0,
                feature_requests TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tester_id) REFERENCES beta_testers(id)
            )
        """)

        conn.commit()
        conn.close()

    def _get_conn(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)

    def _generate_user_id(self) -> str:
        """Generate a unique user ID"""
        return f"user_{secrets.token_hex(8)}"

    def _generate_temp_password(self) -> str:
        """Generate a secure temporary password"""
        return secrets.token_urlsafe(16)

    def enroll_testers(self, phase: int, count: int, group: str = "internal") -> List[Dict]:
        """
        Enroll new beta testers

        Args:
            phase: Phase number (1, 2, or 3)
            count: Number of testers to enroll
            group: Tester group (internal, beta, broad)

        Returns:
            List of enrolled tester dictionaries
        """
        testers = []
        conn = self._get_conn()
        cursor = conn.cursor()

        logger.info(f"Enrolling {count} {group} testers for Phase {phase}...")

        for i in range(count):
            tester_id = f"tester_{phase}_{i+1:04d}"
            user_id = self._generate_user_id()
            email = f"beta{phase}.tester{i+1:04d}@eigomaster.local"
            temp_password = self._generate_temp_password()

            tester_data = {
                "id": tester_id,
                "email": email,
                "user_id": user_id,
                "phase": phase,
                "group": group,
                "status": "active",
                "temp_password": temp_password,
                "enrolled_at": datetime.now().isoformat()
            }

            try:
                cursor.execute("""
                    INSERT INTO beta_testers
                    (id, email, user_id, phase, group_name, status, enrolled_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    tester_data["id"],
                    tester_data["email"],
                    user_id,
                    phase,
                    group,
                    "active",
                    datetime.now().isoformat()
                ))

                testers.append(tester_data)

                if (i + 1) % 10 == 0:
                    logger.info(f"  Enrolled {i + 1}/{count} testers")

            except sqlite3.IntegrityError as e:
                logger.warning(f"Failed to enroll tester {i+1}: {e}")

        conn.commit()
        conn.close()

        logger.info(f"✓ Successfully enrolled {len(testers)} testers")
        return testers

    def record_feedback(
        self,
        tester_id: str,
        rating: float,
        bugs_count: int = 0,
        feedback_text: str = "",
        feature_requests: str = ""
    ) -> bool:
        """
        Record feedback from a beta tester

        Args:
            tester_id: Tester ID
            rating: Rating (1-5)
            bugs_count: Number of critical bugs found
            feedback_text: Feedback comments
            feature_requests: Feature request suggestions

        Returns:
            True if successful
        """
        if not 1 <= rating <= 5:
            logger.error("Rating must be between 1 and 5")
            return False

        conn = self._get_conn()
        cursor = conn.cursor()

        feedback_id = f"feedback_{secrets.token_hex(6)}"

        try:
            # Insert feedback
            cursor.execute("""
                INSERT INTO tester_feedback
                (id, tester_id, feedback_text, rating, bugs_count, feature_requests)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (feedback_id, tester_id, feedback_text, rating, bugs_count, feature_requests))

            # Update tester stats
            cursor.execute("""
                UPDATE beta_testers
                SET feedback_count = feedback_count + 1,
                    critical_bugs_found = critical_bugs_found + ?,
                    overall_rating = COALESCE(overall_rating, 0) * 0.5 + ? * 0.5
                WHERE id = ?
            """, (bugs_count, rating, tester_id))

            conn.commit()
            conn.close()

            logger.info(f"✓ Recorded feedback for {tester_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to record feedback: {e}")
            return False

    def generate_report(self, phase: int = None) -> Dict:
        """
        Generate phase report

        Args:
            phase: Phase number (None for all phases)

        Returns:
            Report dictionary
        """
        conn = self._get_conn()
        cursor = conn.cursor()

        if phase:
            cursor.execute("""
                SELECT phase, COUNT(*) as total,
                       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                       AVG(COALESCE(overall_rating, 0)) as avg_rating,
                       SUM(critical_bugs_found) as total_bugs,
                       COUNT(DISTINCT CASE WHEN feedback_count > 0 THEN id END) as provided_feedback
                FROM beta_testers
                WHERE phase = ?
                GROUP BY phase
            """, (phase,))
        else:
            cursor.execute("""
                SELECT phase, COUNT(*) as total,
                       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                       AVG(COALESCE(overall_rating, 0)) as avg_rating,
                       SUM(critical_bugs_found) as total_bugs,
                       COUNT(DISTINCT CASE WHEN feedback_count > 0 THEN id END) as provided_feedback
                FROM beta_testers
                GROUP BY phase
            """)

        rows = cursor.fetchall()
        conn.close()

        report = {
            "generated_at": datetime.now().isoformat(),
            "phases": []
        }

        for row in rows:
            phase_data, total, active, completed, avg_rating, total_bugs, feedback_count = row
            report["phases"].append({
                "phase": int(phase_data),
                "total_testers": total,
                "active": active or 0,
                "completed": completed or 0,
                "avg_rating": round(avg_rating or 0, 2),
                "critical_bugs_found": total_bugs or 0,
                "testers_with_feedback": feedback_count or 0,
                "feedback_rate": round((feedback_count or 0) / total * 100, 2) if total > 0 else 0
            })

        return report

    def progress_testers(
        self,
        from_phase: int,
        to_phase: int,
        criteria: Dict = None
    ) -> int:
        """
        Move testers from one phase to next based on criteria

        Args:
            from_phase: Current phase
            to_phase: Target phase
            criteria: Optional dict with criteria (e.g., {'min_rating': 4.0, 'max_bugs': 5})

        Returns:
            Number of testers progressed
        """
        if criteria is None:
            criteria = {}

        conn = self._get_conn()
        cursor = conn.cursor()

        min_rating = criteria.get('min_rating', 0)
        max_bugs = criteria.get('max_bugs', float('inf'))

        try:
            cursor.execute("""
                UPDATE beta_testers
                SET phase = ?, updated_at = ?
                WHERE phase = ? AND overall_rating >= ? AND critical_bugs_found <= ?
            """, (to_phase, datetime.now().isoformat(), from_phase, min_rating, max_bugs))

            conn.commit()
            progressed = cursor.rowcount

            logger.info(f"✓ Progressed {progressed} testers from Phase {from_phase} to Phase {to_phase}")
            return progressed

        except Exception as e:
            logger.error(f"Failed to progress testers: {e}")
            return 0
        finally:
            conn.close()

    def export_testers_csv(self, phase: int, output_path: str) -> str:
        """
        Export tester list to CSV

        Args:
            phase: Phase number
            output_path: Output CSV file path

        Returns:
            Path to output file
        """
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, email, user_id, phase, group_name, status, enrolled_at
            FROM beta_testers
            WHERE phase = ?
            ORDER BY enrolled_at
        """, (phase,))

        rows = cursor.fetchall()
        conn.close()

        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['ID', 'Email', 'User ID', 'Phase', 'Group', 'Status', 'Enrolled At'])

            for row in rows:
                writer.writerow(row)

        logger.info(f"✓ Exported {len(rows)} testers to {output_path}")
        return output_path

    def list_testers(self, phase: int = None, status: str = None) -> List[Dict]:
        """
        List beta testers

        Args:
            phase: Filter by phase
            status: Filter by status

        Returns:
            List of tester dictionaries
        """
        conn = self._get_conn()
        cursor = conn.cursor()

        query = "SELECT * FROM beta_testers WHERE 1=1"
        params = []

        if phase is not None:
            query += " AND phase = ?"
            params.append(phase)

        if status is not None:
            query += " AND status = ?"
            params.append(status)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        # Convert to list of dicts
        testers = []
        for row in rows:
            testers.append({
                'id': row[0],
                'email': row[1],
                'user_id': row[2],
                'phase': row[3],
                'group': row[4],
                'status': row[5],
                'feedback_count': row[6],
                'bugs_found': row[7],
                'rating': row[8]
            })

        return testers


def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description="Beta Tester Management System")
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Enroll command
    enroll_parser = subparsers.add_parser("enroll", help="Enroll new beta testers")
    enroll_parser.add_argument("--phase", type=int, default=1, help="Phase number")
    enroll_parser.add_argument("--count", type=int, default=100, help="Number of testers to enroll")
    enroll_parser.add_argument("--group", default="internal", help="Tester group")
    enroll_parser.add_argument("--output", default="testers_phase_{phase}.csv", help="Output CSV file")

    # Feedback command
    feedback_parser = subparsers.add_parser("feedback", help="Record tester feedback")
    feedback_parser.add_argument("--tester-id", required=True, help="Tester ID")
    feedback_parser.add_argument("--rating", type=float, required=True, help="Rating (1-5)")
    feedback_parser.add_argument("--bugs", type=int, default=0, help="Number of bugs found")
    feedback_parser.add_argument("--text", default="", help="Feedback text")
    feedback_parser.add_argument("--features", default="", help="Feature requests")

    # Report command
    report_parser = subparsers.add_parser("report", help="Generate phase report")
    report_parser.add_argument("--phase", type=int, help="Phase number (optional)")
    report_parser.add_argument("--output", default="/tmp/beta_report.json", help="Output JSON file")

    # Progress command
    progress_parser = subparsers.add_parser("progress", help="Move testers to next phase")
    progress_parser.add_argument("--from-phase", type=int, required=True, help="Current phase")
    progress_parser.add_argument("--to-phase", type=int, required=True, help="Target phase")
    progress_parser.add_argument("--min-rating", type=float, default=0, help="Minimum rating")
    progress_parser.add_argument("--max-bugs", type=int, default=999, help="Maximum bugs allowed")

    # List command
    list_parser = subparsers.add_parser("list", help="List beta testers")
    list_parser.add_argument("--phase", type=int, help="Filter by phase")
    list_parser.add_argument("--status", help="Filter by status")

    args = parser.parse_args()

    manager = BetaTesterManager()

    if args.command == "enroll":
        logger.info(f"Enrolling {args.count} testers for Phase {args.phase}...")
        testers = manager.enroll_testers(
            phase=args.phase,
            count=args.count,
            group=args.group
        )

        # Export to CSV
        output_file = args.output.format(phase=args.phase)
        manager.export_testers_csv(args.phase, output_file)

        logger.info(f"✓ Enrolled {len(testers)} testers")
        logger.info(f"✓ Exported to: {output_file}")

    elif args.command == "feedback":
        manager.record_feedback(
            tester_id=args.tester_id,
            rating=args.rating,
            bugs_count=args.bugs,
            feedback_text=args.text,
            feature_requests=args.features
        )

    elif args.command == "report":
        report = manager.generate_report(phase=args.phase)

        with open(args.output, 'w') as f:
            json.dump(report, f, indent=2)

        logger.info(f"✓ Report saved to: {args.output}")
        print("\nReport:")
        print(json.dumps(report, indent=2))

    elif args.command == "progress":
        count = manager.progress_testers(
            from_phase=args.from_phase,
            to_phase=args.to_phase,
            criteria={
                'min_rating': args.min_rating,
                'max_bugs': args.max_bugs
            }
        )
        logger.info(f"Progressed {count} testers")

    elif args.command == "list":
        testers = manager.list_testers(phase=args.phase, status=args.status)
        print(f"\nTotal: {len(testers)} testers\n")

        for tester in testers:
            print(f"  {tester['id']:20} | {tester['email']:35} | Phase {tester['phase']} | {tester['status']}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
