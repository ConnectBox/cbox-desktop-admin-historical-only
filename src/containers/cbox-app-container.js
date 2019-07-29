import React, { createContext } from 'react'
import { isEmptyObj, isEmpty, pad,
          getLocalMediaFName } from '../utils/obj-functions'
import { getHostPathSep, getNormalizedPath,
          pathExistsAsync, readFileAsync,
            outputJsVarAsync, getLocale,
              curWindowSize, curContentSize } from '../utils/file-functions'
import { getIdFromItem, apiGetStorage, apiSetStorage,
          apiObjGetStorage, apiObjSetStorage } from "../utils/api"
import { loadingStateValue } from "../utils/config-data"
import CboxApp from '../components/cbox-app'
import { CboxContextProvider } from '../cbox-context'
import CboxDesktopAdminApp from '../components/cbox-desktop-admin-app'
import CboxLocationDialog from '../components/cbox-location-dialog'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import { withTranslation } from 'react-i18next'
import {chInBook} from '../naviChapters'
import { iso639_3b2 } from '../iso639-3b2'
import { unique } from 'shorthash'
import path from 'path'

const versionStr = '2.17'

const configDir = getHostPathSep() + "config" + getHostPathSep() + "mediaUI" + getHostPathSep()

const configPaths = {
  titleList: configDir+"cbox-titles.js",
  featuredTitles: configDir+"cbox-featured.js",
  langList: configDir+"cbox-lang.js",
  labelList: configDir+"cbox-label.js",
  myLang: configDir+"my-lang.js",
//  langText: configDir+"cbox-lang-text.js",
  channel: configDir+"channel.js",
//  settings: configDir+"settings.js",
}

function deleteProperty(obj, id) {
  return (({[id]: deleted, ...obj}) => obj)(obj)
}

class CboxAppContainer extends React.Component {
  state = {
    langList: [],
    titleList: [],
    labelList: [],
    myLang: [],
    featuredTitles: {},
    settings: {},
    channel: {},
    defaultLang: undefined,
    curPlay: undefined,
    curPos: 0,
    curDur: 0,
    cur: undefined,
    curView: undefined,
    lang: undefined,
    label: undefined,
    accessToken: undefined,
    usbList: [],
    usbPath: undefined,
    usbAltPath: undefined,
    usbHash: undefined,
    loadingState: loadingStateValue.init,
    installMissing: false,
    includeTestFiles: true,
    isDownloading: false,
    downloadingText: "",
    progressText: "",
    percentProgress: 0,
    size: "xs",
    orientation: undefined,
    width: this.calcWidth(),
    height: this.calcHeight(),
  }

  calcWidth() {
    let retVal = document.body.clientWidth || 600
    return retVal
  }

  calcHeight(){
    let retVal = document.body.clientHeight || 400
    return retVal
  }

  calcSize(){
    const width = this.calcWidth()
    const height = curContentSize()[1]

    const orientation = width > height ? "landscape" : "portrait"
    let size = "xs"
    if (width>=1200){
      size = "xl"
    } else if (width>=992){
      size = "lg"
    } else if (width>=768){
      size = "md"
    } else if (width>=576){
      size = "sm"
    }
    this.setState({height, width, size, orientation})
  }

  setLoadingState = (newState) => {
    this.setState({
      loadingState: newState,
    })
  }

  getAllConfig = async () => {
    const checkConfigPromises = Object.keys(configPaths).map(async checkKey => {
      let readObj = undefined
      if (isEmptyObj(this.state[checkKey])) {
        let readFName = getNormalizedPath(this.state.usbPath+configPaths[checkKey])
        const isFound = await pathExistsAsync(readFName)
        if (isFound){
          const tmpText = await readFileAsync(readFName, "utf8")
          // remove initial "js export variable declaration" -> "export var xxx = "
          readObj = JSON.parse(tmpText.match(/[\S\s]*?(["{[][\S\s]*)/)[1])
        }
console.log(readFName)
      }
console.log(checkKey)
console.log(readObj)
      return {configKey: checkKey, val: readObj}
    })
    this.setLoadingState(loadingStateValue.finishedOk)
    return Promise.all(checkConfigPromises)
  }

  saveConfigData = (confSection,constIdStr,obj) => {
    outputJsVarAsync(this.state.usbPath+confSection,constIdStr,obj)
    .catch(err => {
      console.error(err)
    })
  }

  findMediaObj = (list, validExt) => {
    return list.find((f,i)=>{
      let checkUrl = f.source
//      if (checkUrl==null){
//        checkUrl = f.SourceURL
//      }
      const checkExt = checkUrl.substr(checkUrl.lastIndexOf('.')+1,checkUrl.length)
      return (validExt.indexOf(checkExt)>=0)
    })
  }

  updateLangConfig = (stateCopy,updateLang,alsoUpdateMyLang) => {
    if (updateLang!=null){
      let doMyLangCheck = alsoUpdateMyLang
      if (isEmptyObj(stateCopy.langList)) {
        stateCopy.langList = [updateLang]
        doMyLangCheck = true
        this.saveConfigData(configPaths.langList,"languageList",stateCopy.langList)
      } else if (!stateCopy.langList.includes(updateLang)) {
        stateCopy.langList.push(updateLang)
        this.saveConfigData(configPaths.langList,"languageList",stateCopy.langList)
      }
      if (doMyLangCheck){
        if (isEmptyObj(stateCopy.myLang)) {
          stateCopy.myLang = [updateLang]
          this.saveConfigData(configPaths.myLang,"myLangList",stateCopy.myLang)
        } else if (!stateCopy.myLang.includes(updateLang)) {
          stateCopy.myLang.push(updateLang)
          this.saveConfigData(configPaths.myLang,"myLangList",stateCopy.myLang)
        }
      }
      this.setState(stateCopy)
    }
  }

  handleTranslations = async (pathList) => {
    const { usbPath } = this.state
    // update Translations here !!!
    if (pathList) {
      pathList.forEach((obj) => {
console.log(obj)
console.log(obj.tPath)
      })
      const curFName = getNormalizedPath(usbPath + "/location/data.en.properties")
console.log(curFName)
      const resStr = await readFileAsync(curFName, "utf8",)
//console.log(resStr)
    }
  }

  handleAddTitleUpdate = (valObj,isSelectedSerie) => {
console.log(valObj)
    if ((valObj!=null)
        && (valObj.title!=null)
        && (valObj.title.length>0)
        && (valObj.language!=null)
        && (valObj.language.length>0)){
      let titlesCopy = {...this.state.titleList}
      if (titlesCopy[valObj.language]==null){
        titlesCopy[valObj.language] = {}
      }
      titlesCopy[valObj.language][unique(valObj.title)] = valObj
      if (isSelectedSerie) {
        let copyObj = Object.assign(this.state)
        copyObj.titleList = titlesCopy
        this.updateLangConfig(copyObj,valObj.language,true)
        this.handleFeaturedTitlesUpdate(valObj,"add")
      } else {
        this.setState({titleList: titlesCopy})
      }
      this.saveConfigData(configPaths.titleList,"titleList",titlesCopy)
    }
  }

  getEpubList = async (orgHostPath,curPath,list) => {
    const retList = []
    for (const item of list) {
      const fname = path.basename(item.filename)
      const idPath = fname.substring(0,fname.length-5) +getHostPathSep()
      const checkMetaFile = orgHostPath +getHostPathSep() +idPath
                            +"META-INF" +getHostPathSep() +"container.xml"
      const tmpText = await readFileAsync(checkMetaFile, "utf8")
      const findRegEx = /full-path="(.*content.opf)"/
      const match = findRegEx.exec(tmpText)
      retList.push({
        ...item,
        filename: curPath +getHostPathSep() +idPath +match[1]
      })
    }
    return retList
  }

  getEpubAdaptedList = async (obj) => {
    const { data,valObj,isSelectedSerie } = obj
    const { fileList } = valObj
    const newList = await this.getEpubList(data.curPath,valObj.curPath,fileList)
    const valObjCopy = {
      ...valObj,
      fileList: newList,
      unzipped: true
    }
    this.handleAddTitleUpdate(valObjCopy,isSelectedSerie)
  }

  handleConfig = async () => {
    const allConfigArr = await this.getAllConfig()
    let allConfigObj = allConfigArr.reduce((obj, item) => {
      obj[item.configKey] = item.val
      return obj
    }, {})
    this.updateLangConfig(allConfigObj,this.state.defaultLang,false)
    if (this.state.channel) this.handleTranslations(this.state.channel.tPathList)
  }

  handleCheckUsbContent = async () => {
    const {usbPath} = this.state
    const libraryBoxPath = getHostPathSep() + "LibraryBox" + getHostPathSep()
                            + "Content" + getHostPathSep()
    const checkAltPathFName = getNormalizedPath(usbPath + libraryBoxPath)
    const checkInstallPath = getHostPathSep() + "static" + getHostPathSep()
                            + "js" + getHostPathSep()
    const checkInstallFName = getNormalizedPath(usbPath + checkInstallPath)
    const isAltPathFound = await pathExistsAsync(checkAltPathFName)
    const installFound = await pathExistsAsync(checkInstallFName)
    if (isAltPathFound){
console.log(libraryBoxPath)
console.log(checkAltPathFName)
      this.setState({usbAltPath: libraryBoxPath})
    } else {
      if (!installFound) {
        this.setState({installMissing: true})
      }
      setTimeout(() => {this.handleConfig()}, 0)
    }
  }

  handleSaveChannel = (key, val, doEncode) => {
    let { channel } = this.state
    if (channel==null) {
      channel = {}
    }
    const checkEncode = doEncode && (val!=null)
    channel[key] = checkEncode ? JSON.stringify(val) : val
    this.setState({channel})
    this.saveConfigData(configPaths.channel,"channel",channel)
  }

  subscribeToIpc = (onDetect) => {
    const {t} = this.props
    window.ipcRendererOn('locale',(event, value) => {
      let lang = "eng" // Default
      if ((value!=null)&&(value.length>=2)){
        lang = iso639_3b2[value.substr(0,2)]
        if (lang==null){
          lang="eng" // Default
        }
      }
      this.setState({defaultLang: lang})
    })

    window.ipcRendererOn('proxy-connected',(event, value) => {
      this.setState({accessToken: value})
    })

    window.ipcRendererOn('drive-change',(event, jsonList) => {
      const usbList = JSON.parse(jsonList)
      if (!isEmpty(usbList)&&(usbList.length>0)){
        this.setState({usbList})
      } else {
        this.setState({usbList: undefined})
      }
    })

    window.ipcRendererOn('unzip-error',(event, value) => {
console.log(value)
      this.setState({
        downloadingText: "",
        progressText: t("unzipError") +value,
      })
    })

    window.ipcRendererOn('unzip-end',(event, value) => {
      this.setState({
        isDownloading: false,
        downloadingText: "",
        progressText: "",
        percentProgress: 0,
      })
console.log(value)
    })

    window.ipcRendererOn('list-unzip-end',(event, obj) => {
      this.getEpubAdaptedList(obj)
    })

    window.ipcRendererOn('unzip-progress',(event, jsonObj) => {
      const obj = JSON.parse(jsonObj)
      const { fileIndex, fileCount } = obj
      const percentProgress = (fileIndex * 100) / fileCount
      this.setState({
        isDownloading: true,
        downloadingText: t("unzipping"),
        progressText: fileIndex + " / " + fileCount,
        percentProgress
      })
    })

    window.ipcRendererOn('download-progress',(event, jsonObj) => {
      const obj = JSON.parse(jsonObj)
      const { received, total } = obj
      const percentProgress = (received * 100) / total
      const receivedMB = (received / 1000000).toFixed(2)
      const totalMB = (total / 1000000).toFixed(2)
      this.setState({
        isDownloading: true,
        downloadingText: t("downloading"),
        progressText: receivedMB + " / " + totalMB + " Mbyte",
        percentProgress
      })
    })

    window.ipcRendererSend('main-ready',{})
    window.ipcRendererSend('start-scan',{})
  }

  handleIncludeTestFileUpdate = async () => {
    const includeTestFiles = await apiGetStorage("global","includeTestFiles")
console.log(includeTestFiles)
    if (includeTestFiles!=null){
      this.setState({includeTestFiles})
    }
  }

  componentDidMount = () => {
console.log(getLocale())
    this.handleIncludeTestFileUpdate()
    this.subscribeToIpc((retVal) => console.log(retVal))
    this.calcSize()
    window.addEventListener('resize', () => {
      this.calcSize()
    }, false)
  }

  handleSelectLocation = (selectionStr) => {
console.log(selectionStr)
    let usbPath = this.state.usbPath
    if (selectionStr.length>1){ // This is the LibraryBox location
      usbPath = getNormalizedPath(this.state.usbPath + this.state.usbAltPath)
    }
    this.setState({
      usbAltPath: undefined,
      usbPath,
      usbHash: usbPath,
    })
    window.setOrgPath(usbPath)
    setTimeout(() => {this.handleConfig()}, 0)
  }

  handleSelectPath = (usbPath) => {
console.log(usbPath)
    this.setState({
      usbPath,
      usbHash: usbPath,
    })
    window.setOrgPath(usbPath)
    window.ipcRendererSend('stop-scan',{})
    setTimeout(() => {this.handleCheckUsbContent()}, 0)
  }

  handleMyLangUpdate = (myLang) => {
console.log(myLang)
    this.setState({myLang})
    this.saveConfigData(configPaths.myLang,"myLangList",myLang)
  }

  handleAddLang = (addLang) => {
    let { langList } = this.state
    if (langList.indexOf(addLang)<0) {
      langList.push(addLang)
      this.setState({langList})
      this.saveConfigData(configPaths.langList,"languageList",langList)
    }
  }

  handleAddLabel = (addLabel) => {
    let { labelList } = this.state
    if (labelList==null) {
      labelList = []
    }
    if (labelList.indexOf(addLabel)<0) {
      labelList.push(addLabel)
      this.setState({labelList})
      this.saveConfigData(configPaths.labelList,"labelList",labelList)
    }
  }

  handleLangUpdate = (langList) => {
console.log(langList)
    this.setState({langList})
    this.saveConfigData(configPaths.langList,"languageList",langList)
  }

  handleDeleteTitle = (obj) => {
    if ((obj!=null)
        && (obj.title!=null)
        && (obj.title.length>0)
        && (obj.language!=null)
        && (obj.language.length>0)){
      let titlesCopy = {...this.state.titleList}
      const curIdStr = unique(obj.title)
      const langTitlesCopy = deleteProperty(titlesCopy[obj.language],curIdStr)
      titlesCopy[obj.language] = langTitlesCopy
console.log(obj)
console.log(titlesCopy)
console.log(langTitlesCopy)
      this.handleFeaturedTitlesUpdate(obj,"delete")
      this.setState({titleList: titlesCopy})
      this.saveConfigData(configPaths.titleList,"titleList",titlesCopy)
    }
  }

  handleAddTitle = (valObj,isSelectedSerie,data) => {
console.log(valObj)
    if (data==null) this.handleAddTitleUpdate(valObj,isSelectedSerie)
    else { // i. e. epub data - need to unzip and then adapt paths
      window.ipcRendererSend('unzip-list',{
        valObj,
        isSelectedSerie,
        data
      })
    }
  }

  handleFeaturedTitlesUpdate = (item,action) => {
    const {featuredTitles,myLang} = this.state
    if (item!=null){
      if ((item.language!=null)
          && (myLang!=null)
          && (myLang.indexOf(item.language)>=0)){
        const checkID = getIdFromItem(item)
        let copyTitles = featuredTitles
        if (copyTitles==null){
          copyTitles = {}
        }
        if (action==="delete"){
          copyTitles[item.language] = copyTitles[item.language].filter(e => e !== checkID)
          this.setState({featuredTitles: copyTitles})
          this.saveConfigData(configPaths.featuredTitles,"cbox-featured",copyTitles)
        } else if (action==="add"){
          if (copyTitles[item.language]==null){
            copyTitles[item.language]=[]
          }
          if (!copyTitles[item.language].includes(checkID)){
            copyTitles[item.language].push(checkID)
          }
          this.setState({featuredTitles: copyTitles})
          this.saveConfigData(configPaths.featuredTitles,"cbox-featured",copyTitles)
        }
      }
    }
  }

  handleMediaPlaying = (cur) => {
      const curPos = Math.floor(cur.position / 1000)
      const curDur = Math.floor(cur.duration / 1000)
      if ((this.state.curPos !== curPos) || (this.props.curDur !== curDur)) {
        this.setState({curPos, curDur, cur})
      }
  }

  handlePlayNext = () => {
console.log("playNext")
    const {usbHash,curPlay} = this.state
    const {curSerie, curEp, bibleObj} = curPlay
    if (curSerie.mediaType==="bible"){
      let newPlayObj
      if (curEp.id<chInBook[curEp.bk]){
        const newEp = {...curEp,id: curEp.id+1 }
        const newBibleObj = {...bibleObj,id: bibleObj.id+1 }
        newPlayObj = {...this.state.curPlay, curEp: newEp, bibleObj: newBibleObj}
      } else if (curEp.bk!=="Rev") {
// ToDo
      }
      this.setState({curPlay: newPlayObj, cur: undefined})
    } else if ((curSerie.fileList!=null) && (curSerie.fileList.length>0)
        && (curEp!=null)){
      // This serie has episodes
      let epInx = curEp.id
      epInx+=1
      let newPlayObj = {curSerie}
      apiObjSetStorage(usbHash,newPlayObj,"curEp",epInx)
      if (curSerie.fileList[epInx]!=null){
        newPlayObj.curEp=curSerie.fileList[epInx]
      }
      this.setState({curPlay: newPlayObj, cur: undefined})
    }
  }

  handleStartPlay = (inx,curSerie,curEp,isBibleClose) => {
    const {usbHash,usbPath} = this.state
    if (curSerie==null){ // stop playing
      let newPlayObj
      if (isBibleClose) {
        newPlayObj = {...this.state.curPlay}
        newPlayObj.curEp = undefined
        newPlayObj.bibleObj = undefined
      }
      this.setState({curPlay: newPlayObj})
    } else {
      const epubFound = ((curSerie!=null)&&(curSerie.mediaType==="epub"))
      const htmlFound = ((curSerie!=null)&&(curSerie.mediaType==="html"))
      const bibleEpFound = ((curEp!=null)&&(curEp.bibleType))
      if (htmlFound) {
        if ((curSerie.fileList!=null) && (curSerie.fileList.length>0)){
          const tmpEp = curSerie.fileList[0]
          window.ipcRendererSend('open-new-window',
                                  getLocalMediaFName(usbPath,tmpEp.filename))
        }
      } else if (epubFound) {
        if (curEp!=null) {
          let newPlayObj = {curSerie}
          this.setState({curPlay: newPlayObj})
          apiObjSetStorage(usbHash,{curSerie},"curEp",curEp.id)
          window.ipcRendererSend('open-new-window',
                                getLocalMediaFName(usbPath,curEp.filename))
        } else if ((curSerie.fileList!=null) && (curSerie.fileList.length>0)) {
          let newPlayObj = {curSerie}
          let tmpEp = curSerie.fileList[0]
          apiObjGetStorage(usbHash,newPlayObj,"curEp").then((value) => {
            if ((value==null)||(curSerie.fileList[value]==null)){
              value=0
              apiObjSetStorage(usbHash,newPlayObj,"curEp",0)
            }
            if (curSerie.fileList[value]!=null){
              newPlayObj.curEp=curSerie.fileList[value]
              tmpEp=curSerie.fileList[value]
            }
            this.setState({curPlay: newPlayObj})
            window.ipcRendererSend('open-new-window',
                                    getLocalMediaFName(usbPath,tmpEp.filename))

          }).catch((err) => {
            console.error(err)
          })
        }
      }
      if (!bibleEpFound && ((curSerie.fileList==null) || (curSerie.fileList.length<=0))){
        // No episodes
        this.setState({curPlay: {curSerie}})
      } else {
        // This serie has episodes
        let newPlayObj = {curSerie,curEp}
        if (bibleEpFound){
          newPlayObj.bibleObj = {...curEp}
        }
        if (curEp!=null){
          this.setState({curPlay: newPlayObj})
          apiObjSetStorage(usbHash,{curSerie},"curEp",curEp.id)
        } else {
          apiObjGetStorage(usbHash,newPlayObj,"curEp").then((value) => {
            if ((value==null)||(curSerie.fileList[value]==null)){
              value=0
              apiObjSetStorage(usbHash,newPlayObj,"curEp",0)
            }
            if (curSerie.fileList[value]!=null){
              newPlayObj.curEp=curSerie.fileList[value]
            }
            this.setState({curPlay: newPlayObj})
          }).catch((err) => {
            console.error(err)
          })
        }
      }
    }
  }

  handleSelectView = (curView) => {
    this.setState({curView})
  }

  handleSelectLang = (lang) => {
    this.setState({lang})
  }

  handleSelectLabel = (label) => {
    this.setState({label})
  }

  handleInstall = () => {
    const {channel,usbPath} = this.state
    if (!channel && this.state.includeTestFiles) {
      window.ipcRendererSend('download-all-to-usb',usbPath)
    } else {
      window.ipcRendererSend('download-to-usb',usbPath)
    }
    this.setState({installMissing: false})
  }

  handleCancelInstall = () => {
console.log("cancel")
    this.setState({installMissing: false})
  }

  handleIncludeTestFiles  = async (ev,isChecked) => {
console.log(isChecked)
    this.setState({includeTestFiles: isChecked})
    await apiSetStorage("global","includeTestFiles",isChecked)
  }

  render() {
    const {t} = this.props
    const { usbPath, usbHash, usbList, loadingState, installMissing, includeTestFiles,
            featuredTitles, myLang, curView, curPlay, cur, lang, label, width, height,
            size, defaultLang, titleList, langList, labelList, channel, settings,
            isDownloading, downloadingText, progressText, percentProgress } = this.state
    if (this.state.usbAltPath!=null){
      const locList = [
        {
          name: t("root"),
          path: "/",
        },
        {
          name: "LibraryBox",
          path: "/LibraryBox/Content/",
        }
      ]
      return (
        <CboxLocationDialog
          loadingState={loadingState}
          locationList={locList}
          settings={settings}
          usbPath={usbPath}
          onSelectPath={this.handleSelectLocation}
        />)
    } else if (this.state.usbPath==null){
      return (
        <CboxDesktopAdminApp
          loadingState={loadingState}
          usbList={usbList}
          settings={settings}
          versionStr={versionStr}
          onSelectPath={this.handleSelectPath}
        />)
    } else if (installMissing) {
      return (
        <Dialog
          open={true}
          disableBackdropClick
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <Typography type="title">{t("installOnUSB")}: {usbPath}</Typography>
            {!channel && (<FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={includeTestFiles}
                    onChange={(e, checked) => this.handleIncludeTestFiles(e, checked)}
                    value="includeTestFiles"
                  />
                }
                label={t("includeTest")}
              />
            </FormGroup>)}
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="contained"
              onClick={this.handleCancelInstall}
            >
              {t("cancel")}
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={this.handleInstall}>
              {t("ok")}
            </Button>
          </DialogActions>
        </Dialog>)
    } else if (isDownloading) {
      return (
        <Dialog
          open={true}
          disableBackdropClick
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <Typography type="title">{downloadingText}</Typography>
            {(percentProgress>=0) && (<div>
              {progressText}
              <LinearProgress
                variant="determinate"
                value={percentProgress}
              />
            </div>)}
          </DialogContent>
        </Dialog>)
    } else {
      let scope = {
        ...this.state,
        titles: this.state.titleList,
        languages: this.state.langList,
        labels: this.state.labelList,
        curPos: this.state.cur,
      }

      return (
        <CboxContextProvider scope={scope} >
          <CboxApp
            loadingState={loadingState}
            usbPath={usbPath}
            usbHash={usbHash}
            titles={titleList}
            languages={langList}
            labels={labelList}
            defaultLang={defaultLang}
            featuredTitles={featuredTitles}
            myLang={myLang}
            curView={curView}
            curPlay={curPlay}
            curPos={cur}
            lang={lang}
            label={label}
            size={size}
            width={width}
            height={height}
            settings={settings}
            versionStr={versionStr}
            channel={channel}
            onAddLang={this.handleAddLang}
            onAddLabel={this.handleAddLabel}
            onLangUpdate={this.handleLangUpdate}
            onMyLangUpdate={this.handleMyLangUpdate}
            onTitlesUpdate={this.handleFeaturedTitlesUpdate}
            onChannelTitleUpdate={(val) => this.handleSaveChannel("title",val)}
            onTranslationUpdate={(val) => this.handleSaveChannel("tPathList",val)}
            onPageLayoutUpdate={(val) => this.handleSaveChannel("pageLayout",val)}
            onAddTitle={this.handleAddTitle}
            onDeleteTitle={this.handleDeleteTitle}
            onSaveCode={(code) => this.handleSaveChannel("code",code,true)}
            onPlaying={this.handleMediaPlaying}
            onPlayNext={this.handlePlayNext}
            onStartPlay={this.handleStartPlay}
            onSelectView={this.handleSelectView}
            onSelectLang={this.handleSelectLang}
            onSelectLabel={this.handleSelectLabel}
          />
        </CboxContextProvider>)
    }
  }
}

export default withTranslation()(CboxAppContainer)
