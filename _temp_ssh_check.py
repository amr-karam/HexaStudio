import paramiko
import sys
import os
import json

host = "19.16.1.100"
user = "root"
key_path = os.path.expanduser("~/.ssh/hexastudio_key")

print(f"Connecting to {host}...", flush=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15)
    print("Connected successfully!", flush=True)
    
    commands = [
        "ls /root/hexastudio.net 2>/dev/null | head -5 || echo 'NOT_FOUND'",
        "git -C /root/hexastudio.net log --oneline -1 2>/dev/null || echo 'NO_GIT'",
    ]
    
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=15)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        if out:
            print(f"OUT: {out.strip()}", flush=True)
        if err:
            print(f"ERR: {err.strip()}", flush=True)
            
except Exception as e:
    print(f"ERROR: {e}", flush=True)
finally:
    ssh.close()