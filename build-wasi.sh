#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Applying WASI patches to vendor..."

# Apply patches by copying files from patches/ to vendor/github.com/
cp patches/spf13/afero/const_wasip1.go vendor/github.com/spf13/afero/
cp patches/spf13/afero/const_win_unix.go vendor/github.com/spf13/afero/

cp patches/sirupsen/logrus/terminal_check_appengine.go vendor/github.com/sirupsen/logrus/
cp patches/sirupsen/logrus/terminal_check_notappengine.go vendor/github.com/sirupsen/logrus/

cp patches/coreos/go-systemd/journal/journal.go vendor/github.com/coreos/go-systemd/journal/

cp patches/fsnotify/fsnotify/backend_other.go vendor/github.com/fsnotify/fsnotify/

cp patches/chzyer/readline/term.go vendor/github.com/chzyer/readline/
cp patches/chzyer/readline/term_unix.go vendor/github.com/chzyer/readline/
cp patches/chzyer/readline/term_wasip1.go vendor/github.com/chzyer/readline/
cp patches/chzyer/readline/utils_wasip1.go vendor/github.com/chzyer/readline/

echo "==> Building WASI binary..."
GOOS=wasip1 GOARCH=wasm go build -mod vendor -o regula.wasm

echo "==> Build complete: regula.wasm"
ls -lh regula.wasm
