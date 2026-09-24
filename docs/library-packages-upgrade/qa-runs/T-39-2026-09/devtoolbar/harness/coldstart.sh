#!/bin/bash
# Usage: coldstart.sh <run-id> <mode: curl|seq|par|both>
set -u
REPO=/Users/ap/development/other/eliotik.github.io
S=/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8/devtoolbar
RUN=$1
MODE=$2
PORT=4322
BASE=http://localhost:$PORT
OUT=$S/runs/$RUN
rm -rf "$OUT"
mkdir -p "$OUT"
cd "$REPO" || exit 1
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent
now() { perl -MTime::HiRes -e 'printf "%.3f\n", Time::HiRes::time'; }

{
  echo "run=$RUN mode=$MODE"
  echo "config: $(grep -n 'devToolbar:' astro.config.mjs)"
  echo "node=$(node -v)"
} > "$OUT/00-meta.txt"

# 1. stop any dev daemon (never touches the :4321 preview daemon)
pnpm -s astro dev stop > "$OUT/01-stop.txt" 2>&1
for i in $(seq 1 100); do
  nc -z localhost $PORT 2>/dev/null || break
  sleep 0.1
done
if nc -z localhost $PORT 2>/dev/null; then echo "ABORT: :$PORT still listening" | tee -a "$OUT/00-meta.txt"; exit 2; fi
pnpm -s astro dev status >> "$OUT/01-stop.txt" 2>&1

# 2. clear caches (node_modules/.vite + .astro, preserving the shared preview daemon's lock/log)
rm -rf node_modules/.vite
find .astro -mindepth 1 -maxdepth 1 ! -name preview.json ! -name preview.log -exec rm -rf {} +
{
  echo "--- after clear:"
  ls -la .astro
  ls -la node_modules/.vite 2>&1
} > "$OUT/02-cache-cleared.txt"

# 3. start dev daemon and fire clients the moment the port accepts connections
T_START=$(now)
pnpm astro dev --port $PORT > "$OUT/03-start-cmd.txt" 2>&1 &
STARTPID=$!
for i in $(seq 1 2000); do
  nc -z localhost $PORT 2>/dev/null && break
  sleep 0.02
done
T_LISTEN=$(now)
echo "t_start=$T_START t_listen=$T_LISTEN" >> "$OUT/00-meta.txt"

case "$MODE" in
  curl) node "$S/crawl.mjs" $BASE "$OUT/curl.json" > "$OUT/curl-summary.json" 2>&1 ;;
  seq)  node "$S/pw.mjs" $BASE seq "$OUT" > "$OUT/chrome-seq-summary.json" 2>&1 ;;
  par)  node "$S/pw.mjs" $BASE par "$OUT" > "$OUT/chrome-par-summary.json" 2>&1 ;;
  both)
    node "$S/crawl.mjs" $BASE "$OUT/curl.json" > "$OUT/curl-summary.json" 2>&1 &
    C1=$!
    node "$S/pw.mjs" $BASE par "$OUT" > "$OUT/chrome-par-summary.json" 2>&1 &
    C2=$!
    wait $C1 $C2
    ;;
esac
T_DONE=$(now)
wait $STARTPID
echo "t_clients_done=$T_DONE" >> "$OUT/00-meta.txt"
# settle so any late optimizer re-run gets logged
sleep 3

# 4. positive control for the curl 504 detector: an existing optimized dep with a wrong ?v= hash,
#    and the same dep with the hash actually served in this run (taken from curl.json if present)
PC=$(curl -s -o /dev/null -w '%{http_code} %{http_version}' "$BASE/node_modules/.vite/deps/react.js?v=deadbeef")
REAL=$(node -e 'try{const r=require(process.argv[1]).requests.find(q=>/^\/node_modules\/\.vite\/deps\/react\.js\?v=/.test(q.url)&&q.status===200);console.log(r?r.url:"")}catch{console.log("")}' "$OUT/curl.json")
if [ -n "$REAL" ]; then PC_OK=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$REAL"); else PC_OK=n/a; fi
echo "positive_control wrong_hash(react.js?v=deadbeef)=$PC served_hash($REAL)=$PC_OK" >> "$OUT/00-meta.txt"

# 5. collect logs/metadata
cp .astro/dev.json "$OUT/dev.json" 2>/dev/null
cp .astro/dev.log "$OUT/dev.log" 2>/dev/null
pnpm -s astro dev logs > "$OUT/dev-logs-cmd.txt" 2>&1
cp node_modules/.vite/deps/_metadata.json "$OUT/vite-deps-metadata.json" 2>/dev/null
node "$S/toolbar-closure.mjs" node_modules/.vite/deps "$OUT/toolbar-closure.json" >> "$OUT/00-meta.txt" 2>&1
pnpm -s astro dev status >> "$OUT/00-meta.txt" 2>&1
{
  echo "--- dev.log signals:"
  grep -n -i -E "dependencies optimized|dependencies changed|reload|outdated|504|failed to fetch|optimiz|forced|error|warn|\\[[0-9]{3}\\]" "$OUT/dev.log" || echo "(none)"
} > "$OUT/04-log-signals.txt"
cat "$OUT/00-meta.txt" "$OUT/04-log-signals.txt"
