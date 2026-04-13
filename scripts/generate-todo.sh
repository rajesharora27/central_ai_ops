#!/usr/bin/env bash
# generate-todo.sh
# Generates docs/TODO.md from task file frontmatter.
# Assumes run from project root: bash ../central_ai_ops/scripts/generate-todo.sh

echo "Generating docs/TODO.md..."

OUT="docs/TODO.md"
TMP_ACTIVE=$(mktemp)
TMP_BACKLOG=$(mktemp)
TMP_DONE=$(mktemp)
TMP_PLANS=$(mktemp)

# Write header
PROJECT_NAME=$(basename "$(pwd)")
echo "# ${PROJECT_NAME} — Task Hub" > "$OUT"
echo "" >> "$OUT"
echo "> Auto-generated from task file frontmatter. Do not edit manually." >> "$OUT"
echo "> Run \`npm run tasks:sync\` to regenerate. See \`.ai_ops/global/rules/global-task-governance.md\` for conventions." >> "$OUT"
echo "" >> "$OUT"

extract_value() {
  local file=$1
  local key=$2
  # Extract value, remove leading spaces, matching quotes, and trailing returns
  grep -m 1 "^$key:" "$file" | sed "s/^$key: *//" | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//" | tr -d '\r'
}

# 1. Plans
if [ -d "docs/plans" ]; then
    for f in docs/plans/*.md; do
        [ -e "$f" ] || continue
        title=$(grep -m 1 "^# " "$f" | sed 's/^# *//' | tr -d '\r')
        [ -z "$title" ] && title=$(basename "$f" .md)
        echo "- [$title](plans/$(basename "$f"))" >> "$TMP_PLANS"
    done
fi

# 2. Tasks
if [ -d "docs/tasks" ]; then
    # find all md files in tasks and tasks/completed without throwing if completed missing
    files=$(ls docs/tasks/*.md 2>/dev/null)
    [ -d "docs/tasks/completed" ] && files="$files $(ls docs/tasks/completed/*.md 2>/dev/null)"
    
    for f in $files; do
        [ -e "$f" ] || continue
        
        id=$(extract_value "$f" "id")
        [ -z "$id" ] && id=$(basename "$f" .md)
        title=$(extract_value "$f" "title")
        status=$(extract_value "$f" "status")
        prio=$(extract_value "$f" "priority")
        deps=$(extract_value "$f" "depends_on")
        updated=$(extract_value "$f" "updated")
        [ -z "$updated" ] && updated=$(extract_value "$f" "created")
        
        # Re-stringify empty defaults safely
        [ -z "$deps" ] && deps="[]"
        [ -z "$prio" ] && prio="medium"

        # Format tags
        prio_tag=""
        if [ "$prio" != "medium" ] && [ -n "$prio" ]; then 
             prio_tag=" \`$prio\`"
        fi
        
        dep_tag=""
        if [ "$deps" != "[]" ] && [ -n "$deps" ]; then
             dep_tag=" (depends: $deps)"
        fi
        
        # Sort keys
        prio_sort=2
        [ "$prio" = "high" ] && prio_sort=0
        [ "$prio" = "medium" ] && prio_sort=1
        
        dir_name=$(basename $(dirname "$f"))
        file_path="tasks/$(basename "$f")"
        if [ "$dir_name" = "completed" ]; then
            file_path="tasks/completed/$(basename "$f")"
        fi

        if [ "$status" = "in_progress" ] || [ "$status" = "planned" ]; then
            emoji="📋"
            [ "$status" = "in_progress" ] && emoji="🔵"
            status_sort=1
            [ "$status" = "in_progress" ] && status_sort=0
            
            # Format: status_sort prio_sort | - emoji **id: title** — [task](path) `status` prio dep
            echo "$status_sort $prio_sort | - $emoji **$id: $title** — [task]($file_path) \`$status\`$prio_tag$dep_tag" >> "$TMP_ACTIVE"
        
        elif [ "$status" = "backlog" ]; then
            echo "$prio_sort | - 💤 **$id: $title** — [task]($file_path)$prio_tag" >> "$TMP_BACKLOG"
            
        elif [ "$status" = "done" ]; then
            # Sort by descending date
            echo "$updated | - ✅ **$id: $title** — [task]($file_path)" >> "$TMP_DONE"
        fi
    done
fi

if [ -s "$TMP_PLANS" ]; then
    echo "## Plans" >> "$OUT"
    echo "" >> "$OUT"
    cat "$TMP_PLANS" >> "$OUT"
    echo "" >> "$OUT"
fi

if [ -s "$TMP_ACTIVE" ]; then
    echo "## Active" >> "$OUT"
    echo "" >> "$OUT"
    sort -n "$TMP_ACTIVE" | sed 's/^[0-9] [0-9] | //' >> "$OUT"
    echo "" >> "$OUT"
fi

if [ -s "$TMP_BACKLOG" ]; then
    echo "## Backlog" >> "$OUT"
    echo "" >> "$OUT"
    sort -n "$TMP_BACKLOG" | sed 's/^[0-9] | //' >> "$OUT"
    echo "" >> "$OUT"
fi

if [ -s "$TMP_DONE" ]; then
    echo "## Completed" >> "$OUT"
    echo "" >> "$OUT"
    # Sort reverse alphabetically (by date desc), take top 15
    sort -r "$TMP_DONE" | head -n 15 | sed 's/^.* | //' >> "$OUT"
    echo "" >> "$OUT"
fi

echo "---" >> "$OUT"
echo "*Generated $(date '+%Y-%m-%d')*" >> "$OUT"

rm "$TMP_ACTIVE" "$TMP_BACKLOG" "$TMP_DONE" "$TMP_PLANS"
echo "✅ Generated docs/TODO.md"
