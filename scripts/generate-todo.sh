#!/usr/bin/env bash
# generate-todo.sh
# Generates docs/TODO.md from task file frontmatter.
# Assumes run from project root: bash ../central_ai_ops/scripts/generate-todo.sh

set -euo pipefail

echo "Generating docs/TODO.md..."

OUT="docs/TODO.md"
TMP_ACTIVE=$(mktemp)
TMP_BACKLOG=$(mktemp)
TMP_DONE=$(mktemp)
TMP_PLANS=$(mktemp)

cleanup() {
  rm -f "$TMP_ACTIVE" "$TMP_BACKLOG" "$TMP_DONE" "$TMP_PLANS"
}
trap cleanup EXIT

PROJECT_NAME=$(basename "$(pwd)")
echo "# ${PROJECT_NAME} — Task Hub" > "$OUT"
echo "" >> "$OUT"
echo "> Auto-generated from task file frontmatter. Do not edit manually." >> "$OUT"
echo "> Run \`npm run tasks:sync\` to regenerate. See \`.ai_ops/global/rules/global-task-governance.md\` for conventions." >> "$OUT"
echo "" >> "$OUT"

trim_value() {
  local value="$1"
  value=$(printf '%s' "$value" | tr -d '\r')
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  printf '%s' "$value"
}

normalize_status() {
  local value=${1:-planned}
  value=$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')
  value=${value//-/_}
  [ "$value" = "completed" ] && value="done"
  printf '%s' "$value"
}

normalize_priority() {
  local value=${1:-medium}
  printf '%s' "$value" | tr '[:upper:]' '[:lower:]'
}

all_task_files() {
  find docs/tasks -maxdepth 1 -name '*.md' -print 2>/dev/null
  if [ -d "docs/tasks/completed" ]; then
    find docs/tasks/completed -maxdepth 1 -name '*.md' -print 2>/dev/null
  fi
}

extract_value() {
  local file=$1
  local key=$2
  awk -v key="$key" '
    $0 ~ "^" key ":" {
      line = $0
      sub("^[^:]+:[[:space:]]*", "", line)
      gsub(/\r/, "", line)
      print line
      exit
    }
  ' "$file" | while IFS= read -r line; do
    trim_value "$line"
  done
}

extract_list_items() {
  local file=$1
  local key=$2
  awk -v key="$key" '
    function trim(s) {
      sub(/^[[:space:]]+/, "", s)
      sub(/[[:space:]]+$/, "", s)
      return s
    }
    function clean(s) {
      gsub(/\r/, "", s)
      s = trim(s)
      sub(/^"/, "", s)
      sub(/"$/, "", s)
      sub(/^'\''/, "", s)
      sub(/'\''$/, "", s)
      return s
    }
    $0 ~ "^" key ":" {
      line = $0
      sub("^[^:]+:[[:space:]]*", "", line)
      line = clean(line)
      if (line == "[]") exit
      if (line ~ /^\[/) {
        sub(/^\[/, "", line)
        sub(/\]$/, "", line)
        count = split(line, parts, /,[[:space:]]*/)
        for (i = 1; i <= count; i += 1) {
          item = clean(parts[i])
          if (length(item) > 0) print item
        }
        exit
      }
      if (length(line) > 0) {
        print line
        exit
      }
      in_list = 1
      next
    }
    in_list {
      if ($0 ~ /^[[:space:]]*-[[:space:]]+/) {
        item = $0
        sub(/^[[:space:]]*-[[:space:]]+/, "", item)
        item = clean(item)
        if (length(item) > 0) print item
        next
      }
      if ($0 ~ /^[[:space:]]*$/) next
      exit
    }
  ' "$file"
}

resolve_task_path_by_id() {
  local id=$1
  while IFS= read -r task_file; do
    [ -z "$task_file" ] && continue
    if grep -q "^id: ${id}$" "$task_file"; then
      printf '%s\n' "${task_file#docs/}"
      return 0
    fi
  done < <(all_task_files)
}

task_ref() {
  local id=$1
  local path
  path=$(resolve_task_path_by_id "$id")
  if [ -n "$path" ]; then
    printf '[%s](%s)' "$id" "$path"
  else
    printf '\`%s\`' "$id"
  fi
}

format_task_links() {
  local items=$1
  local result=""
  while IFS= read -r item; do
    [ -z "$item" ] && continue
    local link
    link=$(task_ref "$item")
    if [ -n "$result" ]; then
      result="$result, $link"
    else
      result="$link"
    fi
  done <<< "$items"
  printf '%s' "$result"
}

plan_trail_links() {
  local plan=$1
  local current_id=${2:-}
  local result=""
  local seen=""
  [ -z "$plan" ] && return 0

  while IFS= read -r task_file; do
    [ -z "$task_file" ] && continue
    local sibling_plan
    sibling_plan=$(extract_value "$task_file" "plan")
    [ "$sibling_plan" != "$plan" ] && continue
    local sibling_id
    sibling_id=$(extract_value "$task_file" "id")
    [ -z "$sibling_id" ] && continue
    [ -n "$current_id" ] && [ "$sibling_id" = "$current_id" ] && continue
    case ",$seen," in
      *,"$sibling_id",*) continue ;;
    esac
    seen="${seen},${sibling_id}"
    local link
    link=$(task_ref "$sibling_id")
    if [ -n "$result" ]; then
      result="$result, $link"
    else
      result="$link"
    fi
  done < <(all_task_files)

  printf '%s' "$result"
}

render_task_line() {
  local id=$1
  local title=$2
  local file_path=$3
  local status=$4
  local prio=$5
  local plan=$6
  local dep_links=$7
  local related_links=$8

  local refs="[task]($file_path)"
  if [ -n "$plan" ] && [ -f "docs/plans/$plan" ]; then
    refs="$refs · [plan](plans/$plan)"
  fi

  local prio_tag=""
  [ "$prio" != "medium" ] && [ -n "$prio" ] && prio_tag=" \`$prio\`"

  local dep_tag=""
  [ -n "$dep_links" ] && dep_tag=" · depends: $dep_links"

  local plan_trail
  plan_trail=$(plan_trail_links "$plan" "$id")
  local plan_trail_tag=""
  [ -n "$plan_trail" ] && plan_trail_tag=" · plan trail: $plan_trail"

  local related_tag=""
  [ -n "$related_links" ] && related_tag=" · related: $related_links"

  local emoji="⬜"
  [ "$status" = "in_progress" ] && emoji="🔵"
  [ "$status" = "planned" ] && emoji="📋"
  [ "$status" = "backlog" ] && emoji="💤"
  [ "$status" = "done" ] && emoji="✅"

  printf -- "- %s **%s: %s** — %s \`%s\`%s%s%s%s" "$emoji" "$id" "$title" "$refs" "$status" "$prio_tag" "$dep_tag" "$plan_trail_tag" "$related_tag"
}

if [ -d "docs/plans" ]; then
  for f in docs/plans/*.md; do
    [ -e "$f" ] || continue
    title=$(grep -m 1 "^# " "$f" | sed 's/^# *//' | tr -d '\r')
    [ -z "$title" ] && title=$(basename "$f" .md)
    plan_id=$(extract_value "$f" "id")
    related_links=$(format_task_links "$(extract_list_items "$f" "related")")
    plan_trail=$(plan_trail_links "$(basename "$f")")
    task_tag=""
    [ -n "$plan_trail" ] && task_tag=" — task trail: $plan_trail"
    if [ -z "$task_tag" ] && [ -n "$plan_id" ]; then
      task_path=$(resolve_task_path_by_id "$plan_id")
      [ -n "$task_path" ] && task_tag=" — task trail: [${plan_id}]($task_path)"
    fi
    related_tag=""
    [ -n "$related_links" ] && related_tag=" · related: $related_links"
    echo "- [$title](plans/$(basename "$f"))$task_tag$related_tag" >> "$TMP_PLANS"
  done
fi

if [ -d "docs/tasks" ]; then
  while IFS= read -r f; do
    [ -e "$f" ] || continue

    id=$(extract_value "$f" "id")
    [ -z "$id" ] && id=$(basename "$f" .md)
    title=$(extract_value "$f" "title")
    status=$(normalize_status "$(extract_value "$f" "status")")
    prio=$(normalize_priority "$(extract_value "$f" "priority")")
    plan=$(extract_value "$f" "plan")
    updated=$(extract_value "$f" "updated")
    [ -z "$updated" ] && updated=$(extract_value "$f" "created")
    [ -z "$prio" ] && prio="medium"

    dep_links=$(format_task_links "$(extract_list_items "$f" "depends_on")")
    related_links=$(format_task_links "$(extract_list_items "$f" "related")")

    prio_sort=2
    [ "$prio" = "high" ] && prio_sort=0
    [ "$prio" = "medium" ] && prio_sort=1

    dir_name=$(basename "$(dirname "$f")")
    file_path="tasks/$(basename "$f")"
    [ "$dir_name" = "completed" ] && file_path="tasks/completed/$(basename "$f")"

    line=$(render_task_line "$id" "$title" "$file_path" "$status" "$prio" "$plan" "$dep_links" "$related_links")

    if [ "$status" = "in_progress" ] || [ "$status" = "planned" ]; then
      status_sort=1
      [ "$status" = "in_progress" ] && status_sort=0
      echo "$status_sort $prio_sort | $line" >> "$TMP_ACTIVE"
    elif [ "$status" = "backlog" ]; then
      echo "$prio_sort | $line" >> "$TMP_BACKLOG"
    elif [ "$status" = "done" ]; then
      echo "$updated | $line" >> "$TMP_DONE"
    fi
  done < <(all_task_files)
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
  sort -r "$TMP_DONE" | head -n 15 | sed 's/^.* | //' >> "$OUT"
  echo "" >> "$OUT"
fi

echo "---" >> "$OUT"
echo "*Generated $(date '+%Y-%m-%d')*" >> "$OUT"

echo "✅ Generated docs/TODO.md"
