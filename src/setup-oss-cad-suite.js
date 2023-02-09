const core = require('@actions/core')
const {exec} = require('@actions/exec')
const request = require('request');
const io = require('@actions/io')
const path = require('path')

const API_URL = 'https://api.github.com/repos/YosysHQ/oss-cad-suite-build'

main().catch(err => {
  core.setFailed(err.message)
})

async function getDownloadURL(platform = 'linux', arch = 'x64', tag = undefined) {
  ARCHIVE_PREFIX = 'oss-cad-suite'.concat('-', platform, '-', arch)
  if (tag === undefined) {
    API_ENDPOINT = API_URL.concat('/releases/tags/', tag)
  } else {
    API_ENDPOINT = API_URL.concat('/releases/latest')
  }
  request.get({
    url: API_ENDPOINT,
    json: true,
    headers: {
      'User-Agent': 'setup-oss-cad-suite/v2'
    }
  }, (err, res, data) => {
    if (err) {
      core.error(`Unable to download release manifest for oss-cat-suite ${err}`);
    } else {
      data.assets.forEach(pkg => {
        if (pkg.name.startsWith(ARCHIVE_PREFIX)) {
          return pkg.browser_download_url;
        }
      });
    }
  });
}

async function installOSSCADSuite() {

  if ((process.platform === 'linux') || (process.platform === 'darwin')) {
    let version = core.getInput('osscadsuite-version')
    if (version == null)
      await exec(path.join(__dirname, 'install-oss-cad-suite'), [process.platform.concat("-x64")])
    else
      await exec(path.join(__dirname, 'install-oss-cad-suite'), [process.platform.concat("-x64"), version])
  }
}

async function main() {
  checkPlatform()

  console.log(`##[group]Installing OSS CAD Suite`)

  await installOSSCADSuite()
  console.log(`##[endgroup]`)
  core.addPath(`${process.env.RUNNER_TEMP}/.setup-oss-cad-suite/oss-cad-suite/bin`)
  const pythonOverride = core.getInput('python-override')
  if (pythonOverride)
    core.addPath(`${process.env.RUNNER_TEMP}/.setup-oss-cad-suite/oss-cad-suite/py3bin`)
}

function checkPlatform() {
  if ((process.platform !== 'linux') && (process.platform !== 'darwin'))
    throw new Error(
      '@actions/setup-oss-cad-suite only supports Ubuntu Linux at this time'
    )
}
