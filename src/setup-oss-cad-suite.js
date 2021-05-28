const core = require('@actions/core')
const {exec} = require('@actions/exec')
const path = require('path')

main().catch(err => {
  core.setFailed(err.message)
})

async function installOSSCADSuite() {
  if (process.platform === 'linux') {
    let version = core.getInput('osscadsuite-version')
    if (version == null)
      await exec(path.join(__dirname, 'install-oss-cad-suite'))
    else 
      await exec(path.join(__dirname, 'install-oss-cad-suite'), [version])
  }
}

async function main() {
  checkPlatform()

  console.log(`##[group]Installing OSS CAD Suite`)

  await installOSSCADSuite()
  console.log(`##[endgroup]`)

  process.env.PATH = `${process.env.RUNNER_TEMP}/.setup-oss-cad-suite/oss-cad-suite/bin:${process.env.PATH}`
}

function checkPlatform() {
  if (process.platform !== 'linux')
    throw new Error(
      '@actions/setup-oss-cad-suite only supports Ubuntu Linux at this time'
    )
}

