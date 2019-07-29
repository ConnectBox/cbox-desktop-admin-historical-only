import React from 'react'

const PlayerInfo = (props) => {
  const handleSetPaused = (ev) => {
    ev.stopPropagation()
    if (props.onSetPaused!=null) {
      props.onSetPaused(!props.isPaused)
    }
  }

  const clickedClose = (event) => {
    if (props.onCloseCallback!=null) {
      props.onCloseCallback(event)
    }
  }

  const clickedScrubber = (ev) => {
    ev.stopPropagation()
    const footerHeight = 64 // Maybe we will have to calculate this in the future?
    const playBtnWidth = footerHeight
    var mouseX = ev.clientX-playBtnWidth
    if(mouseX>0) {
      const width = props.width// scrubber Width
      var percent = mouseX *100 / (width-playBtnWidth)
      if (props.onMovePosCallback!=null) {
        props.onMovePosCallback(percent)
      }
      ev.preventDefault()
    }
  }

  const ms = (seconds) => {
    if(isNaN(seconds)){
      return '00:00'
    }
    else{
      var m = Math.floor(seconds / 60)
      var s = Math.floor(seconds % 60)
      return ((m<10?'0':'') + m + ':' + (s<10?'0':'') + s)
    }
  }

  const {serie, episode, curSec, curDur} = props
  let playStateStr = "pause" // Show pause button while playing
  if (props.isPaused) {
    playStateStr = "play"
  }
  let percent = 0
  if ((curDur>0) && (curDur>=curSec)) {
    percent = 100*(curSec / curDur)
  }
  let progressStyle = {
    width: percent +"%"
  }
  let curEpTitle=""
  if (serie!=null){
    if ((serie.fileList!=null) && (episode!=null) && (serie.fileList[0]!=null)) {
      if (episode.title!=null){
        curEpTitle = episode.title
      } else {
        curEpTitle = episode.id +1
      }
    } else if (serie.fName!=null){
      curEpTitle = serie.description
    }
  }
  return (
    <div id="playerInfo">
      <div id="playerBox"></div>
      <div id="scrubber" onClick={clickedScrubber}>
        <div id="progressBar" style={progressStyle}></div>
        <div id="infotext">
          <div id="time">
            <div id="played">{ms(curSec)}</div>/<div id="duration">{ms(curDur)}</div>
          </div>
          <div id="programinfo">
            {serie && <div className="ser-title">{serie.title}</div>}
            {serie && <div className="audio-title">{curEpTitle}</div>}
            {episode && <div className="audio-descr"></div>}
          </div>
        </div>
      </div>
      <div id="play-pause" onClick={(e) => handleSetPaused(e)}>
        <p id={playStateStr}></p>
      </div>
      <button id="closeFooter" className="close" onClick={clickedClose}>Close Footer</button>
    </div>
  )
}

export default PlayerInfo
