const {app,process,dialog,BrowserWindow} = require('electron').remote

const electron = require('electron')
const {ipcRenderer} = require('electron')
const fse = electron.remote.require('fs-extra') // "promisified" fs function calls
const edl = electron.remote.require('electron-dl')
const path = electron.remote.require('path')

isWin = () => (process.platform === "win32")

isDevelopment = () => (process.env.ELECTRON_START_URL!=null)

const htmlDecode = textStr => Object.assign(document.createElement('textarea'), {innerHTML: textStr}).value

if (!isDevelopment()){
console.log(app.getAppPath())
console.log(path.resolve('..'))
  appRootPath = path.resolve('..')
} else { // redirection - for debugging from special sibling folder "all-media"
  appRootPath = "../all-media"
}

console.log(appRootPath)
curWindowSize = () => electron.remote.getCurrentWindow().getSize()
curContentSize = () => electron.remote.getCurrentWindow().getContentSize()
getAppPath = () => app.getAppPath()
getAbsPath = (curPath) => (curPath==null)? appRootPath : path.resolve(appRootPath,curPath)
showOpenDialog = (options) => dialog.showOpenDialog(options)
ipcRendererSend = (message,data) => ipcRenderer.send(message,data)
ipcRendererOn = (channel,listener) => ipcRenderer.on(channel, listener)
ipcRendererRemoveListener = (channel) => ipcRenderer.removeAllListeners(channel)
setOrgPath = (orgPath) => appRootPath = orgPath
outputJsonAsync = (fname, obj) => fse.outputFile(getAbsPath(fname),JSON.stringify(obj))
outputJsVarAsync = (fname, varName, obj) =>
                      fse.outputFile(getAbsPath(fname),"export var " +varName + " = " +JSON.stringify(obj))
outputFileAsync = (fname, data) => fse.outputFile(getAbsPath(fname),data)
readFileAsync = (fname, encoding) => fse.readFile(getAbsPath(fname),encoding)
readJsonAsync = fname => fse.readJSON(getAbsPath(fname))
readdirAsync = dirname => fse.readdir(getAbsPath(dirname))
statAsync = path => fse.stat(getAbsPath(path))
readJson = fname => fse.readJSON(getAbsPath(fname))
pathExistsAsync = fname => fse.pathExists(getAbsPath(fname))
copyAsync = (src, dest) => fse.copy(src,dest)
ensureDirAsync = dirPath => fse.ensureDir(dirPath)
moveAsync = (srcPath,destPath) => fse.move(srcPath,destPath)
removeAsync = dirPath => fse.remove(dirPath)
emptyDirAsync = dirPath => fse.emptyDir(dirPath)

getAllFiles = async (dir) => {
  const useDir = getAbsPath(dir)
  const filenamesArr = await readdirAsync(useDir)
  const fileStatPromises = filenamesArr.map(async fileName => {
    const stats = await statAsync(useDir + path.sep + fileName)
    return {
      filePath: (useDir + path.sep + fileName),
      isDirectory: (!stats.isFile()),
    }
  })
  return Promise.all(fileStatPromises)
}

ajaxGetFileAsync = (url) => {
  return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest()
      xhr.addEventListener("error", reject)
      xhr.addEventListener("load", resolve)
      xhr.open("GET", url)
      xhr.send(null)
  })
}

downloadFile = async (url, dir, fname, progressUpdate) => {
  const dirTmp = htmlDecode(dir.replace(/\\\\/g, '\\'))
  const directory = dirTmp.replace( /[<>"\/|?*]+/g, '_' )
  const fTmp = htmlDecode(fname)
  const filename = fTmp.replace( /[<>:"\/\\|?*]+/g, '_' )
  const wList = BrowserWindow.getAllWindows()
  //  return edl.download(BrowserWindow.getFocusedWindow(),url,{
  if ((wList!=null)&&(wList[0]!=null)) {
    return edl.download(wList[0],url,{
        filename,
        directory,
        onProgress: progressUpdate,
      })
  } else {
console.log("DANGER! - no window exists!!!")
  }
}

downloadFiles = async (usbPath,filelist,listProgress,donwloadProgress) => {
  const tmpTotal = filelist.length
  for (let [index, file] of filelist.entries()) {
    if (listProgress!=null){
      listProgress(index,tmpTotal,file)
    }
    let tmpDir = ""
    if (isWin()) {
      tmpDir = path.dirname(path.resolve(usbPath,file.fName))
    } else {
      tmpDir = path.dirname(usbPath+getAbsPath(file.fName))
    }
    await downloadFile(file.url,tmpDir,path.basename(file.fName),donwloadProgress)
  }
  if (listProgress!=null){
    listProgress(0,0,undefined)
  }
  console.log("done all")
}

getNormalizedPath = (curPath) => path.normalize(curPath)

hostPathSep = path.sep

getHostPathSep = () => {
  return hostPathSep
}

getRelPath = (orgPath,curPath) => {
//  const tmpPath = path.dirname(curPath)
  const tmpPath = curPath
  let retStr = tmpPath
  if (retStr!=null){
    const lenCur = tmpPath.length
    retStr = path.relative(orgPath,tmpPath)
    const lenRes = retStr.length
    if (lenRes>lenCur){
      retStr = tmpPath // reject if path string is longer
    }
  }
  retStr = retStr.replace(/\\\\/g, '/')
  retStr = retStr.replace(/\\/g, '/')
  return retStr
}

getDirName = (curPath) => {
  let retStr = undefined
  if (curPath!=null){
    retStr = curPath.substring(0,curPath.lastIndexOf(path.sep))
  }
  return retStr
}

getDirNameSlash = (curPath) => {
  let retStr = undefined
  if (curPath!=null){
    retStr = curPath.substring(0,curPath.lastIndexOf('/'))
  }
  return retStr
}

getFileName = (curPath) => {
  let retStr = undefined
  if (curPath!=null){
    retStr = curPath.substring(curPath.lastIndexOf(path.sep)+1,curPath.length)
  }
  return retStr
}

getFileNameSlash = (curPath) => {
  let retStr = undefined
  if (curPath!=null){
    retStr = curPath.substring(curPath.lastIndexOf('/')+1,curPath.length)
  }
  return retStr
}

getLocale = () => app.getLocale()
