"""
Helper script to initialize the superadmin user account in Supabase auth and database
"""
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.db import get_service_db

ADMIN_EMAIL = "datascientistvishu@gmail.com"
ADMIN_PASSWORD = "demo@#$%"
ADMIN_COMPANY = "Platform Administration"

def setup_admin():
    try:
        db = get_service_db()
        print(f"Connecting to Supabase at: {db.supabase_url}")
        
        # 1. Check if the profile already exists in users table
        print(f"Checking if user profile exists for: {ADMIN_EMAIL}")
        profile_res = db.table("users").select("*").eq("email", ADMIN_EMAIL).execute()
        
        user_id = None
        if profile_res.data:
            user_id = profile_res.data[0]["id"]
            print(f"Found existing profile. User ID: {user_id}")
            
            # Update role to admin if it isn't already
            try:
                if "role" in profile_res.data[0] and profile_res.data[0].get("role") != "admin":
                    print("Updating role to 'admin'...")
                    db.table("users").update({"role": "admin"}).eq("id", user_id).execute()
                    print("Role updated successfully.")
                else:
                    print("User profile exists.")
            except Exception as pe:
                print(f"Notice: 'role' column could not be updated ({pe}). Be sure to run supabase_role_patch.sql.")
        else:
            print("No profile found. Checking Supabase Auth users...")
            # We list users via auth admin API to see if auth exists but profile is missing
            auth_users_res = db.auth.admin.list_users()
            existing_auth_user = None
            for u in auth_users_res:
                if u.email == ADMIN_EMAIL:
                    existing_auth_user = u
                    break
            
            if existing_auth_user:
                user_id = existing_auth_user.id
                print(f"Auth user exists with ID: {user_id}. Creating missing database profile...")
            else:
                print("Creating new user in Supabase Auth...")
                auth_res = db.auth.admin.create_user({
                    "email": ADMIN_EMAIL,
                    "password": ADMIN_PASSWORD,
                    "email_confirm": True,
                    "user_metadata": {
                        "company_name": ADMIN_COMPANY,
                        "first_name": "Super",
                        "last_name": "Admin"
                    }
                })
                if not auth_res or not auth_res.user:
                    print("Error: Failed to create user in Auth.")
                    return
                user_id = auth_res.user.id
                print(f"Created new Auth user with ID: {user_id}")
            
            # Insert profile in public.users
            print("Inserting database user profile...")
            user_profile = {
                "id": user_id,
                "email": ADMIN_EMAIL,
                "company_name": ADMIN_COMPANY,
                "first_name": "Super",
                "last_name": "Admin",
                "role": "admin"
            }
            try:
                db.table("users").insert(user_profile).execute()
                print("Database profile created successfully.")
            except Exception as pe:
                err_msg = str(pe)
                if "role" in err_msg or "PGRST204" in err_msg:
                    print("Notice: 'role' column is not yet created in public.users table.")
                    print("Inserting user profile without 'role' field. (You must run supabase_role_patch.sql later to complete database updates.)")
                    if "role" in user_profile:
                        del user_profile["role"]
                    db.table("users").insert(user_profile).execute()
                    print("Database profile created successfully (without 'role' field).")
                else:
                    raise
            
        print("\n=== SETUP SUCCESSFUL ===")
        print(f"Login Email: {ADMIN_EMAIL}")
        print(f"Password: {ADMIN_PASSWORD}")
        print("Note: If you haven't yet, run backend/supabase_role_patch.sql in your Supabase SQL editor.")
        print("=========================")

    except Exception as e:
        print(f"\nError occurred during setup: {e}")

if __name__ == "__main__":
    setup_admin()
