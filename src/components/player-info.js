import React from 'react';

export class PlayerInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      containerWidth: 0
    };
  }

  componentWillMount() {
    this.setState({
      containerWidth: this.calcContainerWidth()
    });
  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState({
        containerWidth: this.calcContainerWidth()
      });
    }, false);
  }

  calcContainerWidth = () => {
    let retVal = document.body.clientWidth;
    return retVal;
  }

  handleSetPaused = (ev) => {
    ev.stopPropagation();
    if (this.props.onSetPaused!=null) {
      this.props.onSetPaused(!this.props.isPaused);
    }
  }

  clickedClose = (event) => {
    if (this.props.onCloseCallback!=null) {
      this.props.onCloseCallback(event);
    }
  }

  clickedScrubber = (ev) => {
    ev.stopPropagation();
    const footerHeight = 64; // Maybe we will have to calculate this in the future?
    const playBtnWidth = footerHeight;

    var mouseX = ev.clientX-playBtnWidth;
    if(mouseX>0) {
      const width = this.state.containerWidth;// scrubber Width;
      var percent = mouseX *100 / (width-playBtnWidth);
      if (this.props.onMovePosCallback!=null) {
        this.props.onMovePosCallback(percent);
      }
      ev.preventDefault();
    }
  }

  ms(seconds){
    if(isNaN(seconds)){
      return '00:00';
    }
    else{
      var m = Math.floor(seconds / 60);
      var s = Math.floor(seconds % 60);
      return ((m<10?'0':'') + m + ':' + (s<10?'0':'') + s);
    }
  }

  render() {
    const {serie, episode, curSec, curDur} = this.props;
    let playStateStr = "pause"; // Show pause button while playing
    if (this.props.isPaused) {
      playStateStr = "play";
    }
    let percent = 0;
    if ((curDur>0) && (curDur>=curSec)) {
      percent = 100*(curSec / curDur);
    }
    let progressStyle = {
      width: percent +"%"
    };
    let curEpTitle="";
    if (serie!=null){
      if ((serie.fileList!=null) && (episode!=null) && (serie.fileList[0]!=null)) {
        if (episode.title!=null){
          curEpTitle = episode.title
        } else {
          curEpTitle = episode.id +1;
        }
      } else if (serie.fName!=null){
        curEpTitle = serie.description;
      }
    }
    return (
      <div id="playerInfo">
        <div id="playerBox"></div>
        <div id="scrubber" onClick={this.clickedScrubber}>
          <div id="progressBar" style={progressStyle}></div>
          <div id="infotext">
            <div id="time">
              <div id="played">{this.ms(curSec)}</div>/<div id="duration">{this.ms(curDur)}</div>
            </div>
            <div id="programinfo">
              {serie && <div className="ser-title">{serie.title}</div>}
              {serie && <div className="audio-title">{curEpTitle}</div>}
              {episode && <div className="audio-descr"></div>}
            </div>
          </div>
        </div>
        <div id="play-pause" onClick={(e) => this.handleSetPaused(e)}>
          <p id={playStateStr}></p>
        </div>
        <a id="closeFooter" className="close" onClick={this.clickedClose}>Close Footer</a>
      </div>
    )
  }
};
