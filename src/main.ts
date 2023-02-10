import * as core from '@actions/core'
import * as io   from '@actions/io'
import * as http from '@actions/http-client'


type github_asset = {
	name: string,
	browser_download_url: string,
}

type github_release = {
	assets: github_asset[]
}

const API_URL = 'https://api.github.com/repos/YosysHQ/oss-cad-suite-build'

async function getDownloadURL(platform = 'linux', arch = 'x64', tag?: string): Promise<string> {
	const ARCHIVE_PREFIX = `oss-cad-suite-${platform}-${arch}`
	const API_ENDPOINT = (() => {
		if (tag) {
			return `releases/tag/${tag}`
		}
		return 'releases/latest'
	})()

	const _http = new http.HttpClient()

	core.debug(`Getting download URL for ${ARCHIVE_PREFIX}`)

	const resp = await _http.getJson<github_release>(`${API_URL}/${API_ENDPOINT}`)
	const assets = resp.result?.assets

	if (!assets) {
		throw Error('Unable to get download URL for oss-cad-suite package')
	}

	const url = assets.filter(
		pkg => pkg.name.startsWith(ARCHIVE_PREFIX)
	).map(
		pkg => pkg.browser_download_url
	).shift()

	if (!url) {
		throw Error('Unable to get download URL for oss-cad-suite package')
	}
	return url
}

async function main(): Promise<void> {
	core.debug('Starting setup-oss-cad-suite')
	try {
		const pkg_dir = `${process.env.RUNNER_TEMP}/oss-cad-suite`;
		const os = process.platform;
		const arch = process.arch;
		const tag = core.getInput('osscadsuite-version');

		// Make the target dir for extraction
		await io.mkdirP(pkg_dir)

		// Get the download URL for the package and then download it
		const download_url = await getDownloadURL(os, arch, tag === '' ? undefined : tag)

		core.debug(`Downloading package from ${download_url}`)
		}

	} catch (err) {
		if (err instanceof Error) {
			core.setFailed(err.message)
		}
	}
}

main()
