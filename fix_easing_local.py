import os

root = 'apps/frontend/src'
replacements = {
    "'var(--ease-out-expo)'": '[0.16, 1, 0.3, 1]',
    "'var(--ease-luxury)'": '[0.34, 1.56, 0.64, 1]',
    "'var(--ease-out-quint)'": '[0.23, 1, 0.32, 1]',
    "'var(--ease-in-out-expo)'": '[0.87, 0, 0.13, 1]',
}

for dirpath, dirnames, filenames in os.walk(root):
    for fn in filenames:
        if fn.endswith(('.tsx', '.ts')):
            fpath = os.path.join(dirpath, fn)
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    content = f.read()
                changed = False
                for old, new in replacements.items():
                    if old in content:
                        content = content.replace(old, new)
                        changed = True
                if changed:
                    with open(fpath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Fixed: {fpath}')
            except Exception as e:
                print(f'Error processing {fpath}: {e}')
