import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('19.16.1.100', port=22, username='root', key_filename='C:/Users/amrmo/.ssh/id_ed25519', timeout=15)

def run(cmd, timeout=60):
    print(f"\n>>> {cmd[:150]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.recv_exit_status()
    if out.strip():
        print(out.strip()[:3000])
    if err.strip() and exit_code != 0:
        print(f"STDERR: {err.strip()[:1500]}")
    return exit_code, out, err

# First, push the updated Dockerfile to the server
print("=" * 60)
print("STEP 1: Update Dockerfile on server with fixed ENV format")
print("=" * 60)
run("cd /home/hexa/hexastudio && git fetch origin && git reset --hard origin/main", 30)

# Step 2: Clean everything and rebuild with docker compose
print("\n" + "=" * 60)
print("STEP 2: Full clean rebuild with docker compose")
print("=" * 60)
exit_code, out, err = run(
    "cd /home/hexa/hexastudio && docker compose -f docker-compose.prod.yml build --no-cache frontend 2>&1",
    600
)

# Check the build output for page count
combined = out + err
if "Generating static pages" in combined:
    idx = combined.find("Generating static pages (0/")
    if idx >= 0:
        section = combined[idx:idx+200]
        print(f"\n>>> BUILD RESULT: {section[:100]}")
    idx = combined.find("Generating static pages (18/")
    if idx >= 0:
        print("\n>>> ALL 18 PAGES GENERATED!")
    else:
        idx = combined.find("Generating static pages (3/")
        if idx >= 0:
            print("\n>>> STILL ONLY 3 PAGES - Docker build issue persists")

if "Compiled successfully" in combined:
    print("\n>>> Compilation: SUCCESS")
elif "Compiled with warnings" in combined:
    print("\n>>> Compilation: SUCCESS (with warnings)")

# Step 3: Restart frontend
print("\n" + "=" * 60)
print("STEP 3: Restart frontend")
print("=" * 60)
run("cd /home/hexa/hexastudio && docker compose -f docker-compose.prod.yml up -d frontend", 60)

import time
time.sleep(8)

# Step 4: Test
print("\n" + "=" * 60)
print("STEP 4: Test all routes")
print("=" * 60)
routes = ["/", "/about", "/portfolio", "/contact", "/services", "/blog", "/portal"]
for route in routes:
    run(f"curl -s -o /dev/null -w '{route}: HTTP %{{http_code}} Size: %{{size_download}}\\n' https://hexastudio.net{route}", 15)

client.close()
