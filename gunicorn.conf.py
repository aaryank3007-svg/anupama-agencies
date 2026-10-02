import os

# Production Gunicorn configuration
# Automatically binds to PORT environment variable provided by Render, Railway, Koyeb, etc.
port = os.environ.get('PORT', '5000')
bind = f"0.0.0.0:{port}"

# Concurrency & timeout settings for cloud containers
workers = int(os.environ.get('WEB_CONCURRENCY', '2'))
threads = 2
timeout = 120
keepalive = 5
accesslog = '-'
errorlog = '-'
