import paramiko
import sys
import os

host = "19.16.1.100"
user = "root"
password = "iP@ssw0rd"
local_path = "scripts/deploy-zero-downtime.sh"
remote_path = "/root/scripts/deploy-zero-downtime.sh"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=password)

# Use SSH to create the directory to avoid SFTP mkdir issues
ssh.exec_command("mkdir -p /root/scripts")

sftp = ssh.open_sftp()
sftp.put(local_path, remote_path)
sftp.chmod(remote_path, 0o755)
sftp.close()
ssh.close()
print("File uploaded successfully")
