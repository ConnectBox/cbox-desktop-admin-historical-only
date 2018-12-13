import React from 'react';
import { isEmptyObj, isEmpty,
          getLocalMediaFName } from '../utils/obj-functions';
import { getHostPathSep, getNormalizedPath,
          pathExistsAsync, readFileAsync,
            outputJsVarAsync, getLocale } from '../utils/file-functions';
import { getIdFromItem,
          apiObjGetStorage, apiObjSetStorage } from "../utils/api";
import { loadingStateValue } from "../utils/config-data";
import CboxApp from '../components/cbox-app';
import CboxDesktopAdminApp from '../components/cbox-desktop-admin-app';
import CboxLocationDialog from '../components/cbox-location-dialog';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withNamespaces } from 'react-i18next';
import { iso639_3b2 } from '../iso639-3b2';
import { unique } from 'shorthash';
//import localforage from 'localforage';

const configDir = getHostPathSep() + "config" + getHostPathSep() + "mediaUI" + getHostPathSep();

const configPaths = {
  titleList: configDir+"cbox-titles.js",
  featuredTitles: configDir+"cbox-featured.js",
  langList: configDir+"cbox-lang.js",
  myLang: configDir+"my-lang.js",
//  langText: configDir+"cbox-lang-text.js",
  channel: configDir+"channel.js",
//  settings: configDir+"settings.js",
}

function deleteProperty(obj, id) {
  return (({[id]: deleted, ...obj}) => obj)(obj);
}

class CboxAppContainer extends React.Component {
  state = {
    langList: [],
    titleList: [],
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
    usbList: [],
    usbPath: undefined,
    usbAltPath: undefined,
    usbHash: undefined,
    loadingState: loadingStateValue.finishedOk,
    isDownloading: false,
    downloadingText: "",
    progressText: "",
    percentProgress: 0,
  }

  getAllConfig = async () => {
    const checkConfigPromises = Object.keys(configPaths).map(async checkKey => {
      let readObj = undefined;
      if (isEmptyObj(this.state[checkKey])) {
        let readFName = getNormalizedPath(this.state.usbPath+configPaths[checkKey]);
        const isFound = await pathExistsAsync(readFName)
        if (isFound){
          const tmpText = await readFileAsync(readFName, "utf8");
          // remove initial "js export variable declaration" -> "export var xxx = "
          readObj = JSON.parse(tmpText.match(/[\S\s]*?(["{[][\S\s]*)/)[1])
        }
console.log(readFName)
      }
console.log(checkKey)
console.log(readObj)
      return {configKey: checkKey, val: readObj}
    });
    return Promise.all(checkConfigPromises);
  }

  setLoadingState = (newState) => {
    this.setState({
      loadingState: newState,
    });
  }

  saveConfigData = (confSection,constIdStr,obj) => {
    outputJsVarAsync(this.state.usbPath+confSection,constIdStr,obj)
    .catch(err => {
      console.error(err)
    })
  }

  findMediaObj = (list, validExt) => {
    return list.find((f,i)=>{
      let checkUrl = f.source;
//      if (checkUrl==null){
//        checkUrl = f.SourceURL;
//      }
      const checkExt = checkUrl.substr(checkUrl.lastIndexOf('.')+1,checkUrl.length);
      return (validExt.indexOf(checkExt)>=0);
    })
  }

  updateLangConfig = (stateCopy,updateLang,alsoUpdateMyLang) => {
    if (updateLang!=null){
      let doMyLangCheck = alsoUpdateMyLang;
      if (isEmptyObj(stateCopy.langList)) {
        stateCopy.langList = [updateLang];
        doMyLangCheck = true;
        this.saveConfigData(configPaths.langList,"languageList",stateCopy.langList)
      } else if (!stateCopy.langList.includes(updateLang)) {
        stateCopy.langList.push(updateLang);
        this.saveConfigData(configPaths.langList,"languageList",stateCopy.langList)
      }
      if (doMyLangCheck){
        if (isEmptyObj(stateCopy.myLang)) {
          stateCopy.myLang = [updateLang];
          this.saveConfigData(configPaths.myLang,"myLangList",stateCopy.myLang)
        } else if (!stateCopy.myLang.includes(updateLang)) {
          stateCopy.myLang.push(updateLang);
          this.saveConfigData(configPaths.myLang,"myLangList",stateCopy.myLang)
        }
      }
      this.setState(stateCopy)
    }
  }

  handleConfig = async () => {
    const allConfigArr = await this.getAllConfig();
    let allConfigObj = allConfigArr.reduce((obj, item) => {
      obj[item.configKey] = item.val
      return obj
    }, {});
    this.updateLangConfig(allConfigObj,this.state.defaultLang,false);
  }

  handleCheckAltPath = async () => {
    const libraryBoxPath = getHostPathSep() + "LibraryBox" + getHostPathSep()
                            + "Content" + getHostPathSep();
    const checkFName = getNormalizedPath(this.state.usbPath + libraryBoxPath);
    const isFound = await pathExistsAsync(checkFName)
    if (isFound){
console.log(libraryBoxPath)
console.log(checkFName)
      this.setState({usbAltPath: libraryBoxPath})
    } else {
      setTimeout(() => {this.handleConfig()}, 0);
    }
  }

  subscribeToIpc = (onDetect) => {
    const {t} = this.props;
    window.ipcRendererOnLocale((event, value) => {
      let lang = "eng"; // Default
      if ((value!=null)&&(value.length>=2)){
        lang = iso639_3b2[value.substr(0,2)];
        if (lang==null){
          lang="eng" // Default
        }
      }
      this.setState({defaultLang: lang})
    });

    window.ipcRendererOnDriveChange((event, jsonList) => {
      const usbList = JSON.parse(jsonList);
      if (!isEmpty(usbList)&&(usbList.length>0)){
        this.setState({usbList})
      } else {
        this.setState({usbList: undefined})
      }
    })

    window.ipcRendererOnUnzipError((event, value) => {
console.log(value);
      this.setState({
        downloadingText: "",
        progressText: t("unzipError") +value,
      })
    })

    window.ipcRendererOnUnzipEnd((event, value) => {
      this.setState({
        isDownloading: false,
        downloadingText: "",
        progressText: "",
        percentProgress: 0,
      })
console.log(value);
    })

    window.ipcRendererOnUnzipProgress((event, jsonObj) => {
      const obj = JSON.parse(jsonObj);
      const { fileIndex, fileCount } = obj;
      const percentProgress = (fileIndex * 100) / fileCount;
      this.setState({
        isDownloading: true,
        downloadingText: t("unzipping"),
        progressText: fileIndex + " / " + fileCount,
        percentProgress
      })
    })

    window.ipcRendererOnDownloadProgress((event, jsonObj) => {
      const obj = JSON.parse(jsonObj);
      const { received, total } = obj;
      const percentProgress = (received * 100) / total;
      const receivedMB = (received / 1000000).toFixed(2);
      const totalMB = (total / 1000000).toFixed(2);
      this.setState({
        isDownloading: true,
        downloadingText: t("downloading"),
        progressText: receivedMB + " / " + totalMB + " Mbyte",
        percentProgress
      })
    })

    window.ipcRendererSend('main-ready',{});
    window.ipcRendererSend('start-scan',{});
  }

  componentDidMount = () => {
console.log(getLocale())

    this.subscribeToIpc((retVal) => console.log(retVal))
  }

  handleSelectLocation = (selectionStr) => {
console.log(selectionStr)
    let usbPath = this.state.usbPath;
    if (selectionStr.length>1){ // This is the LibraryBox location
      usbPath = getNormalizedPath(this.state.usbPath + this.state.usbAltPath);
    }
    this.setState({
      usbAltPath: undefined,
      usbPath,
      usbHash: usbPath,
    })
    window.setOrgPath(usbPath)
    setTimeout(() => {this.handleConfig()}, 0);
  }

  handleSelectPath = (usbPath) => {
console.log(usbPath)
    this.setState({
      usbPath,
      usbHash: usbPath,
    })
    window.setOrgPath(usbPath)
    window.ipcRendererSend('stop-scan',{});
    setTimeout(() => {this.handleCheckAltPath()}, 0);
  }

  handleMyLangUpdate = (myLang) => {
console.log(myLang)
    this.setState({myLang});
    this.saveConfigData(configPaths.myLang,"myLangList",myLang)
  }

  handleLangUpdate = (langList) => {
console.log(langList)
    this.setState({langList});
    this.saveConfigData(configPaths.langList,"languageList",langList)
  }

  handleChannelUpdate = (channel) => {
    this.setState({channel});
    this.saveConfigData(configPaths.channel,"channel",channel)
  }

  handleDeleteTitle = (obj) => {
    if ((obj!=null)
        && (obj.title!=null)
        && (obj.title.length>0)
        && (obj.language!=null)
        && (obj.language.length>0)){
      let titlesCopy = {...this.state.titleList};
      const curIdStr = unique(obj.title)
      const langTitlesCopy = deleteProperty(titlesCopy[obj.language],curIdStr)
      titlesCopy[obj.language] = langTitlesCopy;
console.log(obj)
console.log(titlesCopy)
console.log(langTitlesCopy)
      this.handleFeaturedTitlesUpdate(obj,"delete")
      this.setState({titleList: titlesCopy});
      this.saveConfigData(configPaths.titleList,"titleList",titlesCopy)
    }
  }

  handleAddTitle = (valObj,isSelectedSerie) => {
    if ((valObj!=null)
        && (valObj.title!=null)
        && (valObj.title.length>0)
        && (valObj.language!=null)
        && (valObj.language.length>0)){
      let titlesCopy = {...this.state.titleList};
      if (titlesCopy[valObj.language]==null){
        titlesCopy[valObj.language] = {}
      }
      titlesCopy[valObj.language][unique(valObj.title)] = valObj;
      if (isSelectedSerie) {
        let copyObj = Object.assign(this.state);
        copyObj.titleList = titlesCopy;
        this.updateLangConfig(copyObj,valObj.language,true)
        this.handleFeaturedTitlesUpdate(valObj,"add")
      } else {
        this.setState({titleList: titlesCopy});
      }
console.log(titlesCopy)
      this.saveConfigData(configPaths.titleList,"titleList",titlesCopy)
    }
  };

  handleFeaturedTitlesUpdate = (item,action) => {
    const {featuredTitles,myLang} = this.state;
    if (item!=null){
      if ((item.language!=null)
          && (myLang!=null)
          && (myLang.indexOf(item.language)>=0)){
        const checkID = getIdFromItem(item);
        let copyTitles = featuredTitles;
        if (copyTitles==null){
          copyTitles = {}
        }
        if (action==="delete"){
          copyTitles[item.language] = copyTitles[item.language].filter(e => e !== checkID);
          this.setState({featuredTitles: copyTitles});
          this.saveConfigData(configPaths.featuredTitles,"cbox-featured",copyTitles)
        } else if (action==="add"){
          if (copyTitles[item.language]==null){
            copyTitles[item.language]=[];
          }
          copyTitles[item.language].push(checkID);
          this.setState({featuredTitles: copyTitles});
          this.saveConfigData(configPaths.featuredTitles,"cbox-featured",copyTitles)
        }
      }
    }
  }

  handleMediaPlaying = (cur) => {
      const curPos = Math.floor(cur.position / 1000);
      const curDur = Math.floor(cur.duration / 1000);
      if ((this.state.curPos !== curPos) || (this.props.curDur !== curDur)) {
        this.setState({curPos, curDur, cur});
      }
  }

  handlePlayNext = () => {
console.log("playNext")
    const {usbHash,curPlay} = this.state;
    const {curSerie, curEp} = curPlay;
    if ((curSerie.fileList!=null) && (curSerie.fileList.length>0)
        && (curEp!=null)){
      // This serie has episodes
      let epInx = curEp.id;
      epInx+=1;
      let newPlayObj = {curSerie};
      apiObjSetStorage(usbHash,newPlayObj,"curEp",epInx);
      if (curSerie.fileList[epInx]!=null){
        newPlayObj.curEp=curSerie.fileList[epInx];
      }
      this.setState({curPlay: newPlayObj, cur: undefined})
    }
  }

  handleStartPlay = (inx,curSerie,curEp) => {
    const {usbHash,usbPath} = this.state;
    if (curSerie==null){ // stop playing
      this.setState({curPlay: undefined})
    } else {
      const epubFound = ((curSerie!=null)&&(curSerie.mediaType==="epub"));
      const htmlFound = ((curSerie!=null)&&(curSerie.mediaType==="html"));
      if (htmlFound || epubFound) {
        if ((curSerie.fileList!=null) && (curSerie.fileList.length>0)){
          const tmpEp = curSerie.fileList[0];
console.log(tmpEp.filename)
          window.ipcRendererSend('open-new-window',
                                  getLocalMediaFName(usbPath,tmpEp.filename));
        }
      }
      let newPlayObj = {curSerie,curEp};
      if ((curSerie.fileList==null) || (curSerie.fileList.length<=0)){
        // No episodes
        this.setState({curPlay: newPlayObj})
      } else {
        // This serie has episodes
        if (curEp!=null){
          this.setState({curPlay: newPlayObj})
          apiObjSetStorage(usbHash,{curSerie},"curEp",curEp.id);
        } else {
          apiObjGetStorage(usbHash,newPlayObj,"curEp").then((value) => {
            if ((value==null)||(curSerie.fileList[value]==null)){
              value=0;
              apiObjSetStorage(usbHash,newPlayObj,"curEp",0);
            }
            if (curSerie.fileList[value]!=null){
              newPlayObj.curEp=curSerie.fileList[value];
            }
            this.setState({curPlay: newPlayObj})
          }).catch((err) => {
            console.error(err);
          });
        }
      }
    }
  }

  handleSelectView = (curView) => {
    this.setState({curView});
  }

  render() {
    const {t} = this.props;
    const { usbPath, usbHash, usbList, loadingState,
            featuredTitles, myLang, curView, curPlay, cur,
            defaultLang, titleList, langList, channel, settings,
            isDownloading, downloadingText, progressText, percentProgress } = this.state;
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
      ];
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
          onSelectPath={this.handleSelectPath}
        />)
    } else if (isDownloading) {
      return (
        <Dialog
          open={true}
          disableBackdropClick
          onClose={this.handleClose}
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
      return (
        <CboxApp
          loadingState={loadingState}
          usbPath={usbPath}
          usbHash={usbHash}
          titles={titleList}
          languages={langList}
          defaultLang={defaultLang}
          featuredTitles={featuredTitles}
          myLang={myLang}
          curView={curView}
          curPlay={curPlay}
          curPos={cur}
          settings={settings}
          channel={channel}
          onLangUpdate={this.handleLangUpdate}
          onMyLangUpdate={this.handleMyLangUpdate}
          onFeaturedTitlesUpdate={this.handleFeaturedTitlesUpdate}
          onChannelUpdate={this.handleChannelUpdate}
          onAddTitle={this.handleAddTitle}
          onDeleteTitle={this.handleDeleteTitle}
          onPlaying={this.handleMediaPlaying}
          onPlayNext={this.handlePlayNext}
          onStartPlay={this.handleStartPlay}
          onSelectView={this.handleSelectView}
        />)
    }
  }
}

export default withNamespaces()(CboxAppContainer);
