//go:build wasip1
// +build wasip1

package readline

import (
	"errors"
)

type Termios struct {
	Iflag     uint64
	Oflag     uint64
	Cflag     uint64
	Lflag     uint64
	Cc        [20]uint8
	Pad_cgo_0 [4]byte
	Ispeed    uint64
	Ospeed    uint64
}

// getTermios is a mock function in WASI and returns an error as terminal I/O control is not supported.
func getTermios(fd int) (*Termios, error) {
	return nil, errors.New("unsupported on WASI")
}

// setTermios is a mock function in WASI and returns an error as terminal I/O control is not supported.
func setTermios(fd int, termios *Termios) error {
	return errors.New("unsupported on WASI")
}

// GetSize returns the dimensions of the terminal.
// Since WASI does not support ioctl system calls, we mock this function.
func GetSize(fd int) (int, int, error) {
	// Mocking terminal size, as there's no terminal support in WASI
	// You can choose to return fixed dimensions, or an error depending on your use case
	return 80, 24, nil // Returning a standard terminal size of 80x24
	// or return 0, 0, errors.New("unsupported on WASI") if you prefer to handle this as an error
}
