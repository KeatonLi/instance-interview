import os
os.environ['RESUME_DB_HOST'] = '111.231.107.210'
os.environ['RESUME_DB_PORT'] = '13306'
os.environ['RESUME_DB_USER'] = 'root'
os.environ['RESUME_DB_PASSWORD'] = 'interviewSQL'
os.environ['RESUME_DB_NAME'] = 'interview'

from config import settings
print('DB Host:', settings.RESUME_DB_HOST)
print('DB Port:', settings.RESUME_DB_PORT)
print('DB Name:', settings.RESUME_DB_NAME)
print('DATABASE_URL:', settings.DATABASE_URL)