//go:build wasip1
// +build wasip1

package readline

import (
	"io"
	"sync"
)

type winsize struct {
	Row    uint16
	Col    uint16
	Xpixel uint16
	Ypixel uint16
}

// SuspendMe is a no-op in WASI as signals are not supported.
func SuspendMe() {
	// No-op for WASI
}

// getWidth is a stub in WASI, returning a fixed width or an error.
func getWidth(stdoutFd int) int {
	return 80 // Return a fixed width of 80 columns as a default
}

// GetScreenWidth returns a fixed width as terminal size detection is not supported in WASI.
func GetScreenWidth() int {
	return getWidth(0) // Use the stub getWidth function
}

// ClearScreen clears the console screen.
func ClearScreen(w io.Writer) (int, error) {
	return w.Write([]byte("\033[H"))
}

// DefaultIsTerminal always returns false as terminal detection is not supported in WASI.
func DefaultIsTerminal() bool {
	return false
}

// GetStdin returns a constant value as stdin is managed differently in WASI.
func GetStdin() int {
	return 0 // Returning a dummy value
}

// -----------------------------------------------------------------------------

var (
	widthChange         sync.Once
	widthChangeCallback func()
)

// DefaultOnWidthChanged is a no-op in WASI as signal handling is not supported.
func DefaultOnWidthChanged(f func()) {
	// No-op for WASI
	widthChangeCallback = func() {} // Assign an empty function to avoid nil dereferences
}
