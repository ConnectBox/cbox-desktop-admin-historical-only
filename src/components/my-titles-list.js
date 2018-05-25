import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SeriesItem from './series-item.js';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
  button: {
    zIndex: 1,
    position: 'relative',
    margin: '22px 0 0 40px',
  },
  buttonLScreen: {
    zIndex: 1,
    position: 'relative',
    margin: '85px 0 0 29px',
  },
  logoLScreen: {
  },
  logo: {
    minWidth: 100,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  floatingButton: {
    margin: '30px 10px 0 80%',
    zIndex: 100,
  },
  floatingButtonLScreen: {
    margin: '70% 10px 10px 70%',
    zIndex: 100,
  },
});

class MyTitlesList extends React.Component {
  state = {
    curEditModeInx: undefined,
  };

  handleSelectFromLibrary = () => {
    if (this.props.onSelectFromLibrary!=null){
      this.props.onSelectFromLibrary()
    }
  }

  handleStartPlay = (inx) => (curSerie,curEp,curFName,bStopCurrentPlayback) => {
    if (this.props.onStartPlay!=null){
      this.props.onStartPlay(inx,curSerie,curEp,curFName,bStopCurrentPlayback)
    }
  }

  handleTitlesUpdate = (ser) => (action) => {
    if (this.props.onMyTitlesUpdate!=null){
      this.props.onMyTitlesUpdate(ser,action)
    }
  }

  handleSetEditMode = (ser) => (isSet) => {
    if (isSet){
      this.setState({curEditModeInx: ser})
    } else {
      this.setState({curEditModeInx: undefined})
    }
  }

  render = () => {
    const { classes,titles, languages,
            myTitles, myLang, fullList, filter,
            largeScreen, curView, curPlay, curPos,
            isPaused } = this.props;
    let curTitleList = [];
    if (titles!=null){
      if (fullList){
        languages.forEach(lang => {
          if (titles[lang]!=null){
            Object.keys(titles[lang]).forEach((title) => {
              curTitleList.push(titles[lang][title])
            })
          }
        })
      } else if ((titles!=null)&&(myTitles!=null)){
        Object.keys(myTitles).filter(
          lang => myLang.indexOf(lang)>=0
        ).forEach((lang) => {
          if (titles[lang]!=null){
            myTitles[lang].forEach((title) => {
              if (titles[lang][title]!=null){
                curTitleList.push(titles[lang][title])
              }
            })
          }
        });
      }
    }
    const hasCurView = (curView!= null);
    return (
      <div id="home-div"
        data-active={hasCurView}
        data-disabled={(this.state.curEditModeInx!=null)}
      >
        {(curTitleList.length>0)
            && curTitleList.filter((ser) => {
              return ((ser.mediaType===filter) || (filter===''))
            }).map((ser,index) => {
              return (
                <SeriesItem
                  usbPath={this.props.usbPath}
                  usbHash={this.props.usbHash}
                  serie={ser}
                  key={index}
                  index={index}
                  disabled={((this.state.curEditModeInx!=null) && (this.state.curEditModeInx!==index))}
                  largeScreen={largeScreen}
                  isPreview={fullList}
                  isPaused={isPaused}
                  onSetPaused={this.props.onSetPaused}
                  onSelectView={this.props.onSelectView}
                  onPlayNext={this.props.onPlayNext}
                  onStartPlay={this.handleStartPlay(index)}
                  onMyTitlesUpdate={this.handleTitlesUpdate(ser)}
                  onSetEditMode={this.handleSetEditMode(index)}
                  curPlay={curPlay}
                  curPos={curPos}
                  curView={curView}/>
              )
          })}
          <div
            className="serie-div dashed"
            data-active={false}
            data-playing={false}
          >
            <div
              className="item-div"
            >
              <Button
                className={largeScreen? classes.floatingButtonLScreen : classes.floatingButton }
                variant="fab"
                color="primary"
                component={Link}
                to='/add'
              >
                <AddIcon className={classes.addIcon}/>
              </Button>
            </div>
          </div>
      </div>
    )
  }
}

MyTitlesList.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MyTitlesList);
