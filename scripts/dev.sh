#!/usr/bin/env bash
# Start the local development servers.
#
#   ./scripts/dev.sh            backend + frontend  (the usual case)
#   ./scripts/dev.sh all        backend + frontend + admin
#   ./scripts/dev.sh admin      admin only
#   ./scripts/dev.sh be fe      any explicit combination
#
# Servers run in the background. Logs go to .dev/logs/<name>.log.
# Stop them with ./scripts/stop.sh

source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

FOLLOW=0
args=()
for a in "$@"; do
  case "$a" in
    -f|--follow) FOLLOW=1 ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) args+=("$a") ;;
  esac
done

SERVICES_TO_START="$(resolve_services "${args[@]}")" || exit 1

# ---------------------------------------------------------------- preflight

command -v bun >/dev/null 2>&1 || {
  fail "bun is not installed. Install it with:  curl -fsSL https://bun.sh/install | bash"
  exit 1
}

# A fresh .env.local carries a placeholder session secret. Auth fails in
# confusing ways with one, and it is the only value we can fill in ourselves.
seed_auth_secret() { # seed_auth_secret <env file>
  local file="$1" secret
  grep -qE '^BETTER_AUTH_SECRET=(your-secret-key-here|change-me)?$' "$file" || return 0
  command -v openssl >/dev/null 2>&1 || return 0
  secret="$(openssl rand -base64 32)"
  sed -i '' -E "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=${secret}|" "$file" 2>/dev/null \
    || sed -i -E "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=${secret}|" "$file"
  dim "  generated BETTER_AUTH_SECRET"
}

preflight() { # preflight <name> -> 0 ok, 1 blocked
  local name="$1" dir; dir="$(svc_dir "$name")"
  local path="$ROOT/$dir"

  if [ ! -f "$path/package.json" ]; then
    fail "$dir is empty. Run:  git submodule update --init --recursive"
    return 1
  fi

  if [ ! -f "$path/.env.local" ]; then
    if [ -f "$path/.env.example" ]; then
      cp "$path/.env.example" "$path/.env.local"
      seed_auth_secret "$path/.env.local"
      warn "$dir/.env.local did not exist — copied from .env.example."
      warn "Fill in DATABASE_URL and the API keys, then run this again."
    else
      fail "$dir has no .env.local and no .env.example to copy."
    fi
    return 1
  fi

  if [ ! -d "$path/node_modules" ]; then
    info "Installing dependencies in $dir ..."
    (cd "$path" && bun install) || { fail "bun install failed in $dir"; return 1; }
  fi

  return 0
}

start_one() { # start_one <name>
  local name="$1" dir port log pid existing
  dir="$(svc_dir "$name")"; port="$(svc_port "$name")"
  log="$(log_file "$name")"

  existing="$(port_pid "$port")"
  if [ -n "$existing" ]; then
    warn "$name already running on port $port (pid $existing) — left alone."
    return 0
  fi

  preflight "$name" || return 1

  : > "$log"
  (
    cd "$ROOT/$dir" || exit 1
    PORT="$port" NODE_ENV=development exec bun run dev
  ) >>"$log" 2>&1 &
  pid=$!
  echo "$pid" > "$(pid_file "$name")"

  # Wait for the port to accept connections before declaring success.
  local waited=0
  while [ "$waited" -lt 60 ]; do
    if [ -n "$(port_pid "$port")" ]; then
      ok "$name  http://localhost:$port"
      return 0
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      fail "$name died on startup. Last lines of $log:"
      tail -n 15 "$log" >&2
      rm -f "$(pid_file "$name")"
      return 1
    fi
    sleep 0.5
    waited=$((waited + 1))
  done

  warn "$name did not open port $port within 30s — still starting? check $log"
  return 0
}

# ---------------------------------------------------------------- run

failed=0
for name in $SERVICES_TO_START; do
  start_one "$name" || failed=1
done

echo
if [ "$failed" -eq 1 ]; then
  fail "One or more services did not start. See .dev/logs/"
else
  dim "logs:  tail -f .dev/logs/*.log"
  dim "stop:  ./scripts/stop.sh"
fi

if [ "$FOLLOW" -eq 1 ]; then
  files=()
  for name in $SERVICES_TO_START; do files+=("$(log_file "$name")"); done
  echo
  tail -f "${files[@]}"
fi

exit "$failed"
