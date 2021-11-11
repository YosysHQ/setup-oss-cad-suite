const core = require('@actions/core')
const {exec} = require('@actions/exec')
const path = require('path')

main().catch(err => {
  core.setFailed(err.message)
})

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

