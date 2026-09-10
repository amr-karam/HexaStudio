#!/usr/bin/env python3
"""Test gitleaks on clean and secret-containing files."""
import os
import sys
import tempfile
import shutil
import subprocess

def run_test(name, files):
    """Create temp dir with files, run gitleaks, report results."""
    tmpdir = tempfile.mkdtemp(prefix="gitleaks_test_")
    try:
        for path, content in files.items():
            full_path = os.path.join(tmpdir, path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'w') as f:
                f.write(content)
        
        result = subprocess.run(
            ["./gitleaks.exe", "detect", "--source", tmpdir, 
             "--no-git", "--config", "./.gitleaks.toml",
             "--verbose", "--redact"],
            capture_output=True, text=True, timeout=30
        )
        
        print(f"\n=== {name} ===")
        print(f"Exit code: {result.returncode}")
        if result.stdout:
            print(f"STDOUT:\n{result.stdout}")
        if result.stderr:
            print(f"STDERR:\n{result.stderr}")
        
        if result.returncode == 0:
            print(f"✓ {name}: CLEAN (no secrets detected)")
        else:
            print(f"✗ {name}: SECRETS DETECTED")
        
        return result.returncode == 0
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

def main():
    repo_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(repo_root)
    
    print("Testing gitleaks pre-commit hook validation")
    print("=" * 50)
    
    # Test 1: Clean file should pass
    clean_files = {
        "test.txt": "This is a clean file with no secrets.\nJust regular code and text.\n"
    }
    clean_pass = run_test("Clean file", clean_files)
    
    # Test 2: File with AWS key should be caught
    secret_files = {
        "config.py": "AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'\nAWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'\n"
    }
    secret_pass = run_test("File with AWS key", secret_files)
    
    # Test 3: File with GitLab PAT pattern
    gl_pat_files = {
        "gitlab_config.env": "GITLAB_TOKEN=glpat-1234567890abcdefghij\n"
    }
    gl_pass = run_test("File with GitLab PAT", gl_pat_files)
    
    # Test 4: File with generic secret pattern
    generic_secret = {
        "secrets.txt": "password = supersecret123\napi_key = sk-1234567890abcdef\n"
    }
    generic_pass = run_test("File with generic secrets", generic_secret)
    
    print("\n" + "=" * 50)
    print("SUMMARY:")
    print(f"  Clean file detection:      {'PASS' if clean_pass else 'FAIL'} (should be clean)")
    print(f"  AWS key detection:         {'PASS' if not secret_pass else 'FAIL'} (should detect)")
    print(f"  GitLab PAT detection:      {'PASS' if not gl_pass else 'FAIL'} (should detect)")
    print(f"  Generic secret detection:  {'PASS' if not generic_pass else 'FAIL'} (should detect)")
    
    all_pass = clean_pass and not secret_pass and not gl_pass and not generic_pass
    print(f"\nOverall: {'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}")
    
    return 0 if all_pass else 1

if __name__ == "__main__":
    sys.exit(main())
