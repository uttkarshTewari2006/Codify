from sqlmodel import Session, select
from database import engine, User

def promote_all_to_admin():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        if not users:
            print("No users found in database.")
            return
        
        for user in users:
            print(f"Promoting user: {user.email} (ID: {user.id})")
            user.isAdmin = True
            session.add(user)
        
        session.commit()
        print(f"Successfully promoted {len(users)} users to Admin.")

if __name__ == "__main__":
    promote_all_to_admin()
