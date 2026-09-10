#!/usr/bin/env python3
"""Test gitleaks detection with different modes."""
import os
import sys
import tempfile
import shutil
import subprocess

def run_gitleaks(args, files):
    """Create temp dir with files, run gitleaks with given args, return result."""
    tmpdir = tempfile.mkdtemp(prefix="gitleaks_test_")
    try:
        for path, content in files.items():
            full_path = os.path.join(tmpdir, path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'w') as f:
                f.write(content)
        
        cmd = ["./gitleaks.exe", "detect", "--source", tmpdir] + args
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        return result
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

def main():
    repo_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(repo_root)
    
    # Test files with known secrets
    secret_files = {
        "config.py": """AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'
AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
"""
    }
    
    test_cases = [
        ("Default config, --no-git", ["--no-git", "--verbose", "--redact"]),
        ("Default config, no flags", ["--verbose", "--redact"]),
        ("With .gitleaks.toml, --no-git", ["--no-git", "--config", "./.gitleaks.toml", "--verbose", "--redact"]),
        ("With .gitleaks.toml, no flags", ["--config", "./.gitleaks.toml", "--verbose", "--redact"]),
    ]
    
    print("Testing gitleaks detection modes")
    print("=" * 60)
    
    for name, args in test_cases:
        result = run_gitleaks(args, secret_files)
        print(f"\n=== {name} ===")
        print(f"Command: ./gitleaks.exe detect --source <tmp> {' '.join(args)}")
        print(f"Exit code: {result.returncode}")
        if result.stdout.strip():
            print(f"STDOUT (first 500 chars):\n{result.stdout[:500]}")
        if result.stderr.strip():
            print(f"STDERR (first 500 chars):\n{result.stderr[:500]}")
        print(f"Detected secrets: {'YES' if result.returncode != 0 else 'NO'}")
    
    print("\n" + "=" * 60)
    print("Note: Exit code 0 = clean, non-zero = secrets detected")

if __name__ == "__main__":
    main()
