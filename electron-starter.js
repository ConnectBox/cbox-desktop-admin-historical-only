//handle setupevents as quickly as possible
/*
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
   // squirrel event handled and app will exit in 1000ms, so don't do anything else
   return;
}
*/

const {app, ipcMain, BrowserWindow, dialog} = require('electron')
const path = require('path');
const url = require('url');
const DecompressZip = require('decompress-zip');
const lodash = require('lodash');
const request = require('request');
const protocols = require('./electron-protocols');
const fse = require('fs-extra'); // "promisified" fs function calls
const SDK = require('./etcher-lib/sdk');

const jsonEqual = (a,b) => JSON.stringify(a) === JSON.stringify(b)

function unzip(file, target, cb) { // Unzips
  var out = new DecompressZip(file)

  out.on('error', function (err) {
    mainWindow.webContents.send('unzip-error', err)
  });
  out.on('extract', function (log) {
    mainWindow.webContents.send('unzip-end', log)
    if (cb){
      cb()
    }
  });
  out.on('progress', function (fileIndex, fileCount) {
    mainWindow.webContents.send('unzip-progress', JSON.stringify({fileIndex, fileCount}))
  });
  out.extract({
      path: target,
      filter: function (file) {
        return file.type !== "SymbolicLink";
      }
  });
}

function showProgress(received,total){
  mainWindow.webContents.send('download-progress', JSON.stringify({received,total}))
}

function downloadFile(url, target, fileName, cb) { // Downloads
  var received_bytes = 0;
  var total_bytes = 0;

  var req = request({
      method: 'GET',
      uri: url
  });

  var out = fse.createWriteStream(target+'/'+fileName);
  req.pipe(out);
  req.on('response', function ( data ) {
      total_bytes = parseInt(data.headers['content-length' ]);
  });

  req.on('data', function(chunk) {
      received_bytes += chunk.length;
      showProgress(received_bytes, total_bytes);
  });

  req.on('end', function() {
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
      cb();
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
let mainWindow;

let curDriveList;

const checkEnv = process.env.ELECTRON_START_URL || 'production';

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
                      width: 1200,
                      height: 680,
                      icon : "favicon.ico",
                			title : "ConnectBox Desktop Admin",
                      webPreferences: {
                        nodeIntegration: false,
                        preload:  path.join(__dirname, '/preload.js'),
                      }
                    });

  ipcMain.on('main-ready', () => {
    mainWindow.webContents.send('locale', app.getLocale())
  });
  ipcMain.on('stop-scan', () => {
    scanner.stop()
  });
  ipcMain.on('open-dev', () => {
    mainWindow.webContents.openDevTools();
  });
  ipcMain.on('open-new-window', (event, data) => {
    let pathname = data.replace(/^cbox:\//, '').replace(/^file:\//, '');
    let epub = undefined;
    if (!hasExt(pathname,".htm")&&!hasExt(pathname,".html")) {
      const checkRegEx = /^(.*epub\/)(.*[^/]+\/)([^/]+)$/;
      const matches = pathname.match(checkRegEx);
      if ((matches!=null)&&(matches.length>3)) {
        pathname = matches[1] + "index.html";
// Not sure how to detemine what to do here
// - at the moment this OEBPS/ filter solves one problem
// - probably needs to be improved later...
        epub = matches[2].replace(/OEBPS\//, '');
      }
    }
console.log(pathname)
    secondWindow = new BrowserWindow({
      width: 1000,
      height: 650,
      icon : "favicon.ico",
      title : "ConnectBox - Preview",
      webPreferences: {
        nodeIntegration: false,
      }
    });
    secondWindow.loadURL(url.format({
      slashes: true,
      protocol: 'file:',
      pathname,
      query: {
        epub
      }
    }));
    secondWindow.on('closed', function () {
      mainWindow.webContents.send('second-window-closed')
      secondWindow = null
    })
  });
  ipcMain.on('download-to-usb', (event, data) => {
console.log("start download of cbox-static-latest.zip")
    downloadFile('https://storage.googleapis.com/www.qombibox.net/cbox-static-latest.zip', data, 'cbox-static-latest.zip', () => {
console.log("downloaded cbox-static-latest.zip")
    });
  });
  ipcMain.on('download-sample-to-usb', (event, data) => {
console.log("start download of cbox-sample-media.zip")
    downloadFile('https://storage.googleapis.com/www.qombibox.net/cbox-sample-media.zip', data, 'cbox-sample-media.zip', () => {
console.log("downloaded cbox-sample-media.zip")
      mainWindow.reload()
      scanner.start()
    });
  });
  ipcMain.on('move-from-librarybox', (event, data) => {
    moveLBoxSharedDir(data, () => {
// send confirmation - CircularProgress
console.log("moved Shared folder and tree")
    });
  });
  ipcMain.on('start-scan', () => {
    curDriveList = undefined;
    let dummyDrive = undefined;
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
  });

  // and load the index.html of the app.
  const startUrl = process.env.ELECTRON_START_URL || url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    });
  mainWindow.loadURL(startUrl);
  // Open the DevTools.
  if (checkEnv!=='production'){
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
  })
}

protocols.register('cbox', protocols.basepath("/"));

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
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});
