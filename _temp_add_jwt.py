import paramiko
import os

host = "19.16.1.100"
user = "root"
key_path = os.path.expanduser("~/.ssh/hexastudio_key")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15, look_for_keys=False, allow_agent=False)
    
    # Add JWT keys to .env file
    stdin, stdout, stderr = ssh.exec_command("echo '' >> /home/hexa/hexastudio/.env && echo '# JWT Keys' >> /home/hexa/hexastudio/.env && echo 'JWT_PRIVATE_KEY=placeholder_jwt_private_key_value_here' >> /home/hexa/hexastudio/.env && echo 'JWT_PUBLIC_KEY=placeholder_jwt_public_key_value_here' >> /home/hexa/hexastudio/.env", timeout=10)
    
    # Check the updated .env
    stdin, stdout, stderr = ssh.exec_command("tail -10 /home/hexa/hexastudio/.env", timeout=10)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"Updated .env tail:\n{out}", flush=True)
    
finally:
    ssh.close()