import React, { useState, useEffect, useContext } from 'react'
import { CboxContext } from '../cbox-context'
import PropTypes from 'prop-types'
import Tappable from 'react-tappable'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar'
import Fab from '@material-ui/core/Fab'
import NavChevronLeft from '@material-ui/icons/ChevronLeft'
import DeleteIcon from '@material-ui/icons/Delete'
import CloseIcon from '@material-ui/icons/Close'
import CreateIcon from '@material-ui/icons/Create'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import IconButton from '@material-ui/core/IconButton'
import AvPlay from '@material-ui/icons/PlayArrow'
import AvPause from '@material-ui/icons/Pause'
import ContentAddCircleOutline from '@material-ui/icons/AddCircleOutline'
import {getImgOfObj} from '../utils/obj-functions'
import { unique } from 'shorthash'
import { Download } from 'mdi-material-ui'
import EpList from './ep-list.js'
import { apiObjGetStorage } from '../utils/api'

const styles = theme => ({
  cardWrap: {
    marginLeft: '10%',
    position: 'relative',
    maxWidth: 685,
    color: 'whitesmoke',
    backgroundColor: '#111',
    display: 'flex',
    flexWrap: 'wrap',
  },
  card: {
    marginLeft: '10%',
    position: 'relative',
    maxWidth: 685,
    color: 'whitesmoke',
    backgroundColor: '#111',
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  subheading: {
    color: 'grey',
  },
  description: {
    fontSize: '0.9rem',
    color: 'grey',
  },
  epTitle: {
    paddingTop: 15,
    color: 'lightgrey',
  },
  headline: {
    paddingTop: 15,
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.87)',
  },
  playPause: {
    color: 'grey',
    backgroundColor: 'rgba(44,135,213,0.3)',
  },
  actionButton: {
    color: 'lightgrey',
    width: 100,
  },
  image: {
    height: 200,
    width: 350,
  },
  closeButtonLScreen: {
    right: -10,
    top: -10,
    zIndex: 100,
    position: 'absolute',
  },
  closeButton: {
    right: -10,
    zIndex: 100,
    position: 'absolute',
  },
  deleteButtonLScreen: {
    left: '75%',
    top: 117,
    zIndex: 100,
    position: 'absolute',
  },
  deleteButton: {
    left: 132,
//    color: 'white',
//    backgroundColor: 'red',
    zIndex: 100,
    position: 'absolute',
  },
  editButtonLScreen: {
    left: '75%',
    top: 60,
    zIndex: 100,
    position: 'absolute',
  },
  editButton: {
    left: 80,
    zIndex: 100,
    position: 'absolute',
  },
  floatingButton: {
    margin: 0,
    color: 'white',
    backgroundColor: '#333',
    bottom: 'auto',
    left: '12%',
    top: 20,
    right: 'auto',
    zIndex: 100,
    position: 'relative',
  },
})

const PlayButton = (props) => {
  const { classes, onClick } = props
  return (
    <IconButton
      onClick={onClick}
      className={classes.playPause}
    >
      <AvPlay/>
    </IconButton>
  )
}

const PauseButton = (props) => {
  const { classes, onClick } = props
  return (
    <IconButton
      onClick={onClick}
      className={classes.playPause}
    >
      <AvPause/>
    </IconButton>
  )
}

const SeriesItem = (props) => {
  const scope = useContext(CboxContext)
  const { usbPath, usbHash, height, width, titles, languages, myLang,
          featuredTitles, largeScreen, curView, curPlay, curPos, isPaused } = scope
  const { classes, serie, disabled, isPreview, 
          onSetPaused, onSelectView,
          onPlayNext, onStartPlay, onTitlesUpdate,
          onSetEditMode, onStartEdit } = props
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)
  const [showAllEp, setShowAllEp] = useState(false)
  const [longPressMode, setLongPressMode] = useState(false)
  const [serieCurEp, setSerieCurEp] = useState(undefined)

  const restoreCurEp = (obj) => {
    let tmpEp = undefined
    const tmpObj = {curSerie: obj}
    apiObjGetStorage(usbHash,tmpObj,"curEp").then((value) => {
      if (value==null){
        value=0
      }
      if ((obj!=null) && (obj.fileList!=null)
          && (obj.fileList[value]!=null)){
        tmpEp=obj.fileList[value]
      }
      setSerieCurEp(tmpEp)
    }).catch(function(err) {
      console.error(err)
    })
  }

  useEffect(() => {
    if (serie){
      if (curPlay && (curPlay.curSerie===serie) && (curPlay.curEp!=null)){
        setSerieCurEp(curPlay.curEp)
      } else {
        restoreCurEp(serie)
      }
    }
  }, [serie,curPlay])

  const handleCloseDialog = () => {
    setShowAllEp(false)
    onSelectView && onSelectView(undefined)
  }
  const handleCloseLongPressMode = () => {
    setLongPressMode(false)
    onSetEditMode && onSetEditMode(false)
  }
  const handleCloseShowAllEp = () => setShowAllEp(false)
  const handleDeleteSerie = () => {
    setLongPressMode(false)
    onTitlesUpdate && onTitlesUpdate("delete")
    onSetEditMode&& onSetEditMode(false)
  }

  const handleDownload = (ev) => {
    setMessage('Sorry! -> Download is not yet implemented...')
    setOpen(true)
  }

  const handleRequestClose = () => {
    setOpen(false)
    setShowAllEp(false)
  }

  const handleShowList = () => setShowAllEp(true)
  const handleSetPaused = (ev) => {
    ev.stopPropagation()
    if (onSetPaused!=null) {
      onSetPaused(!isPaused)
    }
  }

  const handleClickItemIndex = (index,idStr) => {
    var tmpEp = undefined
    if ((serie!=null) && (serie.fileList!=null)
        && (serie.fileList[index]!=null)){
      tmpEp=serie.fileList[index]
    }
    if (onStartPlay!=null) {
console.log(tmpEp)
      setSerieCurEp(tmpEp)
      onStartPlay(index,serie,tmpEp)
    }
  }

  const handleClickItem = (ev) => {
    ev.stopPropagation()
    if (!longPressMode){
      if ((curPlay==null) && (onStartPlay!=null)) {
        onStartPlay(0,serie)
      }
      onSelectView && onSelectView(serie)
    }
  }

  const handleBookmark = () => {
console.log("bookmark")
  }

	const handlePressed = (e) => {
    setLongPressMode(true)
    onSetEditMode && onSetEditMode(true)
	}

  const serImgSrcStr = getImgOfObj(usbPath,serie)
  let imgSrcStr = serImgSrcStr
  let curIsSerie = (serieCurEp!=null)
  if ((curIsSerie) && (serie!=null) && (serie.fileList!=null)) {
    curIsSerie = (serie.fileList.length>1)
  }
  let tmpTitle = serie.title
  let curEpDescr=""
  if (serieCurEp!=null){
    if (serieCurEp.image!=null) {
      imgSrcStr = getImgOfObj(usbPath,serieCurEp)
    }
    if (serieCurEp.title!=null){
      curEpDescr = serieCurEp.title
    } else if (!curIsSerie) {
      curEpDescr = ""
    } else {
      curEpDescr = serieCurEp.id +1
    }
  }
  let serSubTitle = curEpDescr
  if (!curIsSerie) {
    serSubTitle = serie.description
  }
  if (imgSrcStr == null) {
    return <div></div>
  } else {
    const isCurPlaying = ((serie != null)
                          && (curPlay!=null)
                          && (curPlay.curSerie!=null)
                          && (serie === curPlay.curSerie))
    let playStateIcon = <PauseButton classes={classes} onClick={handleSetPaused}/>
    const isVideoPlaying = (isCurPlaying && (curPlay.curSerie.mediaType === "vid"))
    const isBookActive = (isCurPlaying && (curPlay.curSerie.mediaType === "epub"))
    const isTrainingActive = (isCurPlaying && (curPlay.curSerie.mediaType === "html"))
    let hideNavigation = isBookActive || isTrainingActive
    if (!isCurPlaying) {
      playStateIcon = <PlayButton classes={classes}onClick={(e) => handleClickItem(e)}/>
    } else if (isPaused) {
      playStateIcon = <PlayButton classes={classes} onClick={handleSetPaused}/>
    } else if (isVideoPlaying) {
      const tempHeight = (Math.trunc((width)*9/16))
      hideNavigation = height -tempHeight < 150 // hide if less than margin
    }
    let bookmarkIcon = <ContentAddCircleOutline onClick={handleBookmark}/>
/*
    if (bookmarkList.indexOf(serie._id)>=0) {
      bookmarkIcon = <ActionCheckCircle color="grey" onClick={handleBookmark}/>
    }
*/
//      <PausePreviewIcon style={iconStyles} color={red500} hoverColor={greenA200} />
    const isActiveSerie = ((curView!= null) && (curView === serie))
    if (hideNavigation) {
      return <div/>
    } else if (isActiveSerie) {
      return (
        <div
           style={styles.card}
           data-active={isActiveSerie}
           data-playing={isCurPlaying}
        >
           <Fab
             size="small"
             className={classes.floatingButton}
             onClick={handleCloseDialog} >
               <NavChevronLeft />
           </Fab>
           <Card className={showAllEp ? classes.cardWrap : classes.card}>
             <div className={classes.details}>
               <CardContent className={classes.content}>
                 <Typography className={classes.headline} type="headline" component="h2">
                   {tmpTitle}
                 </Typography>
                 <Typography className={classes.description} type="subheading">
                   {serie.description}
                 </Typography>
                 <Typography className={classes.epTitle} type="subheading">
                   {curEpDescr}
                 </Typography>
               </CardContent>
               <CardActions>
                 {isPreview && (<IconButton
                   className={classes.actionButton}
                   onClick={handleBookmark}>{bookmarkIcon}</IconButton>)}
                 {!isPreview && curIsSerie && showAllEp && (<IconButton
                   className={classes.actionButton}
                   onClick={handleCloseShowAllEp}><ExpandLessIcon/></IconButton>)}
                 {!isPreview && curIsSerie && !showAllEp && (<IconButton
                   className={classes.actionButton}
                   onClick={handleShowList}><ExpandMoreIcon/></IconButton>)}
                 {isPreview && (<IconButton
                   className={classes.actionButton}
                   onClick={handleDownload}><Download/></IconButton>)}
                 {playStateIcon}
               </CardActions>
             </div>
             {!showAllEp && (<CardMedia
               className={classes.image}
               image={imgSrcStr}
               title={serie.title}
             />)}
             {showAllEp && (<EpList
               serie={serie}
               curEp={serieCurEp}
               curPlay={curPlay}
               usbPath={usbPath}
               width={width}
               useHeight={height}
               curPos={curPos}
               isPaused={isPaused}
               imgSrc={serImgSrcStr}
               onClickPlay={handleClickItemIndex}
               onSetPaused={handleSetPaused}
             />)}
           </Card>
          <Snackbar
            open={open}
            message={message}
            autoHideDuration={3500}
          />
        </div>
      )
    } else {
      return (
        <Tappable
          onPress={handlePressed}
          onClick={(e) => handleClickItem(e)}
          className="serie-div shadow"
          style={(disabled) ? {cursor: "default"} : null}
          data-active={isActiveSerie}
          data-playing={isCurPlaying}
          data-edit-mode={longPressMode}
          data-disabled={disabled}
        >
          {longPressMode &&
            (<Fab
              size="small"
              color="secondary"
              className={largeScreen ? classes.deleteButtonLScreen : classes.deleteButton}
              onClick={handleDeleteSerie}
            >
              <DeleteIcon />
            </Fab>
          )}
          {longPressMode &&
            (<Fab
              size="small"
              color="primary"
              className={largeScreen ? classes.editButtonLScreen : classes.editButton}
              onClick={() => onStartEdit()}
            >
              <CreateIcon />
            </Fab>
          )}
          {longPressMode &&
            (<Fab
              size="small"
              onClick={handleCloseLongPressMode}
              className={largeScreen ? classes.closeButtonLScreen : classes.closeButton}
            >
              <CloseIcon />
            </Fab>
          )}
          <div
            className={unique(serie.title)+'_item item-div'}
          >
            <img className="image" src={imgSrcStr} alt="" />
            <div className="Title">{serie.title}
              {isPreview && (<div className="Description">{serie.description}</div>)}
              <div className="EpDescription">{serSubTitle}</div>
            </div>
          </div>
        </Tappable>
    )}
  }
}

SeriesItem.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(SeriesItem)
