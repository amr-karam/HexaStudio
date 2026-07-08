# 3D Models

Place `.glb` files here for the 3D scene background.

## Usage

1. Export your model from 3ds Max as `.glb` with Draco compression
2. Place the file in this directory
3. Update `NEXT_PUBLIC_MODEL_PATH` in your `.env` or the default in `SceneModel.tsx`

## Guidelines

- Keep file size under 5MB for the homepage background
- Use Draco compression for geometry
- Use KTX2 for texture compression
- Center the model at origin for proper positioning
