import bpy
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SRC = str(SCRIPT_DIR / 'infrastructure' / 'docker' / 'livedev-env' / 'max-workload.blend')

targets = [
    'truss_linked',
    'steel_beam_linked',
    'concrete_panel_linked',
    'steel_beam_collection_linked',
]

def verify(obj):
    lib = obj.library
    lib_path = lib.filepath if lib else None
    data = obj.data
    data_lib = data.library
    data_lib_path = data_lib.filepath if data_lib else None
    parent = obj.parent.name if obj.parent else None
    cof = None
    for c in obj.constraints:
        if c.type == 'CHILD_OF' and c.target:
            cof = c.target.name
    return {
        'name': obj.name,
        'object_library': lib_path,
        'data_name': data.name,
        'data_library': data_lib_path,
        'parent': parent,
        'child_of_target': cof,
        'matches_src': lib_path == SRC,
        'data_matches_src': data_lib_path == SRC,
    }

print('=== Pre-fix verification ===')
pre = {}
for name in targets:
    obj = bpy.data.objects.get(name)
    if not obj:
        print(f'!!! {name}: not found')
        continue
    v = verify(obj)
    pre[name] = v
    print(f"{name}:")
    print(f"  object.library: {v['object_library']}")
    print(f"  data.name: {v['data_name']}")
    print(f"  data.library: {v['data_library']}")
    print(f"  parent: {v['parent']}")
    print(f"  child-of target: {v['child_of_target']}")
    print(f"  matches SRC: {v['matches_src']}")
    print(f"  data matches SRC: {v['data_matches_src']}")
    print()

print('=== Re-pointing steel_beam_collection_linked ===')
target_obj = bpy.data.objects.get('steel_beam_collection_linked')
if target_obj:
    print(f"  Before: data={target_obj.data.name}, object.library={target_obj.library.filepath if target_obj.library else None}")
    new_data = bpy.data.meshes.get('steel_beam_01') or None
    if new_data:
        target_obj.data = new_data
        print(f"  After: data={target_obj.data.name}, data.library={target_obj.data.library.filepath if target_obj.data.library else None}")
    else:
        print('  steel_beam_01 not found in bpy.data.meshes - may need to load from library')
else:
    print('  steel_beam_collection_linked not found')

print()
print('=== Post-fix verification ===')
for name in targets:
    obj = bpy.data.objects.get(name)
    if not obj:
        print(f'!!! {name}: not found')
        continue
    v = verify(obj)
    print(f"{name}:")
    print(f"  object.library: {v['object_library']}")
    print(f"  data.name: {v['data_name']}")
    print(f"  data.library: {v['data_library']}")
    print(f"  parent: {v['parent']}")
    print(f"  child-of target: {v['child_of_target']}")
    print(f"  matches SRC: {v['matches_src']}")
    print(f"  data matches SRC: {v['data_matches_src']}")
    print()
