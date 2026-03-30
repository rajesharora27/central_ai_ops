#!/usr/bin/env bash
# init-task-framework.sh
# Scaffolds the AI-Agnostic Task Management framework into any existing repository.

echo "🚀 Initializing Task Framework in $(pwd)..."

# 1. Create Directories
mkdir -p docs/tasks/completed docs/plans
echo "✅ Created directories: docs/tasks/completed, docs/plans"

# 2. Create foundational ToDo.md if missing
TODO_FILE="docs/ToDo.md"
if [ ! -f "$TODO_FILE" ]; then
  cat << 'EOF' > "$TODO_FILE"
# Task Hub

> Auto-generated from task file frontmatter. Do not edit manually.
> Run `npm run tasks:sync` to regenerate. See `.ai_ops/global/rules/global-task-governance.md` for conventions.

## Included Files
No active tasks yet. Start by generating a task inside `docs/tasks/`.
EOF
  echo "✅ Created baseline docs/ToDo.md"
else
  echo "ℹ️ docs/ToDo.md already exists. Skipping creation."
fi

# 3. Inject standard package.json script
PKG_JSON="package.json"
if [ -f "$PKG_JSON" ]; then
  # Use a safe sed replacement if tasks:sync doesn't exist, or just append it safely if using node locally
  if ! grep -q '"tasks:sync"' "$PKG_JSON"; then
    # We use a tiny one-liner node script since awk/sed json editing is notoriously brittle on different OSes
    node -e "
      const fs = require('fs');
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts['tasks:sync'] = 'bash ../central_ai_ops/scripts/generate-todo.sh';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
        console.log('✅ Mapped \"tasks:sync\" into package.json');
      } catch (e) {
        console.warn('⚠️ Failed to inject tasks:sync:', e.message);
      }
    "
  else
    echo "ℹ️ \"tasks:sync\" script already exists in package.json."
  fi
else
  echo "⚠️ No package.json found in the root directory, skipping script injection."
fi

echo ""
echo "🎉 Initialization successful!"
echo "Next Steps:"
echo "1. Run your global governance link script so this repo receives global-task-governance.md."
echo "2. Add your first Markdown task file to docs/tasks/ with the proper YAML frontmatter."
echo "3. Run 'npm run tasks:sync' to update the ledger!"
