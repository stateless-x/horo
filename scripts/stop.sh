#!/usr/bin/env bash
# Stop the local development servers.
#
#   ./scripts/stop.sh           stop everything (backend, frontend, admin)
#   ./scripts/stop.sh fe        stop one service
#
# Kills the recorded process, then anything still holding the port —
# Next.js leaves workers behind when only the parent is signalled.

source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

case "${1:-}" in
  -h|--help) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
esac

if [ $# -eq 0 ]; then
  TARGETS="$ALL_SET"
else
  TARGETS="$(resolve_services "$@")" || exit 1
fi

kill_tree() { # kill_tree <pid>
  local pid="$1" child
  for child in $(pgrep -P "$pid" 2>/dev/null); do kill_tree "$child"; done
  kill "$pid" 2>/dev/null
}

stop_one() { # stop_one <name>
  local name="$1" port pf pid holder waited=0 stopped=0
  port="$(svc_port "$name")"; pf="$(pid_file "$name")"

  if [ -f "$pf" ]; then
    pid="$(cat "$pf")"
    if kill -0 "$pid" 2>/dev/null; then
      kill_tree "$pid"
      stopped=1
    fi
    rm -f "$pf"
  fi

  # Whatever is still listening on the port goes too.
  holder="$(port_pid "$port")"
  if [ -n "$holder" ]; then
    kill_tree "$holder"
    stopped=1
  fi

  [ "$stopped" -eq 0 ] && { dim "$name was not running"; return 0; }

  while [ "$waited" -lt 20 ] && [ -n "$(port_pid "$port")" ]; do
    sleep 0.25
    waited=$((waited + 1))
  done

  holder="$(port_pid "$port")"
  if [ -n "$holder" ]; then
    kill -9 "$holder" 2>/dev/null
    sleep 0.5
    holder="$(port_pid "$port")"
  fi

  if [ -n "$holder" ]; then
    fail "$name still holding port $port (pid $holder)"
    return 1
  fi

  ok "$name stopped (port $port free)"
  return 0
}

failed=0
for name in $TARGETS; do
  stop_one "$name" || failed=1
done
exit "$failed"
