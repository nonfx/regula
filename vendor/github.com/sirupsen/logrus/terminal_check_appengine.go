//go:build appengine || wasip1
// +build appengine wasip1

package logrus

import (
	"io"
)

func checkIfTerminal(w io.Writer) bool {
	return true
}
