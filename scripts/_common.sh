#!/usr/bin/env bash
# Shared helpers for dev.sh / stop.sh / restart.sh.
# Not executable on its own; sourced by the others.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT/.dev"
LOG_DIR="$RUN_DIR/logs"
mkdir -p "$LOG_DIR"

# name|directory|port|url path
SERVICES=(
  "be|horo-be|3001|/health"
  "fe|horo-fe|3000|/"
  "admin|horo-admin|3002|/"
)

DEFAULT_SET="be fe"
ALL_SET="be fe admin"

if [ -t 1 ]; then
  C_RESET=$'\033[0m'; C_DIM=$'\033[2m'; C_RED=$'\033[31m'
  C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_BLUE=$'\033[34m'
else
  C_RESET=""; C_DIM=""; C_RED=""; C_GREEN=""; C_YELLOW=""; C_BLUE=""
fi

info()  { printf '%s\n' "$*"; }
ok()    { printf '%s✓%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
warn()  { printf '%s!%s %s\n' "$C_YELLOW" "$C_RESET" "$*"; }
fail()  { printf '%sx%s %s\n' "$C_RED" "$C_RESET" "$*" >&2; }
dim()   { printf '%s%s%s\n' "$C_DIM" "$*" "$C_RESET"; }

svc_field() { # svc_field <name> <1=dir 2=port 3=path>
  local name="$1" idx="$2" row
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r n d p u <<<"$row"
    [ "$n" = "$name" ] || continue
    case "$idx" in
      1) printf '%s' "$d" ;;
      2) printf '%s' "$p" ;;
      3) printf '%s' "$u" ;;
    esac
    return 0
  done
  return 1
}

svc_dir()  { svc_field "$1" 1; }
svc_port() { svc_field "$1" 2; }
svc_path() { svc_field "$1" 3; }

pid_file() { printf '%s/%s.pid' "$RUN_DIR" "$1"; }
log_file() { printf '%s/%s.log' "$LOG_DIR" "$1"; }

# PID currently listening on a port, if any.
port_pid() { lsof -ti "tcp:$1" -sTCP:LISTEN 2>/dev/null | head -1; }

# Resolve requested service names. "all" expands, empty means the default set.
resolve_services() {
  local args=("$@") out=() a
  if [ ${#args[@]} -eq 0 ]; then
    printf '%s' "$DEFAULT_SET"; return 0
  fi
  for a in "${args[@]}"; do
    case "$a" in
      all)          out+=($ALL_SET) ;;
      be|backend)   out+=(be) ;;
      fe|frontend)  out+=(fe) ;;
      admin)        out+=(admin) ;;
      *) fail "unknown service: $a  (use: be, fe, admin, all)"; return 1 ;;
    esac
  done
  # de-duplicate, keep order
  printf '%s' "$(printf '%s\n' "${out[@]}" | awk '!seen[$0]++' | tr '\n' ' ')"
}
