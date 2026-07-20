#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Vendoring dependencies..."
go mod vendor

echo "==> Applying WASI patches to vendor..."

# Helper function to apply patch if target exists
apply_patch() {
    local src="$1"
    local dest="$2"
    if [ -d "$(dirname "$dest")" ]; then
        cp "$src" "$dest"
        echo "  Applied: $dest"
    else
        echo "  Skipped (not found): $dest"
    fi
}

# Apply patches by copying files from patches/ to vendor/github.com/
apply_patch patches/spf13/afero/const_wasip1.go vendor/github.com/spf13/afero/const_wasip1.go
apply_patch patches/spf13/afero/const_win_unix.go vendor/github.com/spf13/afero/const_win_unix.go

apply_patch patches/sirupsen/logrus/terminal_check_appengine.go vendor/github.com/sirupsen/logrus/terminal_check_appengine.go
apply_patch patches/sirupsen/logrus/terminal_check_notappengine.go vendor/github.com/sirupsen/logrus/terminal_check_notappengine.go

apply_patch patches/fsnotify/fsnotify/backend_other.go vendor/github.com/fsnotify/fsnotify/backend_other.go

apply_patch patches/chzyer/readline/term.go vendor/github.com/chzyer/readline/term.go
apply_patch patches/chzyer/readline/term_unix.go vendor/github.com/chzyer/readline/term_unix.go
apply_patch patches/chzyer/readline/term_wasip1.go vendor/github.com/chzyer/readline/term_wasip1.go
apply_patch patches/chzyer/readline/utils_wasip1.go vendor/github.com/chzyer/readline/utils_wasip1.go

echo "==> Building WASI binary..."

# Mirror the Makefile's version stamping so `regula version` matches between the
# WASI and native builds (test/test-wasi.js asserts parity). Both default to the
# same sources; set VERSION explicitly for release builds.
VERSION="${VERSION:-$(changie latest 2>/dev/null || true)}"
BUILD_TYPE="${BUILD_TYPE:-dev}"
GITCOMMIT="$(git rev-parse --short HEAD 2>/dev/null || true)"
VERSION_PKG="github.com/fugue/regula/v3/pkg/version"

GOOS=wasip1 GOARCH=wasm go build -mod vendor \
    -ldflags="-X \"${VERSION_PKG}.Version=${VERSION}-${BUILD_TYPE}\" -X \"${VERSION_PKG}.GitCommit=${GITCOMMIT}\" -s -w" \
    -o regula.wasm

echo "==> Build complete: regula.wasm"
ls -lh regula.wasm
