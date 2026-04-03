"""
NAVAVED Admin User Management Utility

Usage:
    # From backend directory with venv activated:
    
    # List all users
    python manage_users.py list
    
    # Add a new admin user
    python manage_users.py add --email admin2@gmail.com --password newpass123 --name "Admin Two"
    
    # Reset a user's password
    python manage_users.py reset-password --email admin@gmail.com --password newSecurePass456
    
    # Change user status (ACTIVE/INACTIVE)
    python manage_users.py set-status --email admin@gmail.com --status INACTIVE
"""

import sys
import asyncio
import argparse
from datetime import datetime, timezone

from sqlalchemy import select, update
from app.database import engine, async_session, create_tables
from app.models.user import User
from app.services.auth_service import hash_password


async def list_users():
    """List all users and their details."""
    async with async_session() as db:
        result = await db.execute(select(User).order_by(User.created_at.desc()))
        users = result.scalars().all()
        
        if not users:
            print("\n❌ No users found.\n")
            return

        print(f"\n{'='*80}")
        print(f"{'EMAIL':<30} {'NAME':<20} {'ROLE':<10} {'STATUS':<10} {'CREATED':<20}")
        print(f"{'='*80}")
        for u in users:
            print(f"{u.email:<30} {u.user_name:<20} {u.role:<10} {u.status:<10} {str(u.created_at)[:19]}")
        print(f"{'='*80}")
        print(f"Total: {len(users)} user(s)\n")


async def add_user(email: str, password: str, name: str, role: str = "ADMIN"):
    """Add a new user."""
    async with async_session() as db:
        # Check if email already exists
        result = await db.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"\n❌ User with email '{email}' already exists!\n")
            return

        user = User(
            user_name=name,
            email=email,
            password_hash=hash_password(password),
            mobile="",
            role=role,
            status="ACTIVE",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        print(f"\n✅ User CREATED successfully!")
        print(f"   Email:    {user.email}")
        print(f"   Name:     {user.user_name}")
        print(f"   Role:     {user.role}")
        print(f"   User ID:  {user.user_id}")
        print(f"   Password: {'*' * len(password)} (bcrypt hashed — CANNOT be retrieved)")
        print()


async def reset_password(email: str, new_password: str):
    """Reset a user's password."""
    async with async_session() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"\n❌ No user found with email '{email}'")
            print("   Run 'python manage_users.py list' to see all users.\n")
            return

        user.password_hash = hash_password(new_password)
        user.updated_at = datetime.now(timezone.utc)
        await db.commit()
        
        print(f"\n✅ Password RESET successfully!")
        print(f"   Email:        {user.email}")
        print(f"   New Password: {'*' * len(new_password)} (bcrypt hashed)")
        print(f"   Note:         Old password can NEVER be retrieved (bcrypt is one-way)")
        print()


async def set_status(email: str, status: str):
    """Change a user's status."""
    status = status.upper()
    if status not in ("ACTIVE", "INACTIVE"):
        print(f"\n❌ Invalid status: {status}. Must be ACTIVE or INACTIVE.\n")
        return
        
    async with async_session() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"\n❌ No user found with email '{email}'\n")
            return

        old_status = user.status
        user.status = status
        user.updated_at = datetime.now(timezone.utc)
        await db.commit()
        
        print(f"\n✅ Status CHANGED: {old_status} → {status}")
        print(f"   Email: {user.email}")
        if status == "INACTIVE":
            print(f"   ⚠️  This user can NO longer log in!")
        print()


def main():
    parser = argparse.ArgumentParser(
        description="NAVAVED Admin User Management",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python manage_users.py list
  python manage_users.py add --email admin2@gmail.com --password pass123 --name "Admin 2"
  python manage_users.py reset-password --email admin@gmail.com --password newpass
  python manage_users.py set-status --email admin@gmail.com --status INACTIVE
        """,
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # List
    subparsers.add_parser("list", help="List all users")
    
    # Add
    add_parser = subparsers.add_parser("add", help="Add a new user")
    add_parser.add_argument("--email", required=True, help="User email")
    add_parser.add_argument("--password", required=True, help="User password")
    add_parser.add_argument("--name", required=True, help="User display name")
    add_parser.add_argument("--role", default="ADMIN", choices=["ADMIN", "USER"], help="User role (default: ADMIN)")
    
    # Reset password
    reset_parser = subparsers.add_parser("reset-password", help="Reset a user's password")
    reset_parser.add_argument("--email", required=True, help="User email")
    reset_parser.add_argument("--password", required=True, help="New password")
    
    # Set status
    status_parser = subparsers.add_parser("set-status", help="Change user status")
    status_parser.add_argument("--email", required=True, help="User email")
    status_parser.add_argument("--status", required=True, choices=["ACTIVE", "INACTIVE"], help="New status")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return

    if args.command == "list":
        asyncio.run(list_users())
    elif args.command == "add":
        asyncio.run(add_user(args.email, args.password, args.name, args.role))
    elif args.command == "reset-password":
        asyncio.run(reset_password(args.email, args.password))
    elif args.command == "set-status":
        asyncio.run(set_status(args.email, args.status))


if __name__ == "__main__":
    main()
