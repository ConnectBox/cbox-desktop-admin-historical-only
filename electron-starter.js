//handle setupevents as quickly as possible
/*
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
   // squirrel event handled and app will exit in 1000ms, so don't do anything else
   return
}
*/

const {app, ipcMain, BrowserWindow, dialog, shell} = require('electron')
const path = require('path')
const url = require('url')
const DecompressZip = require('decompress-zip')
const AdmZip = require('adm-zip')
const lodash = require('lodash')
const request = require('request')
const axios = require('axios')
const protocols = require('./electron-protocols')
const {machineIdSync} = require('node-machine-id')
const fse = require('fs-extra') // "promisified" fs function calls
const SDK = require('./etcher-lib/sdk')

const jsonEqual = (a,b) => JSON.stringify(a) === JSON.stringify(b)

function unzip(file, target, cb) { // Unzips
  var out = new DecompressZip(file)

  out.on('error', err => {
    mainWindow.webContents.send('unzip-error', err)
console.log(err)
  })
  out.on('extract', log => {
    mainWindow.webContents.send('download-end', log)
    if (cb){
      cb()
    }
  })
  out.on('progress', (fileIndex, fileCount) => {
    mainWindow.webContents.send('unzip-progress', JSON.stringify({fileIndex, fileCount}))
  })
  out.extract({
      path: target,
      filter: file => {
console.log(file.filename)
console.log(file.type)
        return file.type !== "SymbolicLink"
      }
  })
}

const unzipAsync = async (orgDir,fname) => {
  const zip = new AdmZip(orgDir+'/'+fname)
/*
	const zipEntries = zip.getEntries() // an array of ZipEntry records
console.log(zipEntries)
	zipEntries.forEach((zipEntry) => {
console.log(zipEntry.toString()) // outputs zip entries information
	})
*/
	// extracts everything
	await zip.extractAllTo(orgDir+'/'+fname.substring(0,fname.length-5),true)
/*
      if (err){
        mainWindow.webContents.send('unzip-error', err)
console.log(err)
*/
}

function showProgress(msg,received,total){
  mainWindow.webContents.send(msg, JSON.stringify({received,total}))
}

function downloadImageFile(urlStr,addName,target,cb) {
  var received_bytes = 0
  var total_bytes = 0

  var req = request({
      method: 'GET',
      uri: urlStr
  })
  var tmpName = url.parse(urlStr).pathname
  var fileName = path.basename(tmpName)+addName+".jpg"
console.log(path.extname(tmpName))
console.log(target+'/'+fileName)
  fse.ensureDir(target)
  var out = fse.createWriteStream(target+'/'+fileName)
  req.pipe(out)
  req.on('response', data => {
      total_bytes = parseInt(data.headers['content-length' ])
  })

  req.on('data', chunk => {
      received_bytes += chunk.length
      showProgress('image-download-progress',received_bytes, total_bytes)
  })

  req.on('end', () => {
console.log('x/'+fileName)
    if (cb) cb()
  })
}

function readUrlFile(url,cb) {
  axios
    .get(url)
    .then(data => {
      if (cb) cb(data.data)
    })
    .catch(err => {
      console.log('Error happened during fetching!', err)
    })
}

function checkDownloadSuccess(url,cb) {
const fullUrl = "https://qombi.com/unsplashDownload?"
                  +"location="+url
                  +"&id="+curMachineId
  readUrlFile(fullUrl,(data) =>{
console.log(data)
console.log(url)
    if (cb) cb()
  })
}

function downloadImages(obj, target, cb) { // Downloads
  if ((obj!=null)&&(obj.urls!=null)) {
    downloadImageFile(obj.urls.regular,"-regular", target, () => {
      downloadImageFile(obj.urls.small,"-small", target, () => {
        downloadImageFile(obj.urls.thumb,"-thumb", target, () => {
          checkDownloadSuccess(obj.links.download_location,cb)
        })
      })
    })
  }
}

function downloadZipFile(url, target, fileName, cb) { // Downloads
  var received_bytes = 0
  var total_bytes = 0

  var req = request({
      method: 'GET',
      uri: url
  })

  var out = fse.createWriteStream(target+'/'+fileName)
  req.pipe(out)
  req.on('response', data => {
      total_bytes = parseInt(data.headers['content-length' ])
  })

  req.on('data', chunk => {
      received_bytes += chunk.length
      showProgress('download-progress',received_bytes, total_bytes)
  })

  req.on('end', () => {
    unzip(target+'/'+fileName, target, cb)
  })
}

function moveLBoxSharedDir(srcpath, cb) {
console.log(srcpath)
  fse.move(srcpath +"/LibraryBox/Shared",
            srcpath +"/LibraryBox/Content/Shared",
            { overwrite: true })
  .then(() => {
    if (cb) {
      cb()
    }
  })
  .catch(err => {
    console.error(err)
  })
}

function hasExt(urlStr,extStr) {
  const checkStr = path.extname(urlStr)
  return (checkStr.toUpperCase()===extStr.toUpperCase())
}


const scanner = SDK.createScanner({
  blockdevice: {
    get includeSystemDrives () {
//      return settings.get('unsafeMode')
      return {}
    }
  },
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let curDriveList
let curMachineId = machineIdSync()
let accessToken

const checkEnv = process.env.ELECTRON_START_URL || 'production'

function createWindow() {
  // Create the browser window.
  const opts = {show: false}
  mainWindow = new BrowserWindow({
                      width: 1200,
                      height: 680,
                      icon : "favicon.ico",
                			title : "ConnectBox Desktop Admin",
                      webPreferences: {
                        nodeIntegration: false,
                        allowEval: false,
                        preload:  path.join(__dirname, '/preload.js'),
                      }
                    })
  ipcMain.on('main-ready', () => {
    mainWindow.webContents.send('locale', app.getLocale())
    readUrlFile("https://qombi.com/getAccessToken?id="+curMachineId,(data) =>{
      accessToken = data
      mainWindow.webContents.send('proxy-connected',accessToken)
    })
  })
  ipcMain.on('stop-scan', () => {
    scanner.stop()
  })
  ipcMain.on('open-dev', () => {
    mainWindow.webContents.openDevTools()
  })
  ipcMain.on('open-ext-url', (event,url) => {
console.log(url)
    shell.openExternal(url)
  })
  ipcMain.on('open-host-profile-page', () => {
    shell.openExternal("https://register.qombi.com/?id="+accessToken)
  })
  ipcMain.on('open-new-window', (event, data) => {
    let pathname = data.replace(/^cbox:\//, '').replace(/^file:\//, '')
    let epub = undefined
    if (!hasExt(pathname,".htm")&&!hasExt(pathname,".html")) {
      const checkRegEx = /^(.*epub\/)(.*[^/]+\/)([^/]+)$/
      const matches = pathname.match(checkRegEx)
      if ((matches!=null)&&(matches.length>3)) {
        pathname = matches[1] + "index.html"
// Not sure how to detemine what to do here
// - at the moment this OEBPS/ filter solves one problem
// - probably needs to be improved later...
        epub = matches[2].replace(/OEBPS\//, '')
      }
    }
console.log(pathname)

    secondWindow = new BrowserWindow({
      width: 1000,
      height: 650,
      icon : "favicon.ico",
      title : "ConnectBox - Preview",
      webPreferences: {
        contextIsolation: true,
        allowEval: false,
        enableRemoteModule: false,
        nodeIntegration: false,
      }
    })
    secondWindow.loadURL(url.format({
      slashes: true,
      protocol: 'file:',
      pathname,
      query: {
        epub
      }
    }))
    secondWindow.on('closed', function () {
      mainWindow.webContents.send('second-window-closed')
      secondWindow = null
    })
  })
  const unzipList = async (obj) => {
    const { data } = obj
    const { curPath, fileList } = data
    const fileCount = fileList.length
    for (const [i, file] of fileList.entries()) {
console.log(curPath+'/'+file)
      await unzipAsync(curPath,file)
console.log(curPath+'/'+file)
      mainWindow.webContents.send('unzip-progress', JSON.stringify({i, fileCount}))
    }
    mainWindow.webContents.send('unzip-end')
    mainWindow.webContents.send('list-unzip-end',obj)
console.log("unzip-list all entries finished")
  }
  ipcMain.on('unzip-list', (event, obj) => {
    unzipList(obj)
  })
  ipcMain.on('download-to-usb', (event, data) => {
console.log("start download of cbox-static-latest.zip")
    downloadZipFile('https://storage.googleapis.com/www.qombibox.net/cbox-static-latest.zip', data, 'cbox-static-latest.zip', () => {
console.log("downloaded cbox-static-latest.zip")
    })
  })
  ipcMain.on('download-image', (event, obj) => {
console.log("start download of file")
    downloadImages(obj.image, obj.target, () => {
console.log("downloaded image file")
      mainWindow.webContents.send('download-end')
    })
  })
  ipcMain.on('download-epub-reader-to-usb', (event, data) => {
console.log("start download of readium-js-viewer-light.zip")
    downloadZipFile('https://storage.googleapis.com/www.qombibox.net/readium-js-viewer-light.zip', data, 'readium-js-viewer-light.zip', () => {
console.log("downloaded readium-js-viewer-light.zip")
    })
  })
  ipcMain.on('download-sample-to-usb', (event, data) => {
console.log("start download of cbox-sample-media.zip")
    downloadZipFile('https://storage.googleapis.com/www.qombibox.net/cbox-sample-media.zip', data, 'cbox-sample-media.zip', () => {
console.log("downloaded cbox-sample-media.zip")
      mainWindow.reload()
      scanner.start()
    })
  })
  ipcMain.on('download-all-to-usb', (event, data) => {
console.log("start download of cbox-static-latest.zip")
    downloadZipFile('https://storage.googleapis.com/www.qombibox.net/cbox-static-latest.zip', data, 'cbox-static-latest.zip', () => {
console.log("downloaded cbox-static-latest.zip")
      downloadZipFile('https://storage.googleapis.com/www.qombibox.net/cbox-sample-media.zip', data, 'cbox-sample-media.zip', () => {
console.log("downloaded cbox-sample-media.zip")
        mainWindow.reload()
        scanner.start()
      })
    })
  })
  ipcMain.on('connect-proxy', () => {
    readUrlFile("https://us-central1-qombi-media.cloudfunctions.net/getAccessToken?id="+curMachineId,(data) =>{
      accessToken = data
      mainWindow.webContents.send('proxy-connected',accessToken)
    })
  })

  ipcMain.on('reload', () => {
    mainWindow.reload()
    scanner.start()
  })
  ipcMain.on('move-from-librarybox', (event, data) => {
    moveLBoxSharedDir(data, () => {
// send confirmation - CircularProgress
console.log("moved Shared folder and tree")
    })
  })
  ipcMain.on('start-scan', () => {
console.log("start-scan")
console.log(checkEnv)
    curDriveList = undefined
    let dummyDrive = undefined
    if ((checkEnv!=='production')&&(process.platform==='linux')){
      dummyDrive = {
        displayName: "/dummy",
        description: "Dummy Test USB",
        size: 1,
        mountpoints: [{
          path: path.normalize(app.getAppPath()+"/../all-media")
        }]
      }
    }
    scanner.on('devices', (drives) => {
      if (drives!=null){
        const checkList = drives.filter(drive => {
          return ((drive!=null)
              &&(!drive.isSystem)
              &&(drive.mountpoints!=null)
              &&(drive.mountpoints.length>0))
        })
        if (dummyDrive!=null){
          checkList.push(dummyDrive)
        }
        if (!jsonEqual(checkList,curDriveList)){
console.log(JSON.stringify(checkList))
          mainWindow.webContents.send('drive-change', JSON.stringify(checkList))
        }
        curDriveList = checkList
      }
    })
    scanner.on('error', (error) => {
console.log(error)
      scanner.stop()
  //        return exceptionReporter.report(error)
    })
    scanner.start()
  })

  // and load the index.html of the app.
  const startUrl = process.env.ELECTRON_START_URL || url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    })
  mainWindow.loadURL(startUrl)
  // Open the DevTools.
  if (checkEnv!=='production'){
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
  })
}

protocols.register('cbox', protocols.basepath("/"))

let win = null
function window_open(path){
  const opts = {show: false}
  if (BrowserWindow.getFocusedWindow()) {
    current_win = BrowserWindow.getFocusedWindow()
    const pos = current_win.getPosition()
    Object.assign(opts, {
      x: pos[0] + 22,
      y: pos[1] + 22
    })
  }
  win = new BrowserWindow(opts)
  win.loadURL(path)
  win.once('ready-to-show', () => {win.show()})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
console.log("activate")
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})
