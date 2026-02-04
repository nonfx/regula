//go:build appengine || wasip1 || (!darwin && !dragonfly && !freebsd && !openbsd && !linux && !netbsd && !solaris && !windows)

package fsnotify

import "errors"

// ErrNotSupported is returned when fsnotify is not supported on the current platform.
var ErrNotSupported = errors.New("fsnotify not supported on the current platform")

type other struct {
	Events chan Event
	Errors chan error
}

var defaultBufferSize = 0

func newBackend(ev chan Event, errs chan error) (backend, error) {
	return nil, ErrNotSupported
}
func (w *other) Close() error                              { return ErrNotSupported }
func (w *other) WatchList() []string                       { return nil }
func (w *other) Add(name string) error                     { return ErrNotSupported }
func (w *other) AddWith(name string, opts ...addOpt) error { return ErrNotSupported }
func (w *other) Remove(name string) error                  { return ErrNotSupported }
func (w *other) xSupports(op Op) bool                      { return false }
