import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import AvPlayCircle from '@material-ui/icons/PlayCircleOutline';
import AvPauseCircle from '@material-ui/icons/PauseCircleOutline';
import LinearProgress from '@material-ui/core/LinearProgress';
import { apiObjGetStorage, apiObjSetStorage } from '../utils/api';

const styles = theme => ({
  titleBar: {
    alignItems: 'flex-end',
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
  subtitle: {
    whiteSpace: 'unset',
  },
  bar: {
    backgroundColor: 'red',
  },
  linearProgressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
})

const calcPercent = (dur)=> {
  return (dur.position * 100 / dur.duration);
}

const EpItemProgressBar = (props) => {
  const { classes, value } = props;
  return (
    <LinearProgress
      variant="determinate"
      classes={{
        root: classes.linearProgressBar,
        bar: classes.bar,
      }}
      value={value} />
  )
}

const PlayButton = (props) => {
  const { classes, onClick } = props;
  return (
    <IconButton>
      <AvPlayCircle
        className={classes.title}
        nativeColor="grey"
        onClick={onClick}/>
    </IconButton>
  )
}

const PauseButton = (props) => {
  const { classes, onClick } = props;
  return (
    <IconButton>
      <AvPauseCircle
        className={classes.title}
        nativeColor="grey"
        onClick={onClick}/>
    </IconButton>
  )
}

class EpItemBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mSec: undefined,
      mSecDur: undefined,
    };
  }

  restoreCurPos= (obj) => {
    const { usbHash } = this.props;
    apiObjGetStorage(usbHash,obj,"mSec").then((mSec) => {
      if (mSec==null){
        mSec=0;
      }
      apiObjGetStorage(usbHash,obj,"mSecDur").then((mSecDur) => {
        if (mSecDur==null){
          mSecDur=0;
        }
        this.setState({mSec, mSecDur})
      }).catch(function(err) {
        console.error(err);
      });
    }).catch(function(err) {
      console.error(err);
    });
  }

  componentDidMount = () => {
    const {episode,serie} = this.props;
    if ((episode!=null)&&(serie!=null)){
      this.restoreCurPos({curSerie: serie, curEp: episode});
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const {episode,serie,curPos} = nextProps;
    if ((episode!=null) && (serie!=null)){
      if (episode!==this.props.episode){
        this.restoreCurPos({curSerie: serie, curEp: episode});
      } else if (this.props.isActive
                  && (curPos!=null)
                  && (curPos.position!==this.props.position)
                  && (curPos.position!==this.state.mSec)){
        this.setState({mSec: curPos.position, mSecDur: curPos.duration})
      }
    }
  }

  handleClick = (ev, idStr) => {
    const { usbHash } = this.props;
    const resetPosMargin = 10000; // Reset playing to begining if less mSec remains
    ev.stopPropagation();
    if (this.props.onClickPlay!=null) {
      const {episode,serie} = this.props;
      const { mSec, mSecDur } = this.state;
      if ((mSec!=null) && (mSecDur!=null) && ((mSecDur-mSec-resetPosMargin)<0)){
        apiObjSetStorage(usbHash,{curSerie: serie, curEp: episode},"mSec",0).then(() => {
          this.props.onClickPlay(idStr);
        }).catch(function(err) {
          console.error(err);
        });
      } else {
        this.props.onClickPlay(idStr);
      }
    }
  }

  render = () => {
    const { classes, isActive, partOfCurList, episode, curPos,
            isPaused, onSetPaused } = this.props;
    const { mSec, mSecDur } = this.state;
    let epTitle = "";
    let idStr = "";
    let epDescr = <br/>;
    if (episode!=null){
      idStr = episode.id;
      epTitle = episode.title;
      if (episode.descr!=null) {
        epDescr = <div style={{whiteSpace:'normal'}}><br/>{episode.descr}</div>;
      }
      if (epTitle==null){
        epTitle = idStr+1;
      }
    }
    let percentVal = 0;
    if (isActive && (curPos!=null)){
      percentVal = calcPercent(curPos)
    } else if (partOfCurList){
      percentVal = (mSec * 100 / mSecDur)
    }
    return (
      <GridListTileBar
        title={epTitle}
        subtitle={(<div>{(partOfCurList || isActive) && (<EpItemProgressBar
                    value={percentVal}
                    classes={classes}
                  />)}{epDescr}</div>)}
        classes={{
          root: classes.titleBar,
          title: classes.title,
        }}
        actionIcon={
        ((isPaused)||(!isActive))
         ?(<PlayButton
             classes={classes}
             onClick={(isActive)? onSetPaused :(e) => this.handleClick(e,idStr)}
           />
        ):(<PauseButton
            classes={classes}
            onClick={(isActive)? onSetPaused :(e) => this.handleClick(e,idStr)}
           />
        )}
      />
    )
  }
};

EpItemBar.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(EpItemBar);
