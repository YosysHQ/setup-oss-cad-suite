import * as core   from '@actions/core'
import * as io     from '@actions/io'
import * as tc     from '@actions/tool-cache'
import * as exec   from '@actions/exec'
import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import { Octokit } from '@octokit/core'
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types'


const REPO_META = {
	owner: 'YosysHQ',
	repo: 'oss-cad-suite-build',
}

async function getReleaseURL(
	octokit: Octokit & Api, platform = 'linux', arch = 'x64', version?: string
): Promise<[string, string]> {
	const RELEASE_PREFIX = `oss-cad-suite-${platform}-${arch}`

	const releases = await (async () => {
		// If a specific version was requested, get that
		if (version) {
			const resp = await octokit.rest.repos.getReleaseByTag({
				owner: REPO_META.owner,
				repo: REPO_META.repo,
				tag: version
			})

			// Check to make sure we got an OK
			if (resp.status !== 200) {
				throw Error(`Unable to get OSS CAD Suite release for '${version}'`)
			}

			core.debug(`Found OSS CAD Suite release for ${version}`)

			// Return the release data
			return [ resp.data ]
		}

		// Otherwise the latest list of releases
		const resp = await octokit.rest.repos.listReleases({
			owner: REPO_META.owner,
			repo: REPO_META.repo,
			page: 1
		})

		// Check to make sure we got an OK
		if (resp.status !== 200) {
			throw Error('Unable to get latest OSS CAD Suite releases')
		}

		core.debug(`Found ${resp.data.length} OSS CAD Suite releases`)

		return resp.data
	})()

	// If this job triggers and the result is not cached, then we *might* try to get an asset
	// that has not been generated quite yet if the builds are still running, so we try to get the
	// next release we can.

	for (const release of releases) {
		// Get the first matching release
		const asset = release.assets.filter(
			asset => asset.name.startsWith(RELEASE_PREFIX)
		).shift()

		// If we have the asset, then try to get it
		if (asset) {
			core.info(`Got OSS CAD Suite release ${release.name}`)
			return [asset.browser_download_url, release.tag_name]
		}
	}

	// If we got this far, then we were not able to get the asset URL
	throw Error(`Unable to get OSS CAD Suite release for ${platform}-${arch}`)
}

function _validate(os: NodeJS.Platform , arch: NodeJS.Architecture) {
	if (os === 'linux') {
		const is_arm = ((arch === 'arm64') || (arch === 'arm'))
		if ((!is_arm) && (arch !== 'x64')) {
			throw Error(`Unsupported architecture '${arch}' for linux, must be either arm, arm64, or x64`)
		}
	} else if (os === 'darwin') {
		if ((arch !== 'arm64') && (arch !== 'x64')) {
			throw Error(`Unsupported architecture '${arch}' for darwin, must be either arm64 or x64`)
		}
	} else if (os === 'win32') {
		if (arch !== 'x64') {
			throw Error(`Unsupported architecture '${arch}' for windows, must be x64`)
		}
	} else {
		throw Error(`Unsupported Operating System '${os}', must be either linux or darwin`)
	}
}

function isPosix(os: NodeJS.Platform) {
	return ((os === 'linux') || (os === 'darwin'))
}

async function main(): Promise<void> {
	core.info('Setting up oss-cad-suite')
	try {
		const pkg_dir = core.toPlatformPath(`${process.env.RUNNER_TEMP}/oss-cad-suite`)
		const os = process.platform
		const arch = process.arch
		const tag = core.getInput('version')

		const token = (() => {
			const gh_token_old = core.getInput('github-token')
			const gh_token = core.getInput('token')

			// If the old token is set, use that preferentially
			if (gh_token_old !== '') {
				return gh_token_old
			}

			// Otherwise use the new, defaulted token
			return gh_token
		})()

		const octokit = (() => {
			// If we have a token, use that
			if (token !== '') {
				return github.getOctokit(token)
			}
			// Otherwise, try to use an unauthenticated version
			return new GitHub()
		})()

		const pkg_name = (() => {
			if (isPosix(os)) {
				return 'oss-cad-suite.tgz'
			}
			return 'oss-cad-suite.exe'
		})()

		core.debug(`Package directory is '${pkg_dir}'`)
		core.debug(`Package name is '${pkg_dir}'`)

		// Ensure we're running on a supported configuration
		_validate(os, arch)

		// Make the target dir for extraction
		await io.mkdirP(pkg_dir)

		// Get the URL for the release
		const [release_url, version] = await getReleaseURL(
			octokit,
			os === 'win32' ? 'windows' : os,
			arch,
			tag === '' ? undefined : tag
		)

		// Download the package to the temp directory
		core.info(`Downloading package from ${release_url}`)
		const pkg_file = await tc.downloadTool(
			release_url,
			core.toPlatformPath(`${process.env.RUNNER_TEMP}/${pkg_name}`)
		)

		// Extract the package
		core.info(`Extracting ${pkg_file} to ${pkg_dir}`)
		let suite_path = undefined
		if (isPosix(os)) {
			core.debug('System is a posix-like, using extract tar')
			suite_path = await tc.extractTar(
				pkg_file, pkg_dir,
				['xz', '--strip-components=1']
			)
		} else {
			core.debug('Assuming system is windows, trying to run installer')
			suite_path = pkg_dir
			await exec.exec(
				pkg_file, [
					// Because we can't strip out the root we have to just extract over the dir
					`-o${process.env.RUNNER_TEMP}`, '-y'
				]
			)
		}

		core.debug(`Suite path is '${suite_path}'`)

		// Add the bin dir to the path
		core.addPath(`${suite_path}/bin`)

		// If we are overloading the system python, do so
		if (core.getBooleanInput('python-override')) {
			core.info('Overloading system python with oss-cad-suite provided python')
			core.addPath(`${suite_path}/py3bin`)
		}

		core.info('Done')
	} catch (err) {
		if (err instanceof Error) {
			core.setFailed(err.message)
		}
	}
}

main()
