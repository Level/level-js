# Changelog

## [Unreleased]

## [2.2.4] - 2016-05-09

### Changed
* Use `toArrayBuffer()` only when present (@substack)

## [2.2.3] - 2015-12-10

### Changed
* Update `ltgt` to `^2.1.2` (@ryanramage)

## [2.2.2] - 2015-09-12

### Added
* Add @nolanlawson to collaborators (@maxogden)

### Fixed
* Fix iterator when start > end (@nolanlawson)

**Historical Note** This release introduced `this._keyRangeError`.

## [2.2.1] - 2015-07-05

### Changed
* Update collaborators (@maxogden)
* Roll back `abstract-leveldown` to `~0.12.0` (@maxogden)

## [2.2.0] - 2015-07-03

### Added
* Add `Collaborators` section to README (@maxogden)

### Changed
* Update syntax highlighting in README (@yoshuawuyts)
* Update `idb-wrapper` to `^1.5.0` (@JamesKyburz)
* Update `abstract-leveldown` to `^2.4.0` (@maxogden)
* Update `tape` to `^4.0.0` (@maxogden)
* Move `tape` to devDependencies (@maxogden)
* Change license from BSD to BSD-2-Clause (@maxogden)

### Removed
* Remove Testling badge (@maxogden)

## [2.1.6] - 2014-06-15

### Fixed
* Avoid using keyword in `cursor.continue()` (@nolanlawson)

## [2.1.5] - 2014-05-29

### Changed
* Use `ltgt` module to handle ranges (@dominictarr)

## [2.1.4] - 2014-05-13

### Changed
* Update `browserify` to `^4.1.2` (@maxogden)
* Move `browserify` to devDependencies (@maxogden)

## [2.1.3] - 2014-04-09

### Added
* Use `typedarray-to-buffer` to avoid copying to Buffer (@mafintosh)

## [2.1.2] - 2014-04-05

### Added
* Add link to @brycebaril's presentation to README (@maxogden)

### Changed
* Update browser configuration for Testling (@maxogden)

## [2.1.1] - 2014-03-12

### Changed
* Update browser configuration for Testling (@maxogden)
* Update `abstract-leveldown` to `~0.12.0` (@maxogden)
* Update `levelup` to `~0.18.2` (@maxogden)
* Make sure to store `Uint8Array` (@maxogden)
* Test storing native JS types with raw = true (@maxogden)

**Historical Note** This was not published to npm. There's also a gap between `2.1.1` and `2.0.0` that is inconsistent. The `options.raw` property was introduced in this release.

## [2.0.0] - 2014-03-09

### Changed
* Update `browserify` to `~3.32.0` (@maxogden)
* Update `tape` to `~2.10.2` (@maxogden)
* Change default encoding of values to strings to more closely match `leveldown` (@maxogden)

### Fixed
* Add missing `xtend` dependency (@maxogden)

**Historical Note** For some reason both `tape` and `browserify` were moved from devDependencies to dependencies. This release only had one commit.

## [1.2.0] - 2014-03-09

### Added
* Add `IndexedDBShim` to tests (@maxogden)
* Add `Level.destroy()` (@qs44)
* Add prefix to pass `PouchDB` tests (@qs44)
* Test `Level.destroy()` (@calvinmetcalf)

### Changed
* Update browser configuration for Testling (@maxogden)
* Pass through open options to idbwrapper (@maxogden)

### Fixed
* Don't use `indexedDB.webkitGetDatabasesNames()` in tests (@maxogden)

## [1.1.2] - 2014-02-02

### Removed
* Remove global leaks (@mcollina)

## [1.1.1] - 2014-02-02

### Changed
* Modify a copy of the batch array, not the original (@nrw)

### Fixed
* Fix broken `package.json` (@maxogden)
* Fix testling path (@maxogden)

## [1.1.0] - 2014-01-30

### Added
* Add Testling (@maxogden)
* Add npm badge (@maxogden)
* Test ranges (@rvagg, @maxogden)

### Changed
* Update README (@maxogden)
* Update `abstract-leveldown` to `~0.11.0` (@rvagg, @maxogden)
* Update to work with `abstract-leveldown@0.11.2` (@shama, @maxogden)
* Update iterator to pass all range tests (@shama, @maxogden)

### Fixed
* Fix incorrect version of `abstract-leveldown` (@maxogden)
* Pass error to callback in `approximateSize()` (@mcollina)

### Removed
* Remove unnecessary factor in tests (@rvagg, @maxogden)

**Historical Note** In this time period `bops` shows up and gets removed. Also, `._isBuffer()` uses `Buffer.isBuffer()` in favor of `is-buffer` module.

## [1.0.8] - 2013-08-12

### Changed
* Move `levelup` to devDependencies (@juliangruber)

### Removed
* Remove fn#bind from iterator (@juliangruber)

## [1.0.7] - 2013-07-02

### Changed
* Implement full batch support (@mcollina)

### Fixed
* Fix git url to `abstract-leveldown` (@maxogden)

## [1.0.6] - 2013-05-31

### Changed
* Update `idb-wrapper` to `1.2.0` (@maxogden)
* Switch `abstract-leveldown#master` (@maxogden)
* Disable batch and chainable batch tests (@maxogden)

## [1.0.5] - 2013-05-30

### Changed
* Use upstream `idb-wrapper` (@maxogden)

## [1.0.4] - 2013-05-30

### Added
* Test batch and chainable batch (@rvagg)

### Changed
* Update `abstract-leveldown` to `~0.7.1` (@rvagg)
* Update `levelup` to `~0.9.0` (@brycebaril)

## [1.0.3] - 2013-05-14

### Changed
* Use `is-buffer` (@juliangruber)

## [1.0.2] - 2013-05-04

### Fixed
* Don't convert `ArrayBuffer` and typed arrays to strings (@maxogden)

## [1.0.1] - 2013-05-03

### Added
* Add optional options argument to `.open()` (@rvagg)
* Add `test-levelup.js` (@maxogden)

### Changed
* Update README (@maxogden)
* Use `npm test` instead of `npm start` (@shama)
* Properly delete test dbs (@maxogden)
* Inherit from `abstract-leveldown` (@rvagg)

## 1.0.0 - 2013-05-03

:seedling: Initial release.

[Unreleased]: https://github.com/level/level.js/compare/v2.2.4...HEAD
[2.2.4]: https://github.com/level/level.js/compare/v2.2.3...v2.2.4
[2.2.3]: https://github.com/level/level.js/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/level/level.js/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/level/level.js/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/level/level.js/compare/v2.1.6...v2.2.0
[2.1.6]: https://github.com/level/level.js/compare/v2.1.5...v2.1.6
[2.1.5]: https://github.com/level/level.js/compare/v2.1.4...v2.1.5
[2.1.4]: https://github.com/level/level.js/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/level/level.js/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/level/level.js/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/level/level.js/compare/v2.0.0...v2.1.1
[2.0.0]: https://github.com/level/level.js/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/level/level.js/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/level/level.js/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/level/level.js/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/level/level.js/compare/v1.0.8...v1.1.0
[1.0.8]: https://github.com/level/level.js/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/level/level.js/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/level/level.js/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/level/level.js/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/level/level.js/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/level/level.js/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/level/level.js/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/level/level.js/compare/v1.0.0...v1.0.1

