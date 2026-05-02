import os

from sqlalchemy import create_engine, inspect


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is not set")

    engine = create_engine(database_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Tables:", tables)

    for table_name in ["User", "Roadmap", "Task", "Deadline", "FeedbackLog"]:
        if table_name in tables:
            print(f"{table_name} table exists")
        else:
            print(f"{table_name} table missing")


if __name__ == "__main__":
    main()
