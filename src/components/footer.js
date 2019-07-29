import React, { useState, useEffect, useContext } from 'react'
import { CboxContext } from '../cbox-context'
import Fab from '@material-ui/core/Fab'
import NavClose from '@material-ui/icons/Close'
import PlayerInfo from '../components/player-info.js'
// import Sound from 'react-sound'
// BUG FIX !!!
// Temporary bug fix for react-sound version 1.1.0
import Sound from './sound.js'
// import SoundCloud from './sound-cloud'
import { apiObjGetStorage, apiObjSetStorage } from '../utils/api'
import { getLocalMediaFName, isEmptyObj, pad } from '../utils/obj-functions'
import {isWin} from '../utils/file-functions'
import VideoPlayer from './video'
import CboxPreview from './cbox-preview'
import { freeAudioIdOsisMap } from '../osisFreeAudiobible'
import { audiobibleOsisId, osisIdAudiobibleTitle } from '../osisAudiobibleId'

let styles = {
  floatingButton: {
    margin: 0,
    bottom: 330,
    left: 610,
    position: 'fixed',
    right: 'auto',
    zIndex: 1000,
  },
  footerVideo: {
    zIndex: 3,
    fontSize: 18,
    position: 'fixed',
    right: 0,
    left: 0,
    bottom: 0,
    margin: 0,
  },
  footerEpub: {
    zIndex: 3,
    fontSize: 18,
    position: 'fixed',
    right: 0,
    left: 0,
    height: '100%',
    top: 70,
    bottom: 0,
    margin: 0,
  },
  footer: {
    display: 'block',
    zIndex: 3,
    fontSize: 18,
    height: 64,
    position: 'fixed',
    right: 0,
    left: 0,
    paddingLeft: 64,
    bottom: 0,
    margin: 0,
    cursor: 'pointer'
  },
}

export const Footer = (props) => {
  const scope = useContext(CboxContext)
  const { height, width, usbHash, usbPath, curPlay,
          isPaused, isWaitingForPlayInfo, } = scope
  const [hasFinishedPlay, setHasFinishedPlay] = useState(false)
  const [startPos, setStartPos] = useState(0)
  const [curMsPos, setCurMsPos] = useState(undefined)
  const [curPos, setCurPos] = useState()
  const [curDur, setCurDur] = useState()
  const [playerWidth, setWidth] = useState(width)
  const [playerHeight, setHeight] = useState(height)
//    startPos: 0,
//    epubReaderOpen: false,

  const storePos = (msPos) => apiObjSetStorage(usbHash,curPlay,"mSec",msPos)
  const restorePos = async (obj) => {
    await apiObjGetStorage(usbHash,obj,"mSec").then((value) => {
      if (value==null){
        value=0
      }
      if ((obj!=null)&&(obj.curSerie!=null)&&(obj.curSerie.fileList!=null)
          &&(obj.curEp!=null)&&((obj.curSerie.fileList.length-1)===obj.curEp.id)){
        apiObjGetStorage(usbHash,obj,"mSecDur").then((dur) => {
          const marginSec = 3 // minimum sec for play - else repeat from beginning
          if (value+(marginSec*1000)>dur){
            value = 0
          }
          setStartPos(value)
          setCurMsPos(value)
        })
      } else {
        setStartPos(value)
        setCurMsPos(value)
      }
    }).catch((err) => {
      console.error(err)
    })
  }
  useEffect(() => {
    window.ipcRendererOn('second-window-closed',(event) => {
      closeFooter()
    })
    if (curPlay!=null){
      setHasFinishedPlay(false)
      restorePos(curPlay)
    }
  },[curPlay])
/*
  componentWillReceiveProps = (nextProps) => {
    const {curPlay} = nextProps
    if ( (curPlay!=null)
        && ((curPlay==null)
          || (curPlay.curEp !== curPlay.curEp))){
      if ((curPlay!=null)
          && (curPlay.curEp!=null)){ // Store current position
        storePos(state.curMsPos)
      }
      setState({hasFinishedPlay: false})
      restorePos(curPlay)
    }
*/

  const closeFooter = () => {
console.log(curMsPos)
    storePos(curMsPos)
    let bibleFound
    if (curPlay!=null) {
      const { curSerie } = curPlay
      bibleFound = ((curSerie!=null)&&(curSerie.mediaType==="bible"))
    }
    if (props.onStopPlaying) props.onStopPlaying()
// ToDo: When do we have to set skipAlreadyPlayed?
// This needs to be further evaluated!!!
  }

  const movePos = (percent) => {
    if (percent!=null){
      let newPos = 0
      if (curDur!=null){
        newPos = Math.floor(percent * curDur / 100) // Divide by 100 in order to get promille - i.e. milliseconds
      }
      setHasFinishedPlay(false)
      setStartPos(newPos)
      setCurMsPos(newPos)
    }
  }

  const handleStop = () => setHasFinishedPlay(false)
  const handleSetPaused = (isPaused) => {
console.log("handleSetPaused")
    props.onSetPaused(isPaused)
    if (!isPaused) setHasFinishedPlay(false)
  }

  const handleLoading = (cur) => {
    if (curDur !== cur.duration){
      apiObjSetStorage(curPlay,"mSecDur",cur.duration)
      setCurDur(cur.duration)
    }
  }

  const updatePos = (cur) => {
    const newPos = Math.floor(cur.position / 1000)
    if (curPos !== newPos) {
      storePos(cur.position)
    }
    if (curDur !== cur.duration){
      apiObjSetStorage(curPlay,"mSecDur",cur.duration)
      setCurMsPos(cur.position)
      setCurPos(newPos)
      setCurDur(cur.duration)
    } else {
      setCurMsPos(cur.position)
      setCurPos(newPos)
    }
  }

  const handlePlaying = (cur) => {
// BUG FIX !!!
    const soundPlayerBugFix = hasFinishedPlay
    if (!soundPlayerBugFix){
      updatePos(cur)
      if (props.onPlaying) props.onPlaying(cur)
    }
  }

  const handleVideoDuration = (dur) => {
    const durMSec = dur * 1000
    apiObjSetStorage(usbHash,curPlay,"mSecDur",durMSec)
    setCurDur(durMSec)
  }

  const handleVideoProgress = (pos) => {
    const posMSec = pos.playedSeconds *1000
    storePos(posMSec)
    setCurMsPos(posMSec)
    setCurPos(posMSec)
    if (props.onPlaying){
      const cur = {position: posMSec, duration: curDur}
      props.onPlaying(cur)
    }
  }

  const handleFinishedVideoPlaying = () => {
    if (props.onFinishedPlaying) props.onFinishedPlaying()
  }

  const handleFinishedPlaying = () => {
console.log("handleFinishedPlaying")
    setHasFinishedPlay(true)
    handleFinishedVideoPlaying()
  }

  const topMargin = 60

  const getPatternContent = (part,bk,chStr) => {
    if (part===1) return audiobibleOsisId[bk]
    else if (part===2) return osisIdAudiobibleTitle[bk]
    else if (part===3) return chStr
    return part
  }

  let curHeight = Math.trunc(playerWidth*9/16)
  if (curHeight>playerHeight-topMargin){
    curHeight = playerHeight-topMargin
  }
  let useSec
  let useDur
  let downloadName
  if (curMsPos!=null) useSec = Math.floor(curMsPos / 1000)
  if (curDur!=null) useDur = Math.floor(curDur / 1000)
  let locURL = ""
  let videoFound = false
  let epubFound = false
  let htmlFound = false
  let bibleFound = false
  let curPlayState = Sound.status.PLAYING
  const btnStyle =  Object.assign({}, styles.floatingButton)
  let idStr = "footer"
  let readOutLoud = false
  if (isPaused) {
    curPlayState = Sound.status.PAUSED
  }
  if ((curPlay!=null)) {
    const { curSerie, curEp, bibleObj } = curPlay
    if ((curEp!=null)&&(curEp.filename!=null)) {
      locURL = curEp.filename
    } else if ((curSerie!=null)&&(curSerie.curPath!=null)) {
      locURL = curSerie.curPath
    }
    const typeFound = (type) => {
      if (curEp && curEp.mediaType) return curEp.mediaType===type
      return (curSerie &&(curSerie.mediaType===type))
    }
    epubFound = typeFound("epub")
    htmlFound = typeFound("html")
    videoFound = typeFound("vid")
    bibleFound = typeFound("bible")

    if (bibleFound) {
      locURL = ""
      if (!isEmptyObj(bibleObj)){
        const {bk,id} = bibleObj
        let idStr = pad(id)
        let curFName
        if (curSerie.freeType) {
          if ((bk==="Ps") && (id<100)){
            idStr = "0" +pad(id)
          }
          curFName = curSerie.curPath + "/"
                            + freeAudioIdOsisMap[bk] + idStr + ".mp3"
        } else {
          curFName = curSerie.curPath + "/"
          curSerie.pathPattern && curSerie.pathPattern.forEach(part => {
            curFName += getPatternContent(part,bk,idStr)
          })
        }
        locURL = getLocalMediaFName(usbPath,curFName)
      }
    } else if ((curEp!=null)&&(curEp.filename!=null)) {
      locURL = getLocalMediaFName(usbPath,curEp.filename)
    } else if ((curSerie!=null)&&(curSerie.curPath!=null)) {
      locURL = getLocalMediaFName(usbPath,curSerie.curPath)
    }
    if (!videoFound) {
      let tmpStr = ""
      if (curSerie!=null) {
        tmpStr = curSerie.language + '_' + curSerie.title
      }
      if (curEp!=null){
        tmpStr = tmpStr +  '_' + curEp.id + '_' + curEp.title
      }
      let extStr = ".mp3"
      const fileExtensionPattern = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi
      const resStr = locURL.match(fileExtensionPattern)
      if ((resStr!=null)&&(resStr[0]!=null)){
        extStr = resStr[0]
      }
      downloadName = tmpStr.replace(/[^a-z0-9]/gi, '_').toLowerCase() +extStr
    }
    if (epubFound || htmlFound) {
      readOutLoud = curSerie.readOL && !isWin
    }
  }
  if (epubFound || htmlFound) {
    if (playerWidth!=null) {
      btnStyle.left = (playerWidth-40)
    }
    btnStyle.top = 70
    btnStyle.width = 30
    btnStyle.height = 30
  } else if (videoFound){
    if (playerWidth!=null) {
      btnStyle.left = (playerWidth-40)
    }
    btnStyle.bottom = (curHeight-20)
    btnStyle.width = 30
    btnStyle.height = 30
  }
  if (videoFound){
    idStr = "footer-video"
  } else if (epubFound || htmlFound) {
    idStr = "footer-epub"
  }
  const fullSizeFound = videoFound || readOutLoud || htmlFound || epubFound
  if (locURL.length>0) {
    return (
      <footer
        id={idStr}
        style={videoFound ? styles.footerVideo : styles.footer}>
        {fullSizeFound ? (
          <div style={{position: 'relative', height: '80%'}}>
            <Fab
              size="small"
              onClick={closeFooter}
              style={btnStyle}
            >
              <NavClose />
            </Fab>
            {videoFound ? (
              <VideoPlayer
                url={locURL}
                fullSize={fullSizeFound}
                isPaused={isPaused}
                playFromPosition={startPos}
                onEnded={handleFinishedVideoPlaying}
                onDuration={handleVideoDuration}
                onProgress={handleVideoProgress}
                width={playerWidth}
                height={curHeight}
                playing
                controls />
            ): (htmlFound || readOutLoud || epubFound) && (
              <CboxPreview
                url={locURL}
                height={playerHeight-topMargin}
              />
            )}
          </div>
        ):(
          <div>
            <Sound
              url={locURL}
              autoPlay
              playStatus={curPlayState}
              playFromPosition={startPos}
              onLoading={handleLoading}
              onPlaying={handlePlaying}
              onStop={handleStop}
              onFinishedPlaying={handleFinishedPlaying} />
            <PlayerInfo
              curSec={useSec}
              curDur={useDur}
              width={playerWidth}
              isPaused={isPaused}
              isWaitingForPlayInfo={isWaitingForPlayInfo}
              episode={curPlay.curEp}
              serie={curPlay.curSerie}
              onSetPaused={handleSetPaused}
              url={locURL}
              downloadName={downloadName}
              onMovePosCallback={movePos}
              onCloseCallback={closeFooter} />
          </div>
        )}
      </footer>
    )
  } else {
     return (
       <footer id="footer" style={{display: 'none' }}>
       </footer>
    )
  }

}

export default Footer
