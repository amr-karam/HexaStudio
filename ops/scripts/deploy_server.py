import paramiko
import sys
import os

host = "19.16.1.100"
user = "root"
key_path = r"C:\Users\amrmo\.ssh\hexastudio_key"

print(f"Connecting to {user}@{host} using SSH Key: {key_path}...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15)
    print("✓ Connected to 19.16.1.100 successfully!")
    
    cmd = "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
    print(f"Running remote command: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    
    output = stdout.read().decode('utf-8', errors='replace')
    error = stderr.read().decode('utf-8', errors='replace')
    
    if output:
        print("\n--- Production Docker Containers Status ---")
        print(output)
    if error:
        print("\n--- Remote Stderr ---")
        print(error)
        
except Exception as e:
    print(f"SSH Execution Error: {e}")
finally:
    ssh.close()
