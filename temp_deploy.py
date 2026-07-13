import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('19.16.1.100', port=22, username='root', key_filename='C:/Users/amrmo/.ssh/id_ed25519', timeout=15)

def run(cmd, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out.strip():
        print(out.strip()[:3000])
    if err.strip():
        print('STDERR: ' + err.strip()[:1000])
    return out

print('=== Deploy Script ===')
run('cat /home/hexa/hexastudio/scripts/deploy.sh 2>/dev/null || echo NO_DEPLOY_SH')
print()
print('=== Deploy.py ===')
run('cat /home/hexa/hexastudio/scripts/deploy.py 2>/dev/null || echo NO_DEPLOY_PY')
print()
print('=== Dockerfile on server ===')
run('cat /home/hexa/hexastudio/apps/frontend/Dockerfile')
print()
print('=== .dockerignore on server ===')
run('cat /home/hexa/hexastudio/.dockerignore 2>/dev/null || echo NO_DOCKERIGNORE')
print()
print('=== Git remote ===')
run('cd /home/hexa/hexastudio && git remote -v')
print()
print('=== All branches ===')
run('cd /home/hexa/hexastudio && git branch -a')
print()
print('=== Git log main ===')
run('cd /home/hexa/hexastudio && git log --oneline -10 main')
print()
print('=== Git log develop ===')
run('cd /home/hexa/hexastudio && git log --oneline -5 develop 2>/dev/null || echo NO_DEVELOP')
print()
print('=== Check .env file ===')
run('grep -E "NODE_ENV|NEXT_PUBLIC|PORT" /home/hexa/hexastudio/.env 2>/dev/null || echo NO_ENV')
print()

client.close()
