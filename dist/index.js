/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 25:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 635:
/***/ ((module) => {

module.exports = eval("require")("@actions/exec");


/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(25)
const {exec} = __nccwpck_require__(635)
const path = __nccwpck_require__(622)

main().catch(err => {
  core.setFailed(err.message)
})

async function installOSSCADSuite() {
  if (process.platform === 'linux') {
    let version = core.getInput('osscadsuite-version')
    if (version == null)
      await exec(__nccwpck_require__.ab + "install-oss-cad-suite")
    else 
      await exec(__nccwpck_require__.ab + "install-oss-cad-suite", [version])
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


})();

module.exports = __webpack_exports__;
/******/ })()
;