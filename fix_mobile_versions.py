import json, shutil, os

base = r'C:\Users\amrmo\workspace\hexastudio.net'

# 1. Update package.json
mobile_pkg = os.path.join(base, 'apps/mobile/package.json')
with open(mobile_pkg) as f:
    pkg = json.load(f)
pkg['dependencies']['react'] = '19.2.8'
pkg['dependencies']['react-dom'] = '19.2.8'
pkg['devDependencies']['react-test-renderer'] = '19.2.8'
with open(mobile_pkg, 'w') as f:
    json.dump(pkg, f, indent=2)
    f.write('\n')
print('package.json updated')

# 2. Copy react-test-renderer from root to mobile
root_rt = os.path.join(base, 'node_modules/react-test-renderer')
mobile_rt = os.path.join(base, 'apps/mobile/node_modules/react-test-renderer')
if os.path.exists(mobile_rt):
    shutil.rmtree(mobile_rt)
shutil.copytree(root_rt, mobile_rt)
print('react-test-renderer copied')

# 3. Copy react-dom from root to mobile
root_rd = os.path.join(base, 'node_modules/react-dom')
mobile_rd = os.path.join(base, 'apps/mobile/node_modules/react-dom')
if os.path.exists(mobile_rd):
    shutil.rmtree(mobile_rd)
shutil.copytree(root_rd, mobile_rd)
print('react-dom copied')

# 4. Verify
for name, path in [('react', os.path.join(base, 'apps/mobile/node_modules/react/package.json')),
                    ('react-test-renderer', os.path.join(base, 'apps/mobile/node_modules/react-test-renderer/package.json')),
                    ('react-dom', os.path.join(base, 'apps/mobile/node_modules/react-dom/package.json'))]:
    with open(path) as f:
        v = json.load(f)['version']
    print(f'  {name}: {v}')
