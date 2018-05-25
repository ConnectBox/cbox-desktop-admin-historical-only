const {app,process,dialog} = require('electron').remote;
const electron = require('electron');
const {ipcRenderer} = require('electron');
const fse = electron.remote.require('fs-extra'); // "promisified" fs function calls
const edm = electron.remote.require('electron-download-manager');
const path = electron.remote.require('path');

isWin = () => (process.platform === "win32")

isDevelopment = () => ((process.env.NODE_ENV || 'development')==='development')

if (!isDevelopment()){
console.log(app.getAppPath())
console.log(path.resolve('..'))
  appRootPath = path.resolve('..');
} else { // redirection - for debugging from special sibling folder "all-media"
  appRootPath = "../all-media"
}
console.log(appRootPath)

getAbsPath = (curPath) => (curPath==null)? appRootPath : path.resolve(appRootPath,curPath)
showOpenDialog = (options) => dialog.showOpenDialog(options)
ipcRendererSend = (message,data) => ipcRenderer.send(message,data)
ipcRendererOnLocale = (listener) => ipcRenderer.on('locale', listener)
ipcRendererOnDriveChange = (listener) => ipcRenderer.on('drive-change', listener)
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

getAllFiles = async (dir) => {
  const useDir = getAbsPath(dir);
  const filenamesArr = await readdirAsync(useDir);
  const fileStatPromises = filenamesArr.map(async fileName => {
// !!! ToDo: use system independent dirSeparator
//    const stats = await statAsync(useDir + '/' + fileName)
    const stats = await statAsync(useDir + path.sep + fileName)
    return {
      filePath: (useDir + path.sep + fileName),
      isDirectory: (!stats.isFile()),
    }
  });
  return Promise.all(fileStatPromises);
};

ajaxGetMAPAsync = (pageName,guidStr,paramStr) => {
	var url = 'http://mapapi.azurewebsites.net/api/' + pageName
							+ "?applicationEndpointGuid=" + guidStr + "&" + paramStr;
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("error", reject);
        xhr.addEventListener("load", resolve);
        xhr.open("GET", url);
        xhr.send(null);
    });
}

ajaxGetFileAsync = (url) => {
  return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("error", reject);
      xhr.addEventListener("load", resolve);
      xhr.open("GET", url);
      xhr.send(null);
  });
}

downloadFile = (url, progressUpdate) => new Promise((resolve, reject) => {
  edm.download({
    url,
    path: "tmpDir",
    onProgress: progressUpdate,
  }, (error) => {
    if(error){
console.log("ERROR: ");
        reject()
        return;
    }
console.log("DONE: ");
    resolve()
  })
});

downloadFileAndMove = async (url, fname, progressUpdate) => {
  const tmpDir = path.dirname(getAbsPath("map_lib/tmpDir/x"));
console.log(tmpDir)
  await fse.emptyDir(tmpDir);
  await downloadFile(url,progressUpdate)
  const dirlist = await getAllFiles(tmpDir)
console.log(dirlist)
  if ((dirlist!=null)&&(dirlist.length>0)){
    await fse.move(dirlist[0].filePath,getAbsPath(fname),{overwrite: true}, err => {
      if (err) return console.error(err)
      console.log('success!')
      console.log(getAbsPath(fname))
    })
  }
}

downloadFiles = async (filelist,listProgress,donwloadProgress) => {
  const tmpTotal = filelist.length;
  for (const [index, file] of filelist.entries()) {
    if (listProgress!=null){
      listProgress(index,tmpTotal,file);
    }
    await downloadFileAndMove(file.url,file.fName,donwloadProgress)
    console.log("done ep")
  }
  if (listProgress!=null){
    listProgress(0,0,undefined);
  }
  console.log("done all")
}

getNormalizedPath = (curPath) => path.normalize(curPath)

hostPathSep = path.sep;

getHostPathSep = () => {
  return hostPathSep
}

getRelPath = (orgPath,curPath) => {
//  const tmpPath = path.dirname(curPath);
  const tmpPath = curPath;
  let retStr = tmpPath;
  if (retStr!=null){
    const lenCur = tmpPath.length;
    retStr = path.relative(orgPath,tmpPath);
    const lenRes = retStr.length;
    if (lenRes>lenCur){
      retStr = tmpPath; // reject if path string is longer
    }
  }
  retStr = retStr.replace(/\\\\/g, '/');
  retStr = retStr.replace(/\\/g, '/');
  return retStr
}

getDirName = (curPath) => {
  let retStr = undefined;
  if (curPath!=null){
    retStr = curPath.substring(0,curPath.lastIndexOf(path.sep));
  }
  return retStr;
}

getDirNameSlash = (curPath) => {
  let retStr = undefined;
  if (curPath!=null){
    retStr = curPath.substring(0,curPath.lastIndexOf('/'));
  }
  return retStr;
}

getFileName = (curPath) => {
  let retStr = undefined;
  if (curPath!=null){
    retStr = curPath.substring(curPath.lastIndexOf(path.sep)+1,curPath.length);
  }
  return retStr;
}

getFileNameSlash = (curPath) => {
  let retStr = undefined;
  if (curPath!=null){
    retStr = curPath.substring(curPath.lastIndexOf('/')+1,curPath.length);
  }
  return retStr;
}
