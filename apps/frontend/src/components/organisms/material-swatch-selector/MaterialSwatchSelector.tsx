import React from "react";
import { useDesignerStore, MaterialPreset } from "@/features/scene/store/designer-store";
import { MATERIAL_PRESETS } from "@/features/scene/config/material-presets";
import { motion } from "framer-motion";

export default function MaterialSwatchSelector() {
  const activeMaterial = useDesignerStore((state) => state.activeMaterial);
  const setMaterial = useDesignerStore((state) => state.setMaterial);

  return (
    <div className="flex gap-2 p-2 glass-effect rounded-full border border-white/10">
      {(Object.keys(MATERIAL_PRESETS) as MaterialPreset[]).map((preset) => (
        <motion.button
          key={preset}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMaterial(preset)}
          className={cn(
            "w-8 h-8 rounded-full border-2 transition-all",
            activeMaterial === preset ? "border-gold" : "border-transparent"
          )}
          style={{ backgroundColor: MATERIAL_PRESETS[preset].color }}
          aria-label={`Select ${preset.replace("_", " ")}`}
        />
      ))}
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

