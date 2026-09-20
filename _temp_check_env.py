import paramiko
import os

host = "19.16.1.100"
user = "root"
key_path = os.path.expanduser("~/.ssh/hexastudio_key")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15, look_for_keys=False, allow_agent=False)
    
    # Check .env file
    stdin, stdout, stderr = ssh.exec_command("cat /home/hexa/hexastudio/.env", timeout=10)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print(f".env contents:\n{out}", flush=True)
    
finally:
    ssh.close()