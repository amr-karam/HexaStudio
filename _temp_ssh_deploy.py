import paramiko
import os
import sys

host = "19.16.1.100"
user = "root"
key_path = os.path.expanduser("~/.ssh/hexastudio_key")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15, look_for_keys=False, allow_agent=False)
    print("Connected to production!", flush=True)
    
    # Check git repo in /home/hexa/hexastudio
    stdin, stdout, stderr = ssh.exec_command("cd /home/hexa/hexastudio && git rev-parse --git-dir 2>/dev/null && echo 'GIT_REPO' || echo 'NOT_GIT'", timeout=10)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"Git repo check: {out}", flush=True)
    
    # If it's a git repo, check current status
    if out == 'GIT_REPO':
        stdin, stdout, stderr = ssh.exec_command("cd /home/hexa/hexastudio && git status --short", timeout=10)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        print(f"Git status: {out}", flush=True)
        
        stdin, stdout, stderr = ssh.exec_command("cd /home/hexa/hexastudio && git log --oneline -1", timeout=10)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        print(f"Git HEAD: {out}", flush=True)
    
finally:
    ssh.close()