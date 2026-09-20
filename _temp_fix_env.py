import paramiko
import os

host = "19.16.1.100"
user = "root"
key_path = os.path.expanduser("~/.ssh/hexastudio_key")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15, look_for_keys=False, allow_agent=False)
    
    # Add JWT keys to .env
    new_keys = """# JWT
JWT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3V5A1C2c3V2k1LmN0YXR1cy01NIYqKeQ5cC3N0b3JhZ24g
b2ZmIjoiIiIKXmkYXNxTWluMjU2Iiw6ICJUZXN0IiwgKkF0VyIsIHN0YXR1cy01
NIS9jZl9pZCIsIGVudHJ5PSIzMi4wLjAiLCBjaGFyIC0gNDUiLCBlcnJvciA9InBh
c3M3IiwgYmF0aW50NjQ9IiwgaWQ9ImFkbWluLmpzb24iLCBoZWxwPSIyNTAuMC4w
LjEwIiwgc3lzdGVtLCBzZWN1cmV0aW1lPSJodHRwczovL2RldmljZS53ZWJzZGxv
bmUub3JnL2FwaS92MS9sb2dvIiwgc2VjdXJ0aWfsW2t5aWV0ZTE6IHsicGFzc3dv
cGUiOiAiYXBpX2lkIiwgInRpbWVzdGFtcCI6ICJIZXJwIFJlZ2lzdHJ5IiwidHlw
ZSI6ICJgYXJ0aWNsZS8qMSJ9fQ==
-----END RSA PRIVATE KEY-----
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
RSIGQUKHaCuHe0J4Ap8ZyA2c3V2k1LmN0YXR1cy01NIYqKeQ5cC3N0b3JhZ24g
b2ZmIjoiIiI=
-----END PUBLIC KEY-----
"""
    
    stdin, stdout, stderr = ssh.exec_command(f"cat /home/hexa/hexastudio/.env > /home/hexa/hexastudio/.env.old", timeout=10)
    print(f"Backup created: {stdout.read().decode('utf-8', errors='replace').strip()}", flush=True)
    
    stdin, stdout, stderr = ssh.exec_command("echo -e '\\n# JWT' >> /home/hexa/hexastudio/.env && echo 'JWT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\\nMIIEpAIBAAKCAQEA0Z3V5A1C2c3V2k1LmN0YXR1cy01NIYqKeQ5cC3N0b3JhZ24g\\nb2ZmIjoiIiIKXmkYXNxTWluMjU2Iiw6ICJUZXN0IiwgKkF0VyIsIHN0YXR1cy01NIS9jZl9pCIsIGVudHJ5PSIzMi4wLjAiLCBjaGFyIC0gNDUiLCBlcnJvciA9InBhc3M3IiwgYmF0aW50NjQ9IiwgaWQ9ImFkbWluLmpzb24iLCBoZWxwPSIyNTAuMC4wLjEwIiwgc3lzdGVtLCBzZWN1cmV0aW1lPSJodHRwczovL2RldmljZS53ZWJzZGxvbmUub3JnL2FwaS92MS9sb2dvIiwgc2VjdXJ0aWfsW2t5aWV0ZTE6IHsicGFzc3dvcGUiOiAiYXBpX2lkIiwgInRpbWVzdGFtcCI6ICJIZXJwIFJlZ2lzdHJ5IiwidHlwZSI6ICJgYXJ0aWNsZS8qMSJ9fQ==' >> /home/hexa/hexastudio/.env && echo 'JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\\nRSIGQUKHaCuHe0J4Ap8ZyA2c3V2k1LmN0YXR1cy01NIYqKeQ5cC3N0b3JhZ24g\\nb2ZmIjoiIiI=' >> /home/hexa/hexastudio/.env", timeout=10)
    print(f"Updated .env: {stdout.read().decode('utf-8', errors='replace').strip()}", flush=True)
    
finally:
    ssh.close()