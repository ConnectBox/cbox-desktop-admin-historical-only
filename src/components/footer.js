import React from 'react';
import Button from '@material-ui/core/Button';
import NavClose from '@material-ui/icons/Close';
import { PlayerInfo } from '../components/player-info.js';
// import Sound from 'react-sound';
// BUG FIX !!!
// Temporary bug fix for react-sound version 1.1.0
import Sound from './cbox-sound.js';
import { apiObjGetStorage, apiObjSetStorage } from '../utils/api';
import {getLocalMediaFName} from '../utils/obj-functions';
import CboxVideoPlayer from './cbox-video'

let styles = {
  floatingButton: {
    margin: 0,
    bottom: 330,
    left: 610,
    right: 'auto',
    zIndex: 100,
    position: 'fixed',
  },
};

const maxVideoWidth = 640;

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasFinishedPlay: false,
      curMsPos: undefined,
      curPos: undefined,
      curDur: undefined,
      startPos: 0,
      videoPlayerWidth: this.calcContainerWidth(),
    };
  }

  calcContainerWidth() {
    let retVal = document.body.clientWidth;
    if (retVal>maxVideoWidth){
      retVal=maxVideoWidth;
    }
    return retVal;
  }

  storePos = (msPos) => {
    const { usbHash } = this.props;
    apiObjSetStorage(usbHash,this.props.curPlay,"mSec",msPos)
  }

  restorePos = (obj) => {
    const { usbHash } = this.props;
    apiObjGetStorage(usbHash,obj,"mSec").then((value) => {
      if (value==null){
        value=0;
      }
      this.setState({startPos: value, curMsPos: value});
    }).catch(function(err) {
      console.error(err);
    });
  }

  componentDidMount = () => {
    window.addEventListener('resize', () => {
      const videoPlayerWidth = this.calcContainerWidth();
      this.setState({videoPlayerWidth});
    }, false);
    if (this.props.curPlay!=null){
      this.setState({hasFinishedPlay: false})
      this.restorePos(this.props.curPlay);
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const {curPlay} = nextProps;
    if ( (curPlay!=null)
        && ((this.props.curPlay==null)
          || (this.props.curPlay.curEp !== curPlay.curEp))){
      if ((this.props.curPlay!=null)
          && (this.props.curPlay.curEp!=null)){ // Store current position
        this.storePos(this.state.curMsPos);
      }
      this.setState({hasFinishedPlay: false})
      this.restorePos(curPlay);
    }
/*
    if (this.props.playFromPosition != null) {
      if (this.props.playFromPosition !== prevProps.playFromPosition) {
        sound.setPosition(this.props.playFromPosition);
      }
    }
*/
  }

  closeFooter = () => {
    this.storePos(this.state.curMsPos);
    if (this.props.onStopCallback!=null) {
      this.props.onStopCallback();
    }
  }

  movePos = (percent) => {
    let newPos = 0;
    if (this.props.curPos!=null){
      newPos = Math.floor(percent * this.props.curPos.duration / 100); // Divide by 100 in order to get promille - i.e. milliseconds
    }
    this.setState({hasFinishedPlay: false, startPos: newPos, curMsPos: newPos});
  }

  handleLoading = () => {
console.log("handleLoading")
  }

  handleStop = () => {
console.log("handleStop")
    this.setState({hasFinishedPlay: false})
  }

  handleSetPaused = (isPaused) => {
console.log("handleSetPaused")
    this.props.onSetPaused(isPaused)
  }

  handlePlaying = (cur) => {
    const { usbHash, curPlay } = this.props;
// BUG FIX !!!
    const soundPlayerBugFix = this.state.hasFinishedPlay;
    if (!soundPlayerBugFix){
      const newPos = Math.floor(cur.position / 1000);
      if (this.state.curPos !== newPos) {
        this.storePos(cur.position);
      }
      if (this.state.curDur !== cur.duration){
        apiObjSetStorage(usbHash,curPlay,"mSecDur",cur.duration)
        this.setState({curMsPos: cur.position, curPos: newPos, curDur: cur.duration});
      } else {
        this.setState({curMsPos: cur.position, curPos: newPos});
      }
      if (this.props.onPlaying!=null){
        this.props.onPlaying(cur)
      }
    }
  }

  handleVideoDuration = (dur) => {
    const { usbHash, curPlay } = this.props;
    const durMSec = dur * 1000;
    apiObjSetStorage(usbHash,curPlay,"mSecDur",durMSec)
    this.setState({curDur: durMSec});
  }

  handleVideoProgress = (pos) => {
    const posMSec = pos.playedSeconds *1000;
    this.storePos(posMSec);
    this.setState({curMsPos: posMSec, curPos: posMSec});
    if (this.props.onPlaying!=null){
      const cur = {position: posMSec, duration: this.state.curDur};
      this.props.onPlaying(cur)
    }
  }

  handleFinishedVideoPlaying = () => {
    if (this.props.onFinishedPlaying!=null) {
      this.props.onFinishedPlaying();
    }
  }

  handleFinishedPlaying = () => {
console.log("handleFinishedPlaying")
    this.setState({hasFinishedPlay: true})
    this.handleFinishedVideoPlaying();
  }

  handleDownload = (url) => {
console.log(url)
  }

  render() {
    const {curPlay, curPos, isPaused, usbPath} = this.props;
    const {videoPlayerWidth,startPos} = this.state;
    let curSec = undefined;
    let curDur = undefined;
    let downloadName = undefined;
    if (curPos!=null){
      curSec = Math.floor(curPos.position / 1000);
      curDur = Math.floor(curPos.duration / 1000);
    }
    let locURL = "";
    let videoFound = false;
    let curPlayState = Sound.status.PLAYING;
    if (isPaused) {
      curPlayState = Sound.status.PAUSED
    }
    if ((curPlay!=null)) {
      const { curSerie, curEp } = curPlay;
      if ((curEp!=null)&&(curEp.filename!=null)) {
        locURL = getLocalMediaFName(usbPath,curEp.filename);
      } else if ((curSerie!=null)&&(curSerie.curPath!=null)) {
        locURL = getLocalMediaFName(usbPath,curSerie.curPath);
      }
      videoFound = ((curSerie!=null)&&(curSerie.mediaType==="vid"));
      if (!videoFound) {
       let tmpStr = curSerie.language + '_' + curSerie.title;
       if (curEp!=null){
         tmpStr = tmpStr +  '_' + curEp.id + '_' + curEp.title;
       }
       let extStr = ".mp3";
       const fileExtensionPattern = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi
       const resStr = locURL.match(fileExtensionPattern);
       if ((resStr!=null)&&(resStr[0]!=null)){
         extStr = resStr[0];
       }
       downloadName = tmpStr.replace(/[^a-z0-9]/gi, '_').toLowerCase() +extStr;
     }
    }
    let btnStyle =  Object.assign({}, styles.floatingButton);
    if (videoFound){
      if (videoPlayerWidth<maxVideoWidth){
        btnStyle.left = (videoPlayerWidth-40);
        btnStyle.bottom = (Math.trunc((videoPlayerWidth)*9/16)-30);
        btnStyle.width = 30;
        btnStyle.height = 30;
      }
    }
    if (locURL.length>0) {
      return (
        <footer
          id={videoFound ? "footer-video" : "footer"}
          style={{display: 'block'}}>
          {videoFound ? (
            <div>
              <Button
                variant="fab"
                mini
                onClick={this.closeFooter}
                style={btnStyle}
              >
                <NavClose />
              </Button>
              <CboxVideoPlayer
                url={locURL}
                isPaused={isPaused}
                playFromPosition={startPos}
                onEnded={this.handleFinishedVideoPlaying}
                onDuration={this.handleVideoDuration}
                onProgress={this.handleVideoProgress}
                width={videoPlayerWidth}
                height={Math.trunc(videoPlayerWidth*9/16)}
                playing
                controls />
            </div>
          ):(
            <div>
              <Sound
                url={locURL}
                playStatus={curPlayState}
                playFromPosition={startPos}
                onLoading={this.handleLoading}
                onPlaying={this.handlePlaying}
                onStop={this.handleStop}
                onFinishedPlaying={this.handleFinishedPlaying} />
              <PlayerInfo
                curSec={curSec}
                curDur={curDur}
                isPaused={isPaused}
                episode={curPlay.curEp}
                serie={curPlay.curSerie}
                onSetPaused={this.handleSetPaused}
                url={locURL}
                downloadName={downloadName}
                onMovePosCallback={this.movePos}
                onCloseCallback={this.closeFooter} />
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
};

export default Footer;
