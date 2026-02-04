//go:build !wasip1 && !appengine && !js && !windows && !nacl && !plan9
// +build !wasip1,!appengine,!js,!windows,!nacl,!plan9

package logrus

import (
	"io"
	"os"
)

func checkIfTerminal(w io.Writer) bool {
	switch v := w.(type) {
	case *os.File:
		return isTerminal(int(v.Fd()))
	default:
		return false
	}
}
