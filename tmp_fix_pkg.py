import json

with open("/home/hexa/hexastudio/package.json", "r") as f:
    pkg = json.load(f)

pkg.setdefault("dependencies", {})["framer-motion"] = "^11.18.2"
pkg["overrides"] = pkg.get("overrides", {})
pkg["overrides"]["framer-motion"] = "^11.18.2"

with open("/home/hexa/hexastudio/package.json", "w") as f:
    json.dump(pkg, f, indent=2)
print("OK")
