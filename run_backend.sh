#!/bin/bash
./venv/bin/uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
