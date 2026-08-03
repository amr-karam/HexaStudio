import paramiko
paramiko.util.log_to_file('C:/Users/amrmo/OneDrive/Desktop/hexastudio.net/paramiko.log')
import sys
import os

host = "19.16.1.100"
user = "root"
# Key lives in the user SSH dir (never commit it). Falls back to repo-root copy
# only if the canonical location is absent.
home_key = os.path.expanduser("~/.ssh/hexastudio_key")
key_path = home_key if os.path.exists(home_key) else os.path.abspath("hexastudio_key")

print(f"Connecting to {user}@{host} using SSH Key: {key_path}...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15, look_for_keys=False, allow_agent=False)
    print("✓ Successfully connected to Production Host 19.16.1.100!")
    
    stdin, stdout, stderr = ssh.exec_command("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'", timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    
    if out:
        print("\n--- Production Docker Containers Status (19.16.1.100) ---")
        print(out)
    if err:
        print("\n--- Remote Output ---")
        print(err)
except Exception as e:
    print(f"SSH Error: {e}")
finally:
    ssh.close()
