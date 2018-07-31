import React from 'react';
import ReactPlayer from 'react-player'
/*
import {RdxVideo, Overlay, Controls} from 'react-html5-video-editor'
import { createStore } from 'redux';

const initialState = {
  todos: []
}

function todoApp(state = initialState, action) {
  return state
}

const store = createStore(todoApp);
*/

class CboxVideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startPos: 0,
      duration: undefined,
    };
  }

  movePos = (newPos) => {
    this.setState({startPos: newPos});
    const durMSec = this.player.getDuration() * 1000;
    if (durMSec>newPos){
      this.player.seekTo(newPos/1000);
    }
  }

  componentDidMount = () => {
    const {playFromPosition} = this.props;
    if ((playFromPosition != null)&&!isNaN(playFromPosition)&&(playFromPosition>0)) {
      this.movePos(playFromPosition);
    }
  }

  componentDidUpdate = (prevProps) => {
    const {playFromPosition} = this.props;
    if ((playFromPosition != null)&&!isNaN(playFromPosition)&&(playFromPosition>0)) {
      if (playFromPosition !== prevProps.playFromPosition) {
        this.movePos(playFromPosition);
      }
    }
  }

  onDuration = (duration) => {
    const newPos = this.state.startPos;
    const durMSec = duration * 1000;
    if (durMSec>newPos){
      this.player.seekTo(newPos/1000);
    }
    if (this.props.onDuration!=null){
      this.props.onDuration(duration)
    }
  }

/* YouTube example:
    <ReactPlayer url='https://www.youtube.com/watch?v=ysz5S6PUM-U' playing controls />
    https://github.com/CookPete/react-player/blob/HEAD/src/demo/App.js

   ToDo: Check out possibly using other video players
     https://github.com/video-react/video-react
     https://github.com/videojs/video.js https://www.npmjs.com/package/video.js
*/
  ref = player => {
    this.player = player
  }

  render() {
    return (
      <ReactPlayer
        ref={this.ref}
        url={this.props.url}
        onEnded={this.props.onEnded}
        onDuration={this.onDuration}
        onProgress={this.props.onProgress}
        width={this.props.width}
        height={this.props.height}
        playing={!this.props.isPaused}
        controls
        config={{
            file: {
              forceVideo: true,
            }
          }}
      />
    )
  }
/*
<RdxVideo autoPlay loop muted store={store}>
  <Overlay />
  <Controls />
  <source src={this.props.url} type="video/mp4" />
</RdxVideo>

*/
};

export default CboxVideoPlayer;
