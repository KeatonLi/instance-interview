#!/bin/bash
cd /mnt/d/programs/instance-interview/backend-python
/tmp/pyenv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8083