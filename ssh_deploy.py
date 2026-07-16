import paramiko
import sys

host = "19.16.1.100"
user = "root"
password = "iP@ssw0rd"
command = sys.argv[1] if len(sys.argv) > 1 else "echo no command"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=user, password=password, timeout=15)
    stdin, stdout, stderr = ssh.exec_command(command, timeout=600, get_pty=True)
    exit_code = stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8', errors='replace')
    error = stderr.read().decode('utf-8', errors='replace')
    if output:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        print(output)
    if error:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
        print(error, file=sys.stderr)
    sys.exit(exit_code)
except Exception as e:
    print(f"SSH Error: {str(e).encode('ascii', errors='replace').decode()}", file=sys.stderr)
    sys.exit(1)
finally:
    ssh.close()
