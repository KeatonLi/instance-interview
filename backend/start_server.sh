#!/bin/bash
cd /mnt/d/programs/instance-interview/backend-python
export RESUME_DB_HOST=111.231.107.210
export RESUME_DB_PORT=13306
export RESUME_DB_USER=interview
export RESUME_DB_PASSWORD=interviewSQL
export RESUME_DB_NAME=interview
export RESUME_PORT=8082
nohup python3 main.py > /tmp/py_backend.log 2>&1 &
echo "Started with PID: $!"