import paramiko
import os
import sys
import tarfile
import tempfile
import getpass

host = "19.16.1.100"
user = "root"
key_path = os.path.expanduser("~/.ssh/hexastudio_key")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(host, username=user, key_filename=key_path, timeout=15, look_for_keys=False, allow_agent=False)
    sftp = ssh.open_sftp()
    
    print("Syncing code to /home/hexa/hexastudio...", flush=True)
    
    local_path = os.path.dirname(os.path.abspath(__file__))
    excludes = {'.git', 'node_modules', '__pycache__', '.venv', 'dist', '.next', '.turbo', '.vercel', 'coverage', '.cache', '.agent', '.claude', '.cursor', '.beads', '.codeam', '.commandcode', '.cua-driver', '.dolt', '.gemini', '.git', '.hermes', '.junie', '.kilocode', '.kiro', '.local', '.mcporter', '.npm', '.nvm', '.opencode', '.paseo', '.qwen', '.spawn', '.terraform.d', '.trae', '.vibe', '.openclaw', '.qoder', '.sagemaker', 'firecrawl', 'firecrawl-docker', 'go', 'honcho', '.bun', '.lmstudio', '.codex', '.grok', '.minimax', '.snowflake', '.tabnine', '.junie', 'NUL', '--output', 'download.log', 'project.zip', 'quarantine-stale-deploy-20260714', 'overview.json', 'overview_architecture.puml', 'tui.json', 'security_upgrade_.log', 'signal-cli-0.14.6-Linux-native.tar.gz', 'signal-cli-0.14.6.tar.gz', 'clean_odoo_db.sh', 'cleanup-programdata.ps1', 'cloudflared.deb', 'CODEBASE_AUDIT_REPORT.md', 'coder-firecrawl-integration.md', 'coder_read_template.py', 'deploy-local.sh', 'docker-compose.dev.yml.example', 'docker-compose.yml', 'fix-easing-local.py', 'fix_pg_pw.sh', 'fix_pg_pw2.sh', 'fix_pg.sql', 'healthcheck.sh', 'push-bundle.sh', 'README.md', 'SECURITY.md', 'set_pw.sh', 'upload_script.py', 'upload_script_root.py', 'upload_script_root_v2.py', 'temp_deploy.py', 'broken-filenames-backup', 'stash-backup-20260817', 'analysis', 'docs', 'Hexa', 'hexa-hub'}
    
    # Create tar file
    with tempfile.NamedTemporaryFile(suffix='.tar.gz', delete=False) as tmp:
        tmp_path = tmp.name
    
    print(f"Creating archive from {local_path}...", flush=True)
    
    with tarfile.open(tmp_path, 'w:gz', compresslevel=6) as tar:
        for root, dirs, files in os.walk(local_path):
            # Filter excluded directories
            dirs[:] = [d for d in dirs if d not in excludes and not d.startswith('.')]
            
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_path)
                arcname = os.path.join('hexastudio', rel_path)
                
                # Skip large files
                try:
                    if os.path.getsize(full_path) > 50 * 1024 * 1024:  # Skip files > 50MB
                        continue
                except OSError:
                    continue
                    
                try:
                    tar.add(full_path, arcname=arcname)
                except Exception:
                    pass
    
    file_size = os.path.getsize(tmp_path)
    print(f"Created archive: {tmp_path} ({file_size / 1024 / 1024:.1f} MB)", flush=True)
    
    # Upload to server with a fresh connection
    remote_path = '/tmp/hexastudio_deploy.tar.gz'
    print("Uploading to server...", flush=True)
    
    # Reopen SFTP with longer timeout
    sftp = ssh.open_sftp()
    sftp.put(tmp_path, remote_path, callback=lambda sent, total: print(f"  Progress: {sent/1024/1024:.1f}MB / {total/1024/1024:.1f}MB", flush=True) if sent % 5000000 < 100000 else None)
    sftp.close()
    print("Upload complete!", flush=True)
    
    # Extract on server
    print("Extracting on server...", flush=True)
    stdin, stdout, stderr = ssh.exec_command(f"cd /home/hexa && tar -xzf {remote_path} && rm {remote_path}", timeout=120)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if exit_code != 0:
        print(f"Extract failed (exit {exit_code}): {err.strip()}", flush=True)
    else:
        print("Extracted code on server", flush=True)
    
    os.unlink(tmp_path)
    
finally:
    ssh.close()