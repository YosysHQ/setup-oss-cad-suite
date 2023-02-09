import * as core from '@actions/core'
import * as io   from '@actions/io'
import bent      from 'bent'
import {Json}    from 'bent'

type github_asset = {
	name: string,
	browser_download_url: string,
}


const API_URL = 'https://api.github.com/repos/YosysHQ/oss-cad-suite-build'

async function getDownloadURL(platform = 'linux', arch = 'x64', tag?: string): Promise<string | undefined> {
	const ARCHIVE_PREFIX = `oss-cad-suite-${platform}-${arch}`
	const API_ENDPOINT = (() => {
		if (tag) {
			return `releases/tag/${tag}`
		}
		return 'releases/latest'
	})()

	core.debug(`Getting download URL for ${ARCHIVE_PREFIX}`)

	const res = await bent(API_URL, 'GET', 'json')(API_ENDPOINT) as Json
	const assets: Array<github_asset> = res.entries['assets']
	return assets.filter(
		pkg => pkg.name.startsWith(ARCHIVE_PREFIX)
	).map(
		pkg => pkg.browser_download_url
	).shift()
}

async function downloadPackage(url: string) {
	core.debug(`Downloading package from ${url}`)

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
		const download_url = await getDownloadURL(os, arch, tag === '' ? undefined : tag);
		if (download_url) {
			await downloadPackage(download_url)
		} else {
			throw Error('Unable to get download URL for OSS-CAD-SUITE package')
		}

	} catch (err) {
		if (err instanceof Error) {
			core.setFailed(err.message)
		}
	}
}

main()
