import paramiko, sys, os, tempfile

cmd = sys.argv[1] if len(sys.argv) > 1 else "echo no command"
timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 600

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('19.16.1.100', username='root', password='iP@ssw0rd', timeout=10)

stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')

f1 = os.path.join(tempfile.gettempdir(), 'ssh_out.txt')
f2 = os.path.join(tempfile.gettempdir(), 'ssh_err.txt')
with open(f1, 'w', encoding='utf-8') as f:
    f.write(out)
with open(f2, 'w', encoding='utf-8') as f:
    f.write(err)

print("OK:" + f1)
if err.strip():
    print("ERR:" + f2)
client.close()
