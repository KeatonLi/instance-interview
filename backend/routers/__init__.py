"""Routers package"""
# Import modules so main.py can access module.router
import routers.auth as auth
import routers.resume as resume
import routers.shared as shared

__all__ = ["auth", "resume", "shared"]
