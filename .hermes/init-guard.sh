# Hermes Cycle Guard - auto-loaded by agents
# Source this at the start of any file-processing workflow
if [ -f ".hermes/guard_check.py" ]; then
    alias guard_check='python3 .hermes/guard_check.py'
    echo "[GUARD] Cycle guard loaded - processed tracker active"
fi
