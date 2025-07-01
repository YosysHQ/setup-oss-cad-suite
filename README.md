# Setup OSS CAD Suite v4

This action downloads and sets up a pre-built EDA environment from [OSS CAD Suite] with the most up-to-date FOSS EDA tools available.

> [!IMPORTANT]
> v4 is a breaking change from v3, be sure to see the [migration guide] below

## Getting Started

The least fuss and most minimal way to use this action is to just add the action into your CI workflow, like so:

```yaml
name: 'CI'
on: [ push ]

jobs:
  run-yosys:
    name: 'Run Yosys'
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout'
        uses: actions/checkout@v4

      - name: 'Setup OSS CAD Suite'
        uses: YosysHQ/setup-oss-cad-suite@v4

      - name: 'Get Yosys Version'
        run: |
          yosys --version
```

If you need a specific version of the tools, then you can specify the `version` parameter to get that specific build of the tools:

```yaml
- name: 'Setup OSS CAD Suite'
  uses: YosysHQ/setup-oss-cad-suite@v4
  with:
    version: '2025-06-30'
```

## Configuration

The following are all the knobs and switches that you can use to control the behavior of the action.

| Setting           | Description | Type     | Required |
|-------------------|-------------|----------|----------|
| `token`           | The GitHub token to use for API interactions and authentication.<br/><br/> It is used to get the latest release of the tools as well as download the binary package. <br/> By default this option is set to the default GitHub token scoped to this repository, to disable authenticated fetches set this option to an empty string (`''`).<br/><br/> It is **highly recommended** to set workflow or job permissions to ***READ ONLY*** for security, while this action *should never* use the token for API writes, it would be best to ensure that it ***CAN'T*** even if it wanted to. | `string` | No       |
| `version`         | The version of OSS CAD Suite to use. <br/><br/>If not set, this action will always get the latest version possible, falling back to previous versions if it can.<br/><br/> The version number is in the format of `YYYY-MM-DD` and they are typically build nightly, see the [OSS CAD Suite release page] for the current list of available releases. | `string` | No       |
| `python-override` | Attempt to use the Python 3 environment built and shipped with OSS CAD Suite as the global Python on the system. | `bool`   | No       |
| `cache`           | Enables use of the GitHub workflows cache layer to re-use already downloaded releases. | `bool`   | No       |
| `cache-key`       | The cache key to use for lookups if the `cache` setting is enabled.<br/><br/> If `cache` is enabled and this value is not provided then the default cache key discriminator is the current date on UTC in the format `YYYYMMDD`.<br/><br/> If `version` is specified, that overrides this setting. | `string` | No       |

## Recipes

Some of more generally applicable and useful recipes below should be ready to just cut-and-paste into your workflows as needed to get things up and running.

### No Fuss nightly with Caching

Cache only todays release of the OSS CAD Suite.

```yaml
- name: 'Setup OSS CAD Suite'
  uses: YosysHQ/setup-oss-cad-suite@v4
  with:
    cache: true
```

### Cached Fixed Version

Specify a version and cache it to prevent need to re-download.

```yaml
- name: 'Setup OSS CAD Suite'
  uses: YosysHQ/setup-oss-cad-suite@v4
  with:
    version: '2025-06-30'
    cache: true
```

## Migration Guide

The following guides are for migrating between major versions for `setup-oss-cad-suite`.

### `v3` to `v4`

The `github-token` option was removed in favor of the `token` option.

If you were specifying just `${{ github.token }}` or `${{ secrets.GITHUB_TOKEN }}` then you can simply remove the option as `token`, now defaults to that value.

If you are using a specific [personal access token] then simply renaming `github-token` to `token` will suffice.

## License

The scripts and documentation in this project are released under the [ISC] license, the full text of which can be found in the [`LICENSE`] file in the root of this repository.

[OSS CAD Suite]: https://github.com/YosysHQ/oss-cad-suite-build
[OSS CAD Suite release page]: https://github.com/YosysHQ/oss-cad-suite-build/releases
[migration guide]: #migration-guide
[personal access token]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
[ISC]: https://spdx.org/licenses/ISC.html
[`LICENSE`]: ./LICENSE
