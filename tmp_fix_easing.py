import os

root = '/home/hexa/hexastudio/apps/frontend/src'
for dirpath, dirnames, filenames in os.walk(root):
    for fn in filenames:
        if fn.endswith(('.tsx', '.ts')):
            fpath = os.path.join(dirpath, fn)
            with open(fpath, 'r') as f:
                content = f.read()
            new_content = content.replace("'var(--ease-out-expo)'", '[0.16, 1, 0.3, 1]')
            if new_content != content:
                with open(fpath, 'w') as f:
                    f.write(new_content)
                print(f'Fixed: {fpath}')
