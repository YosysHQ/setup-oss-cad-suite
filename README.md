# setup-oss-cad-suite

This action sets up a [OSS CAD Suite](https://github.com/YosysHQ/oss-cad-suite-build) environment for use in actions by:

- downloading a version of OSS CAD Suite by version (or latest by default) and adding to PATH

# Usage

Using latest release
```yaml
steps:
- uses: actions/checkout@v2
- uses: YosysHQ/setup-oss-cad-suite@v1
- run: yosys --version
```

Matching an specific release:
```yaml
steps:
- uses: actions/checkout@v2
- uses: YosysHQ/setup-oss-cad-suite@v1
  with:
    osscadsuite-version: '2021-05-28'
- run: yosys --version
```

OSS CAD Suite flavored Python3 can be used with next option:
```yaml
steps:
- uses: YosysHQ/setup-oss-cad-suite@v1
  with:
    python-override: true
```

# Example

```yaml
name: CI
on:
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: YosysHQ/setup-oss-cad-suite@v1
      - run: yosys --version
```

# License

The scripts and documentation in this project are released under the [ISC](COPYING)
