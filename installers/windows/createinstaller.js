const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'cbox-admin-app-win32-x64/'),
    authors: 'Lars Gunnarsson',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'cbox-admin-app.exe',
    setupExe: 'CboxDesktopAdminInstaller.exe',
    setupIcon: path.join(outPath, 'cbox-admin-app-win32-x64/resources/app/public/favicon.ico')
  })
}
