import React from 'react';
import { isEmptyObj, isEmpty } from '../utils/obj-functions';
import { getHostPathSep, getNormalizedPath,
          pathExistsAsync, readFileAsync,
          outputJsVarAsync } from '../utils/file-functions';
import { getIdFromItem,
          apiObjGetStorage, apiObjSetStorage } from "../utils/api";
import { loadingStateValue } from "../utils/config-data";
import CboxApp from '../components/cbox-app';
import CboxDesktopAdminApp from '../components/cbox-desktop-admin-app';
import { iso639_3b2 } from '../iso639-3b2';
import { unique } from 'shorthash';
//import localforage from 'localforage';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const configDir = getHostPathSep() + "config" + getHostPathSep() + "mediaUI" + getHostPathSep();

const configPaths = {
  titleList: configDir+"cbox-titles.js",
  myTitles: configDir+"my-titles.js",
  langList: configDir+"cbox-lang.js",
  myLang: configDir+"my-lang.js",
//  langText: configDir+"cbox-lang-text.js",
  channel: configDir+"channel.js",
//  settings: configDir+"settings.js",
}

function deleteProperty(obj, id) {
  return (({[id]: deleted, ...obj}) => obj)(obj);
}

export default class CboxAppContainer extends React.Component {
  state = {
    langList: [],
    titleList: [],
    myLang: [],
    myTitles: {},
    settings: {},
    channel: {},
    defaultLang: undefined,
    percentList: -1,
    progressTextList: "",
    percentDownload: -1,
    progressTextDownload: "",
    curPlay: undefined,
    curPos: 0,
    curDur: 0,
    cur: undefined,
    curView: undefined,
    downloadReady: false,
    usbList: [],
    usbPath: undefined,
    usbHash: undefined,
    missingList: [],
    resetDownloadList: [],
//    loadingState: loadingStateValue.init,
    loadingState: loadingStateValue.finishedOk,
    loadingText: ""
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
      }
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
console.log(stateCopy)
console.log(updateLang)
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

  subscribeToIpc = (onDetect) => {
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
    window.ipcRendererSend('main-ready',{});
    window.ipcRendererSend('start-scan',{});
  }

  componentDidMount = () => {
    this.subscribeToIpc((retVal) => console.log(retVal))
  }

  handleSelectPath = (usbPath) => {
console.log(this.state.usbList)
console.log(unique(JSON.stringify(this.state.usbList)))
console.log(usbPath)
    this.setState({
      usbPath,
      usbHash: usbPath,
    })
    window.setOrgPath(usbPath)
    window.ipcRendererSend('stop-scan',{});
    setTimeout(() => {this.handleConfig()}, 0);
  }

  handleUpdateGUID = (guidStr) => {
    let copyObj = Object.assign(this.state.settings);
    copyObj.mapKeyGUID = guidStr;
    this.saveConfigData(configPaths.settings,"settings",copyObj)
    setTimeout(() => {this.handleMapImport()}, 0);
  }

  handleMyLangUpdate = (languages) => {
    const myLang = languages.map(obj => {
      return obj.value
    })
    this.setState({myLang});
    this.saveConfigData(configPaths.myLang,"myLangList",myLang)
  }

  handleLangUpdate = (languages) => {
    const langList = languages.map(obj => {
      return obj.value
    })
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
      this.handleMyTitlesUpdate(obj,"delete")
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
        this.handleMyTitlesUpdate(valObj,"add")
      } else {
        this.setState({titleList: titlesCopy});
      }
      this.saveConfigData(configPaths.titleList,"titleList",titlesCopy)
    }
  };

  handleUpdate = () => {
console.log(this.state.missingList)
    this.downloadAllEp(this.state.missingList)
  }

  handleDownloadAll = () => {
    this.downloadAllEp(this.state.resetDownloadList)
  }

  handleMyTitlesUpdate = (item,action) => {
    const {myTitles,myLang} = this.state;
    if (item!=null){
      if ((item.language!=null)
          && (myLang!=null)
          && (myLang.indexOf(item.language)>=0)){
        const checkID = getIdFromItem(item);
        let copyTitles = myTitles;
        if (copyTitles==null){
          copyTitles = {}
        }
        if (action==="delete"){
          copyTitles[item.language] = copyTitles[item.language].filter(e => e !== checkID);
          this.setState({myTitles: copyTitles});
          this.saveConfigData(configPaths.myTitles,"my-titles",copyTitles)
        } else if (action==="add"){
          if (copyTitles[item.language]==null){
            copyTitles[item.language]=[];
          }
          copyTitles[item.language].push(checkID);
          this.setState({myTitles: copyTitles});
          this.saveConfigData(configPaths.myTitles,"my-titles",copyTitles)
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
    const {usbHash} = this.state;
    if (curSerie==null){ // stop playing
      this.setState({curPlay: undefined})
    } else {
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
    const {usbPath, usbHash, usbList, loadingState,
            myTitles, myLang, curView, curPlay, cur,
            defaultLang, titleList, langList, channel, settings} = this.state;
    if (this.state.usbPath==null){
      return (
        <CboxDesktopAdminApp
          loadingState={loadingState}
          usbList={usbList}
          settings={settings}
          onSelectPath={this.handleSelectPath}
        />)
    } else {
      return (
        <CboxApp
          loadingState={loadingState}
          downloadReady={this.state.downloadReady}
          missingList={this.state.missingList}
          totalMediaFiles={this.state.resetDownloadList.length}
          usbPath={usbPath}
          usbHash={usbHash}
          titles={titleList}
          languages={langList}
          defaultLang={defaultLang}
          percentList={this.state.percentList}
          percentDownload={this.state.percentDownload}
          progressTextList={this.state.progressTextList}
          progressTextDownload={this.state.progressTextDownload}
          myTitles={myTitles}
          myLang={myLang}
          curView={curView}
          curPlay={curPlay}
          curPos={cur}
          settings={settings}
          channel={channel}
          onLangUpdate={this.handleLangUpdate}
          onMyLangUpdate={this.handleMyLangUpdate}
          onMyTitlesUpdate={this.handleMyTitlesUpdate}
          onChannelUpdate={this.handleChannelUpdate}
          onAddTitle={this.handleAddTitle}
          onDeleteTitle={this.handleDeleteTitle}
          onUpdateGUID={this.handleUpdateGUID}
          onUpdate={this.handleUpdate}
          onDownloadAll={this.handleDownloadAll}
          onReset={this.handleReset}
          onPlaying={this.handleMediaPlaying}
          onPlayNext={this.handlePlayNext}
          onStartPlay={this.handleStartPlay}
          onSelectView={this.handleSelectView}
        />)
    }
  }
}
