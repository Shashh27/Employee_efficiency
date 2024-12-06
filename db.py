from databases import Database

# Database URL for PostgreSQL (adjust with your actual credentials)
DATABASE_URL = "postgresql+asyncpg://postgres:cmticmti2024@172.18.100.101/postgres"

# Initialize the database connection
database = Database(DATABASE_URL)

# Function to connect to the database
async def connect_db():
    await database.connect()

# Function to disconnect from the database
async def disconnect_db():
    await database.disconnect()
