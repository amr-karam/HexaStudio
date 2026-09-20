import paramiko
import sys
import os

host = "19.16.1.100"
user = "root"
key_path = os.path.expanduser("~/.ssh/hexastudio_key")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15)
    
    # Check what's in /root
    stdin, stdout, stderr = ssh.exec_command("ls -la /root/", timeout=15)
    out = stdout.read().decode('utf-8', errors='replace')
    print(f"Root dir: {out.strip()}")
    
    # Check if docker compose is running from a specific directory
    stdin, stdout, stderr = ssh.exec_command("docker inspect hexa-backend-blue --format '{{.Config.Labels}}' 2>/dev/null || echo 'NO_LABEL'", timeout=15)
    out = stdout.read().decode('utf-8', errors='replace')
    print(f"Backend label: {out.strip()}")
    
    # Check docker compose project directory
    stdin, stdout, stderr = ssh.exec_command("docker compose -f /root/hexastudio.net/docker-compose.prod.yml ps 2>/dev/null | head -5 || docker compose -f /opt/hexastudio/docker-compose.prod.yml ps 2>/dev/null | head -5 || echo 'NOT_FOUND'", timeout=15)
    out = stdout.read().decode('utf-8', errors='replace')
    print(f"Compose status: {out.strip()}")

finally:
    ssh.close()