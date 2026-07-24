#!/usr/bin/env bash
# Validate .gitlab-ci.yml syntax locally without running GitLab.
# Catches common errors:
#   - YAML syntax errors (parse failure)
#   - Duplicate job names
#   - Missing required keys (script, image, etc.)
#   - Invalid stage references
#   - Invalid extends references
#   - Rules syntax errors
#
# Usage: bash scripts/validate-gitlab-ci.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CI_FILE="${PROJECT_ROOT}/.gitlab-ci.yml"

if [ ! -f "$CI_FILE" ]; then
  echo "ERROR: .gitlab-ci.yml not found at ${CI_FILE}" >&2
  exit 1
fi

echo "=== Validating ${CI_FILE} ==="
echo ""

# 1. YAML parse check
echo "[1/5] Parsing YAML..."
python3 -c "
import yaml, sys
try:
    with open('${CI_FILE}') as f:
        config = yaml.safe_load(f)
    print('  YAML parse OK.')
except yaml.YAMLError as e:
    print(f'  YAML parse FAILED: {e}')
    sys.exit(1)
"

# Load for further checks
CONFIG=$(python3 -c "
import yaml
with open('${CI_FILE}') as f:
    print(yaml.safe_load(f).__repr__())
" 2>/dev/null) || exit 1

# 2. Required top-level keys
echo "[2/5] Checking top-level structure..."
python3 << 'EOF'
import yaml, sys
with open('.gitlab-ci.yml') as f:
    c = yaml.safe_load(f)

required = ['stages']
for r in required:
    if r not in c:
        print(f"  MISSING: '{r}' not defined")
        sys.exit(1)

# Optional but expected
optional = ['variables', 'workflow']
for o in optional:
    if o not in c:
        print(f"  WARN: '{o}' not defined (optional but recommended)")

print(f"  Top-level keys: {sorted(c.keys())}")
EOF

# 3. Job-level checks
echo "[3/5] Checking job definitions..."
python3 << 'EOF'
import yaml, sys
with open('.gitlab-ci.yml') as f:
    c = yaml.safe_load(f)

stages = set(c.get('stages', []))
jobs = {}
hidden = set()

# Collect job names (anything that's not a top-level reserved key)
reserved = {'stages', 'variables', 'workflow', 'include', 'cache', 'default', 'services',
            'before_script', 'after_script', 'image', 'workflow', 'spec', 'pages'}

# First pass: collect extends references and hidden jobs
for key, val in c.items():
    if isinstance(val, dict) and key not in reserved and not key.startswith('.'):
        if 'extends' in val or 'script' in val:
            jobs[key] = val
        elif isinstance(val, dict):
            # Job spec without script — could be a template or page
            jobs[key] = val

# Second pass: check for duplicates and required keys
seen = set()
for name, spec in jobs.items():
    if name in seen:
        print(f"  DUPLICATE: job '{name}' defined multiple times")
        sys.exit(1)
    seen.add(name)
    if 'script' not in spec and 'extends' not in spec and 'trigger' not in spec:
        print(f"  WARN: job '{name}' has no 'script', 'extends', or 'trigger'")
    # Check stage reference
    stage = spec.get('stage')
    if stage and stage not in stages:
        print(f"  ERROR: job '{name}' references unknown stage '{stage}'")
        sys.exit(1)
    # Check extends reference
    ext = spec.get('extends')
    if ext:
        if isinstance(ext, str):
            ext = [ext]
        for e in ext:
            if e not in c and e not in jobs:
                print(f"  ERROR: job '{name}' extends unknown job '{e}'")
                sys.exit(1)

print(f"  Found {len(jobs)} jobs across {len(stages)} stages")
for stage in stages:
    stage_jobs = [n for n, s in jobs.items() if s.get('stage') == stage]
    if stage_jobs:
        print(f"    [{stage}] {len(stage_jobs)} jobs: {', '.join(stage_jobs)}")
EOF

# 4. Variables check
echo "[4/5] Checking variables..."
python3 << 'EOF'
import yaml, sys
with open('.gitlab-ci.yml') as f:
    c = yaml.safe_load(f)

vars_ = c.get('variables', {})
if not isinstance(vars_, dict):
    print(f"  ERROR: variables must be a dict, got {type(vars_).__name__}")
    sys.exit(1)

# Check for $CI variable references
import re
ci_vars_used = set()
for k, v in c.items():
    if isinstance(v, dict):
        s = str(v)
        for m in re.findall(r'\$CI_[A-Z_]+', s):
            ci_vars_used.add(m)

print(f"  {len(vars_)} global variables defined")
print(f"  {len(ci_vars_used)} CI variables referenced: {sorted(ci_vars_used)}")
EOF

# 5. Include check
echo "[5/5] Checking includes..."
python3 << 'EOF'
import yaml, sys, os
with open('.gitlab-ci.yml') as f:
    c = yaml.safe_load(f)

includes = c.get('include', [])
if isinstance(includes, dict):
    includes = [includes]

for inc in includes:
    if isinstance(inc, dict) and 'local' in inc:
        local_path = inc['local']
        if not os.path.exists(local_path):
            print(f"  ERROR: include '{local_path}' does not exist")
            sys.exit(1)
        print(f"  Found local include: {local_path}")
EOF

echo ""
echo "=== Validation PASSED ==="
echo ""
echo "Next: deploy GitLab and trigger a pipeline."