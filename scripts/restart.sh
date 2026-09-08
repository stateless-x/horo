#!/usr/bin/env bash
# Restart the local development servers.
#
#   ./scripts/restart.sh        backend + frontend
#   ./scripts/restart.sh all    backend + frontend + admin
#   ./scripts/restart.sh be     one service
#
# Both servers hot-reload on file changes; reach for this after an .env
# change, a dependency install, or when a process is wedged.

HERE="$(dirname "${BASH_SOURCE[0]}")"
source "$HERE/_common.sh"

case "${1:-}" in
  -h|--help) sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
esac

TARGETS="$(resolve_services "$@")" || exit 1

"$HERE/stop.sh" $TARGETS
echo
exec "$HERE/dev.sh" $TARGETS
