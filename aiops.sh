#!/bin/bash

#######################################################################################
# AI Governance Management — Application Manager
#
# Manages the full lifecycle of the AI Governance web application:
# - PostgreSQL database (Docker)
# - Backend API (Express + Apollo GraphQL, port 4100)
# - Frontend UI (React + Vite, port 5174)
#
# Usage: ./aiops.sh [command]
# Commands: start, stop, restart, status, dev, build, migrate, sync, logs, help
#######################################################################################

set -e

# ─── Configuration ────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
APP_DIR="$PROJECT_DIR/app"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
CLI_DIR="$PROJECT_DIR/cli"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"
LOG_DIR="$PROJECT_DIR/tmp"

BACKEND_PORT="${BACKEND_PORT:-4100}"
FRONTEND_PORT="${FRONTEND_PORT:-5174}"
DB_PORT="${DB_PORT:-5433}"
DB_CONTAINER_PATTERN="governance-db"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# ─── Colors ───────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ─── Logging ──────────────────────────────────────────────────────────────────

log_info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}      $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC}    $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC}   $1"; }
log_header()  { echo -e "\n${PURPLE}${BOLD}═══ $1 ═══${NC}"; }
log_step()    { echo -e "${CYAN}  ▸${NC} $1"; }

# ─── Dependency Checks ────────────────────────────────────────────────────────

check_deps() {
  local missing=()
  for dep in node npm docker lsof; do
    if ! command -v "$dep" >/dev/null 2>&1; then
      missing+=("$dep")
    fi
  done
  if [ ${#missing[@]} -gt 0 ]; then
    log_error "Missing required dependencies: ${missing[*]}"
    exit 1
  fi
}

# ─── Port Utilities ───────────────────────────────────────────────────────────

check_port() {
  lsof -Pi :"$1" -sTCP:LISTEN -t >/dev/null 2>&1
}

kill_port() {
  local port=$1 name=$2
  if check_port "$port"; then
    log_step "Stopping $name on port $port..."
    local pids
    pids=$(lsof -Pi :"$port" -sTCP:LISTEN -t 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -TERM 2>/dev/null || true
      sleep 2
      local remaining
      remaining=$(lsof -Pi :"$port" -sTCP:LISTEN -t 2>/dev/null || true)
      if [ -n "$remaining" ]; then
        echo "$remaining" | xargs kill -KILL 2>/dev/null || true
        sleep 1
      fi
    fi
    if check_port "$port"; then
      log_warning "$name on port $port could not be stopped"
    else
      log_success "$name stopped"
    fi
  else
    log_step "$name not running on port $port"
  fi
}

wait_for_port() {
  local port=$1 name=$2 max=${3:-30}
  local attempt=1
  while [ $attempt -le "$max" ]; do
    if check_port "$port"; then
      return 0
    fi
    printf "."
    sleep 1
    ((attempt++))
  done
  echo ""
  log_error "$name did not start on port $port within ${max}s"
  return 1
}

# ─── Database ─────────────────────────────────────────────────────────────────

db_container_name() {
  docker ps -a --format '{{.Names}}' 2>/dev/null | grep -i "$DB_CONTAINER_PATTERN" | head -n 1
}

db_is_running() {
  local name
  name=$(db_container_name)
  [ -n "$name" ] && docker ps --format '{{.Names}}' 2>/dev/null | grep -qF "$name"
}

db_start() {
  log_step "Starting PostgreSQL database..."
  if db_is_running; then
    log_step "Database container already running"
    return 0
  fi

  local name
  name=$(db_container_name)
  if [ -n "$name" ]; then
    docker start "$name" >/dev/null 2>&1
  else
    docker compose -f "$COMPOSE_FILE" up -d governance-db 2>&1 | grep -v "^$"
  fi

  log_step "Waiting for database to be ready..."
  local attempt=1 max=20
  while [ $attempt -le $max ]; do
    if docker exec "$(db_container_name)" pg_isready -U postgres >/dev/null 2>&1; then
      log_success "Database is ready (port $DB_PORT)"
      return 0
    fi
    printf "."
    sleep 1
    ((attempt++))
  done
  echo ""
  log_error "Database failed to become ready within ${max}s"
  return 1
}

db_stop() {
  log_step "Stopping database..."
  local name
  name=$(db_container_name)
  if [ -n "$name" ] && db_is_running; then
    docker stop "$name" >/dev/null 2>&1
    log_success "Database stopped"
  else
    log_step "Database not running"
  fi
}

db_status() {
  local name
  name=$(db_container_name)
  if [ -z "$name" ]; then
    echo -e "  Database:  ${RED}No container found${NC}"
    return
  fi
  if db_is_running; then
    local ready="not ready"
    if docker exec "$name" pg_isready -U postgres >/dev/null 2>&1; then
      ready="accepting connections"
    fi
    echo -e "  Database:  ${GREEN}Running${NC} ($name, port $DB_PORT, $ready)"
  else
    echo -e "  Database:  ${YELLOW}Stopped${NC} ($name)"
  fi
}

# ─── Backend ──────────────────────────────────────────────────────────────────

backend_stop() {
  kill_port "$BACKEND_PORT" "Backend API"
  pkill -f "ts-node-dev.*governance.*server" 2>/dev/null || true
  pkill -f "node.*governance.*dist/server" 2>/dev/null || true
}

backend_start_prod() {
  log_step "Starting backend (production mode)..."
  if check_port "$BACKEND_PORT"; then
    log_step "Backend already running on port $BACKEND_PORT"
    return 0
  fi

  mkdir -p "$LOG_DIR"

  if [ ! -d "$BACKEND_DIR/dist" ]; then
    log_step "No build found — building backend first..."
    (cd "$BACKEND_DIR" && npm run build) >> "$BACKEND_LOG" 2>&1
  fi

  (cd "$BACKEND_DIR" && nohup node dist/server.js >> "$BACKEND_LOG" 2>&1 &)

  printf "  Starting backend"
  if wait_for_port "$BACKEND_PORT" "Backend" 30; then
    echo ""
    log_success "Backend API running at http://localhost:$BACKEND_PORT/graphql"
  fi
}

backend_start_dev() {
  log_step "Starting backend (dev mode with hot reload)..."
  if check_port "$BACKEND_PORT"; then
    log_step "Backend already running on port $BACKEND_PORT"
    return 0
  fi

  mkdir -p "$LOG_DIR"
  (cd "$BACKEND_DIR" && nohup npm run dev >> "$BACKEND_LOG" 2>&1 &)

  printf "  Starting backend"
  if wait_for_port "$BACKEND_PORT" "Backend" 30; then
    echo ""
    log_success "Backend API running at http://localhost:$BACKEND_PORT/graphql"
  fi
}

backend_status() {
  if check_port "$BACKEND_PORT"; then
    echo -e "  Backend:   ${GREEN}Running${NC} (port $BACKEND_PORT)"
    echo -e "             GraphQL:  http://localhost:$BACKEND_PORT/graphql"
    echo -e "             REST API: http://localhost:$BACKEND_PORT/api/governance/health"
  else
    echo -e "  Backend:   ${RED}Stopped${NC}"
  fi
}

# ─── Frontend ─────────────────────────────────────────────────────────────────

frontend_stop() {
  kill_port "$FRONTEND_PORT" "Frontend"
  pkill -f "vite.*--port.*$FRONTEND_PORT" 2>/dev/null || true
  pkill -f "vite.*preview.*$FRONTEND_PORT" 2>/dev/null || true
  pkill -f "npm.*exec.*vite.*preview" 2>/dev/null || true
}

frontend_start_prod() {
  log_step "Starting frontend (preview mode)..."
  if check_port "$FRONTEND_PORT"; then
    log_step "Frontend already running on port $FRONTEND_PORT"
    return 0
  fi

  mkdir -p "$LOG_DIR"

  if [ ! -d "$FRONTEND_DIR/dist" ]; then
    log_step "No build found — building frontend first..."
    (cd "$FRONTEND_DIR" && npm run build) >> "$FRONTEND_LOG" 2>&1
  fi

  (cd "$FRONTEND_DIR" && nohup npx vite preview --port "$FRONTEND_PORT" --host >> "$FRONTEND_LOG" 2>&1 &)

  printf "  Starting frontend"
  if wait_for_port "$FRONTEND_PORT" "Frontend" 15; then
    echo ""
    log_success "Frontend running at http://localhost:$FRONTEND_PORT"
  fi
}

frontend_start_dev() {
  log_step "Starting frontend (dev mode with HMR)..."
  if check_port "$FRONTEND_PORT"; then
    log_step "Frontend already running on port $FRONTEND_PORT"
    return 0
  fi

  mkdir -p "$LOG_DIR"
  (cd "$FRONTEND_DIR" && nohup npx vite --port "$FRONTEND_PORT" --host >> "$FRONTEND_LOG" 2>&1 &)

  printf "  Starting frontend"
  if wait_for_port "$FRONTEND_PORT" "Frontend" 15; then
    echo ""
    log_success "Frontend running at http://localhost:$FRONTEND_PORT"
  fi
}

frontend_status() {
  if check_port "$FRONTEND_PORT"; then
    echo -e "  Frontend:  ${GREEN}Running${NC} (port $FRONTEND_PORT)"
    echo -e "             UI: http://localhost:$FRONTEND_PORT"
  else
    echo -e "  Frontend:  ${RED}Stopped${NC}"
  fi
}

# ─── Migrations ───────────────────────────────────────────────────────────────

run_migrations() {
  log_step "Running database migrations..."
  (cd "$BACKEND_DIR" && npx prisma migrate deploy 2>&1) | while IFS= read -r line; do
    echo -e "    ${DIM}$line${NC}"
  done
  log_success "Migrations complete"
}

# ─── Sync Governance Artifacts ────────────────────────────────────────────────

sync_artifacts() {
  if check_port "$BACKEND_PORT"; then
    log_step "Syncing governance artifacts from disk via API..."
    local result
    result=$(curl -s -X POST "http://localhost:$BACKEND_PORT/api/governance/sync" 2>/dev/null)
    local added updated removed
    added=$(echo "$result" | grep -o '"added":[0-9]*' | cut -d: -f2)
    updated=$(echo "$result" | grep -o '"updated":[0-9]*' | cut -d: -f2)
    removed=$(echo "$result" | grep -o '"removed":[0-9]*' | cut -d: -f2)
    log_success "Sync complete: ${added:-0} added, ${updated:-0} updated, ${removed:-0} deactivated"
  else
    log_error "Backend is not running. Start it first with: ./aiops.sh start"
    exit 1
  fi
}

# ─── Build ────────────────────────────────────────────────────────────────────

build_backend() {
  log_step "Building backend..."
  (cd "$BACKEND_DIR" && npx prisma generate && npm run build) 2>&1 | tail -3
  log_success "Backend built"
}

build_frontend() {
  log_step "Building frontend..."
  (cd "$FRONTEND_DIR" && npm run build) 2>&1 | tail -3
  log_success "Frontend built"
}

build_cli() {
  log_step "Building CLI..."
  (cd "$CLI_DIR" && npm run build) 2>&1 | tail -3
  log_success "CLI built"
}

# ─── Install ──────────────────────────────────────────────────────────────────

install_all() {
  log_step "Installing backend dependencies..."
  (cd "$BACKEND_DIR" && npm install --silent) 2>&1 | tail -2
  log_step "Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install --silent) 2>&1 | tail -2
  log_step "Installing CLI dependencies..."
  (cd "$CLI_DIR" && npm install --silent) 2>&1 | tail -2
  log_success "All dependencies installed"
}

# ─── Composite Commands ──────────────────────────────────────────────────────

do_start() {
  log_header "STARTING AI GOVERNANCE"

  check_deps
  db_start
  run_migrations

  build_backend
  build_frontend

  backend_start_prod
  frontend_start_prod

  log_header "AI GOVERNANCE IS RUNNING"
  echo ""
  echo -e "  ${BOLD}GraphQL Playground:${NC}  http://localhost:$BACKEND_PORT/graphql"
  echo -e "  ${BOLD}REST API Health:${NC}     http://localhost:$BACKEND_PORT/api/governance/health"
  echo -e "  ${BOLD}Frontend UI:${NC}         http://localhost:$FRONTEND_PORT"
  echo ""
  echo -e "  ${DIM}Backend log:  $BACKEND_LOG${NC}"
  echo -e "  ${DIM}Frontend log: $FRONTEND_LOG${NC}"
  echo ""
}

do_stop() {
  log_header "STOPPING AI GOVERNANCE"
  frontend_stop
  backend_stop
  db_stop
  log_success "All services stopped"
}

do_restart() {
  log_header "RESTARTING AI GOVERNANCE"
  frontend_stop
  backend_stop

  build_backend
  build_frontend

  backend_start_prod
  frontend_start_prod

  log_header "AI GOVERNANCE RESTARTED"
  echo ""
  echo -e "  ${BOLD}Frontend UI:${NC}  http://localhost:$FRONTEND_PORT"
  echo -e "  ${BOLD}GraphQL:${NC}      http://localhost:$BACKEND_PORT/graphql"
  echo ""
}

do_dev() {
  log_header "STARTING AI GOVERNANCE (DEV MODE)"

  check_deps
  db_start
  run_migrations

  backend_start_dev
  frontend_start_dev

  log_header "AI GOVERNANCE DEV MODE RUNNING"
  echo ""
  echo -e "  ${BOLD}Frontend UI (HMR):${NC}   http://localhost:$FRONTEND_PORT"
  echo -e "  ${BOLD}GraphQL Playground:${NC}  http://localhost:$BACKEND_PORT/graphql"
  echo ""
  echo -e "  ${DIM}Backend log:  $BACKEND_LOG${NC}"
  echo -e "  ${DIM}Frontend log: $FRONTEND_LOG${NC}"
  echo -e "  ${DIM}Tip: Use ./aiops.sh logs to tail both logs${NC}"
  echo ""
}

do_status() {
  log_header "AI GOVERNANCE STATUS"
  echo ""
  db_status
  backend_status
  frontend_status
  echo ""

  # Artifact count if backend is running
  if check_port "$BACKEND_PORT"; then
    local result
    result=$(curl -s -X POST "http://localhost:$BACKEND_PORT/graphql" \
      -H 'Content-Type: application/json' \
      -d '{"query":"{ artifacts(first:1) { totalCount } projects(first:1) { totalCount } }"}' 2>/dev/null)
    local artifacts projects
    artifacts=$(echo "$result" | grep -o '"totalCount":[0-9]*' | head -1 | cut -d: -f2)
    projects=$(echo "$result" | grep -o '"totalCount":[0-9]*' | tail -1 | cut -d: -f2)
    echo -e "  ${BOLD}Registry:${NC}"
    echo -e "    Artifacts: ${CYAN}${artifacts:-0}${NC}"
    echo -e "    Projects:  ${CYAN}${projects:-0}${NC}"
    echo ""
  fi
}

do_build() {
  log_header "BUILDING ALL PACKAGES"
  build_backend
  build_frontend
  build_cli
  log_success "All packages built"
}

do_logs() {
  log_header "TAILING LOGS"
  echo -e "  ${DIM}Press Ctrl+C to stop${NC}"
  echo ""
  mkdir -p "$LOG_DIR"
  touch "$BACKEND_LOG" "$FRONTEND_LOG"
  tail -f "$BACKEND_LOG" "$FRONTEND_LOG"
}

do_migrate() {
  log_header "DATABASE MIGRATION"
  if ! db_is_running; then
    log_step "Database not running — starting it..."
    db_start
  fi
  run_migrations
}

do_sync() {
  log_header "GOVERNANCE ARTIFACT SYNC"
  sync_artifacts
}

do_install() {
  log_header "INSTALLING DEPENDENCIES"
  check_deps
  install_all
}

do_help() {
  echo ""
  echo -e "${BOLD}AI Governance Management${NC} — Application Manager"
  echo ""
  echo -e "${BOLD}Usage:${NC} ./aiops.sh <command>"
  echo ""
  echo -e "${BOLD}Lifecycle:${NC}"
  echo -e "  ${GREEN}start${NC}       Build and start all services (database + backend + frontend)"
  echo -e "  ${GREEN}stop${NC}        Stop all services"
  echo -e "  ${GREEN}restart${NC}     Rebuild and restart backend + frontend (keeps database running)"
  echo -e "  ${GREEN}dev${NC}         Start in development mode (hot reload for backend + HMR for frontend)"
  echo -e "  ${GREEN}status${NC}      Show status of all services and registry counts"
  echo ""
  echo -e "${BOLD}Build & Install:${NC}"
  echo -e "  ${CYAN}install${NC}     Install all npm dependencies (backend, frontend, CLI)"
  echo -e "  ${CYAN}build${NC}       Build all packages (backend, frontend, CLI)"
  echo ""
  echo -e "${BOLD}Database:${NC}"
  echo -e "  ${YELLOW}migrate${NC}     Run Prisma database migrations"
  echo ""
  echo -e "${BOLD}Governance:${NC}"
  echo -e "  ${PURPLE}sync${NC}        Sync governance artifacts from global/ into the database"
  echo ""
  echo -e "${BOLD}Logs:${NC}"
  echo -e "  ${DIM}logs${NC}        Tail backend and frontend logs"
  echo ""
  echo -e "${BOLD}Ports:${NC}"
  echo -e "  Backend:   ${BACKEND_PORT}    (override: BACKEND_PORT=N)"
  echo -e "  Frontend:  ${FRONTEND_PORT}    (override: FRONTEND_PORT=N)"
  echo -e "  Database:  ${DB_PORT}    (override: DB_PORT=N)"
  echo ""
  echo -e "${BOLD}Log Files:${NC}"
  echo -e "  Backend:   $BACKEND_LOG"
  echo -e "  Frontend:  $FRONTEND_LOG"
  echo ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────

case "${1:-help}" in
  start)       do_start ;;
  stop)        do_stop ;;
  restart)     do_restart ;;
  dev)         do_dev ;;
  status)      do_status ;;
  build)       do_build ;;
  install)     do_install ;;
  migrate)     do_migrate ;;
  sync)        do_sync ;;
  logs)        do_logs ;;
  help|--help|-h)  do_help ;;
  *)
    log_error "Unknown command: $1"
    do_help
    exit 1
    ;;
esac
