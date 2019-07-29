import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import * as Router from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import LinearProgress from '@material-ui/core/LinearProgress'
import Drawer from '@material-ui/core/Drawer'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Fab from '@material-ui/core/Fab'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from "@material-ui/icons/Close"
import FeaturedTitlesList from './featured-titles-list.js'
import MediaStore from './media-store.js'
import Divider from '@material-ui/core/Divider'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import Snackbar from '@material-ui/core/Snackbar'
import { BookOpen, TestTube } from 'mdi-material-ui'
import { withTranslation } from 'react-i18next'
import { matchPath } from 'react-router'
import Footer from './footer'
import CBoxAppBar from './cbox-app-bar'
import CboxMenuList from './cbox-menu-list'
import CboxTPathTable from './cbox-tpath-table'
import { isEmptyObj } from '../utils/obj-functions'
import { NavLangSelect, LanguageSelect } from './language-select'
import { CboxTextField } from './cbox-text-field'
import CboxBibleNavigation from './cbox-bible-navigation'
import TextFieldSubmit from './text-field-submit'
import { iso639Langs } from '../iso639-1-full.js'
import { iso639_3b2 } from '../iso639-3b2'
import { loadingStateValue } from '../utils/config-data'
import { getAllFiles, getRelPath } from '../utils/file-functions'

const defaultBackgroundStyle = {
  height: 'auto',
  minHeight: '100%',
  background: 'black'
}

const styles = theme => ({
  iFrame: {
    overflow: 'visible',
    width: '100%',
  },
  menuTitle: {
    margin: '10px 0px 4px 40px',
  },
  aboutTitle: {
    margin: '10px 0px 4px 50px',
  },
  aboutMainTitle: {
    paddingTop: 20,
    margin: '15px 0px 4px 50px',
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 25,
  },
  topButton: {
    margin: 10,
  },
  floatingButton: {
    margin: 0,
    bottom: 'auto',
    left: 20,
    top: 20,
    right: 'auto',
    zIndex: 100,
    position: 'fixed',
  },
  startNowButton: {
    marginTop: 25,
    marginLeft: 80,
  },
  navBackButton: {
    margin: 10,
    bottom: 'auto',
    left: 20,
    top: 20,
    right: 'auto',
  },
  configButton: {
    color: 'grey',
    marginLeft: 40,
    width: 100,
  },
  linearProgress: {
    width: '75%',
    marginTop: 150,
    marginLeft: '15%',
  },
  linearProgressDownload: {
    width: '75%',
    marginTop: 20,
    marginLeft: '15%',
  },
  progress: {
    margin: '150px 0px 0 250px',
  },
  table: {
    marginLeft: 40,
  },
  textField: {
    marginLeft: 40,
    width: '70%',
    maxWidth: 400,
  },
  updateDiv:{
    marginBottom: 120,
  },
  mapLogo: {
    width: 70,
    height: 70,
    marginBottom: 15,
  },
  mapHeadline: {
    flex: 1,
  },
  chevronRight: {
  },
  resetAndDownloadButton: {
    marginTop: 10,
  },
  downloadButton: {
    marginLeft: 40,
    marginTop: 10,
    backgroundColor: '#b1e0c9',
    '&:hover': {
        backgroundColor: '#0bde77',
    },
  },
  debugButton: {
    marginLeft: 40,
    marginTop: 10,
    backgroundColor: 'lightgrey',
    '&:hover': {
        backgroundColor: 'grey',
    },
  },
  updateButton: {
    width: 70,
    marginLeft: 20,
  },
  card: {
    width: '40%',
  },
  drawerPaperSmall: {
    width: '75%',
  },
  drawerPaperLarge: {
    width: 500,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  title: {
    cursor: 'pointer',
  },
  smallText: {
    position: 'absolute',
    right: 10,
    top: 70,
    fontSize: 10,
  },
})

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest)
  return (
    React.createElement(component, finalProps)
  )
}

const PropsRoute = ({ component, ...rest }) => {
  return (
    <Router.Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest)
    }}/>
  )
}

class CboxApp extends React.Component {
  state = {
    open: false,
    langOpen: false,
    isPaused: false,
    editMode: false,
    changedGUID: false,
    chEditMode: false,
    openSnackbar: false,
    snackbarMessage: "",
    verifiedPaths: [],
    requiredReload: false
  }
// translation path - for instance: "/location/data.en.properties"

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  handleFinishedPlaying = () => {
    this.props.onPlayNext()
  }

  handleStopPlaying = (isCurBible) => {
    this.props.onStartPlay(undefined,undefined,undefined,isCurBible)
    this.setState({isPaused: false})
  }

  handleStartPlay = (inx,curSerie,curEp) => {
    this.setState({isPaused: false})
    this.props.onStartPlay(inx,curSerie,curEp)
  }

  handleStartBiblePlay = (curSerie,bookObj,id) => {
    const {bk} = bookObj
    const curEp = {bibleType: true,bk,id}
    this.setState({isPaused: false})
    this.props.onStartPlay(id,curSerie,curEp)
  }

  handleSetPaused = (isPaused) => {
    this.setState({isPaused})
  }

  handleReturnToHome = () => {
    this.props.onSelectView(undefined)
  }

  handleExitBibleNavigation = () => {
    this.props.onStartPlay(undefined)
    this.props.onSelectView(undefined)
    this.setState({isPaused: false})
  }

  handleSettingsChanged = () => {
    if (this.state.requiredReload){
      window.ipcRendererSend('reload')
    }
    this.props.onSelectView(undefined)
  }

  handleStartClick = () => {
    this.setState({chEditMode: true})
  }

  getAllFilesInfo = async (pathName) => {
    const filenamesArr = pathName && await getAllFiles(pathName)
    const fileStatArr = filenamesArr.map(file => {
      return {
        filePath: file.filePath ,
        isDirectory: file.isDirectory,
      }
    })
    return Promise.resolve(fileStatArr)
  }

  verifyFilelist = (matchArr,inx,orgPath,pathStr,checkFiles) => {
    const {onAddLang,onAddLabel} = this.props
    if (checkFiles!=null) {
      checkFiles.map((item,i) => {
        const filename = getRelPath(this.props.usbPath,item.filePath)
        const match = matchPath(filename, {
          path: pathStr,
          exact: true,
          strict: false
        })
        if ((match.params!=null)&&(match.params.lang!=null)&&(onAddLang!=null)){
          onAddLang(match.params.lang)
        }
        if ((match.params!=null)&&(match.params.label!=null)&&(onAddLabel!=null)){
          onAddLabel(match.params.label)
        }
        this.verifyMatchArr(matchArr,inx+1,filename + "/")
        return filename
      })
    }
  }

  verifyMatchArr = (matchArr,inx,orgPath) => {
    if (matchArr[inx]!=null){
      const checkPathStr = orgPath + matchArr[inx][1]
      const patternStr = orgPath +matchArr[inx][0]
      this.getAllFilesInfo(checkPathStr).then(files => {
        this.verifyFilelist(matchArr,inx,orgPath,patternStr,files)
      }).catch(console.error)
    }
  }

  verifyPath = (pathStr) => {
    const pathPatternRegEx = /\/?(.*?):([^/]*)\//gm
    let matchArr = []
    let match
    while (match = pathPatternRegEx.exec(pathStr)) {
      matchArr.push(match)
    }
    let orgPath = ""
    this.verifyMatchArr(matchArr,0,orgPath)
  }

  handlePathPattern = (pathStr) => {
    let verifiedPaths = this.state.verifiedPaths
    if(verifiedPaths.indexOf(pathStr) === -1) {
      this.verifyPath(pathStr)
      verifiedPaths.push(pathStr)
      this.setState({verifiedPaths})
    }
console.log(verifiedPaths)
  }

  VideoPlayer = () => (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Router.Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
      <MediaStore
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        featuredTitles={this.props.featuredTitles}
        titles={this.props.titles}
        myLang={this.props.myLang}
        languages={this.props.languages}
        filter='vid'
        height={this.props.height}
        width={this.props.width}
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onTitlesUpdate={this.props.onTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )

  Home = (props) => {
    const { t, classes, loadingState, titles, curView,
            channel, percentList, percentDownload,
            progressTextList, progressTextDownload,
            usbPath, usbHash, featuredTitles, myLang,
            curPlay, curPos } = this.props

    const largeScreen = (this.props.width>=768)
    const chDefExists = ((channel!=null)
                        && (channel.title!=null))
    let isCurBible = false
    let curBiblePlay
    if (curPlay!=null) curBiblePlay = JSON.parse(JSON.stringify(curPlay))
    if ((curPlay!=null)&&(curPlay.curSerie!=null)&&(curPlay.curSerie.mediaType!=null)){
      isCurBible = (curPlay.curSerie.mediaType==="bible")
      if (isCurBible) curBiblePlay.curEp = undefined
    }
    return (
    <div style={(curView!=null)? defaultBackgroundStyle : null}>
      <CBoxAppBar
        displayMenu={true}
        onLeftIconButtonClick={this.handleToggle}
      />
      {(percentList>=0) && (<div className={classes.linearProgress}>
        {progressTextList}
          <LinearProgress
            variant="determinate"
            value={percentList}
          />
        </div>)}
      {(percentDownload>=0) && (<div className={classes.linearProgressDownload}>
        {progressTextDownload}
          <LinearProgress
            variant="determinate"
            value={percentDownload}
          />
        </div>)}
      {(loadingState!==loadingStateValue.finishedOk)
        && (<CircularProgress
          className={classes.progress}
          size={65} />)}
      {isCurBible && (<CboxBibleNavigation
        isPaused={this.state.isPaused}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartBiblePlay}
        onReset={this.props.onReset}
        onSetPaused={this.handleSetPaused}
        onExitNavigation={this.handleExitBibleNavigation}
      />)}
      {(!this.props.loading) && !isCurBible && (<FeaturedTitlesList
        filter=''
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onReset={this.props.onReset}
        onSetPaused={this.handleSetPaused}
        onAddTitle={this.props.onAddTitle}
        onDelete={this.handleDelete}
        onTitlesUpdate={this.props.onTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        largeScreen={largeScreen}
        curPlay={isCurBible ? curBiblePlay : curPlay}
      />)}
    </div>
  )}

  Audio = () => {
    return (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Router.Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
      <MediaStore
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        featuredTitles={this.props.featuredTitles}
        titles={this.props.titles}
        myLang={this.props.myLang}
        languages={this.props.languages}
        filter='aud'
        height={this.props.height}
        width={this.props.width}
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onTitlesUpdate={this.props.onTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )}

  Download = () => {
    return (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Router.Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
      <MediaStore
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        featuredTitles={this.props.featuredTitles}
        titles={this.props.titles}
        myLang={this.props.myLang}
        languages={this.props.languages}
        filter='dwnl'
        height={this.props.height}
        width={this.props.width}
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onTitlesUpdate={this.props.onTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )}

  Music = () => (
    <div>
      <Fab
        onClick={this.handleReturnToHome}
        color="primary"
        className={this.props.classes.floatingButton}
        component={Router.Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
    </div>
  )

  Books = (props) => (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Router.Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
      <MediaStore
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        featuredTitles={this.props.featuredTitles}
        titles={this.props.titles}
        myLang={this.props.myLang}
        languages={this.props.languages}
        filter='epub'
        height={this.props.height}
        width={this.props.width}
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onTitlesUpdate={this.props.onTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )

  Training = () => (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Router.Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
      <MediaStore
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        featuredTitles={this.props.featuredTitles}
        titles={this.props.titles}
        myLang={this.props.myLang}
        languages={this.props.languages}
        filter='html'
        height={this.props.height}
        width={this.props.width}
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onTitlesUpdate={this.props.onTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )

  Bible = () => (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Router.Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
      <MediaStore
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        featuredTitles={this.props.featuredTitles}
        titles={this.props.titles}
        myLang={this.props.myLang}
        languages={this.props.languages}
        filter='bible'
        height={this.props.height}
        width={this.props.width}
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onTitlesUpdate={this.props.onTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )

  handleEditClose = (history) => {
    history.goBack()
  }

  handleCBoxDownload = () => {
    const {usbPath} = this.props
    window.ipcRendererSend('download-to-usb',usbPath)
  }

  handleSnackbarClose = () => {
    this.setState({ openSnackbar: false })
  }

  handleCBoxSampleDownload = () => {
    const {t,usbPath,titles} = this.props
    if (titles!=null){
      this.setState({
        openSnackbar: true,
        snackbarMessage: t("usbMustBeEmpty"),
      })
    } else {
      window.ipcRendererSend('download-sample-to-usb',usbPath)
    }
  }

  handleDebug = () => {
    window.ipcRendererSend('open-dev')
//    window.ipcRendererSend('open-host-profile-page')
  }

  About = () => {
    const { t, classes } = this.props
    return (
      <div>
        <Fab
          onClick={this.handleReturnToHome}
          className={classes.topButton}
          color="primary"
          component={Router.Link}
          to='/'
        >
          <ChevronLeftIcon />
        </Fab>
        <Divider />
        <Typography
          type="title"
          color="inherit"
          className={classes.aboutMainTitle}
        >ConnectBox Desktop Admin</Typography>
        <Typography
          type="title"
          className={classes.aboutTitle}
        >{t('swDescription')}</Typography>
        <Typography
          type="title"
          className={classes.aboutTitle}
        >{t('version')+" "+this.props.versionStr}</Typography>
      </div>
    )
  }

  Settings = () => {
    const { t, classes, channel, defaultLang,
            onChannelTitleUpdate, onPageLayoutUpdate,
            onTranslationUpdate } = this.props
    const usePageLayout = (channel && (channel.pageLayout)) || false
    const translations = (channel && channel.tPathList) || [{}]
    const tmpValue = !isEmptyObj(channel) && channel.title
    const handleChannelTitleUpdate = (str) => {
      onChannelTitleUpdate && onChannelTitleUpdate(str)
    }
    const handleTranslationUpdate = (rowNbr,rowData) => {
      let tPathCopy = channel.tPathList
      tPathCopy[rowNbr] = rowData
      this.setState({requiredReload: true})
      onTranslationUpdate && onTranslationUpdate(tPathCopy)
    }
    const handleAddTPath = (val) => {
      let tPathCopy = channel.tPathList
      if (tPathCopy==null){
        tPathCopy = []
      }
      tPathCopy.push({
        tPath: val,
        tPLang: ""
      })
      this.setState({requiredReload: true})
      onTranslationUpdate && onTranslationUpdate(tPathCopy)
    }
    const handleDeleteTPath = (rowNbr) => {
      let tPathCopy = channel.tPathList.filter((row, i) => i !== rowNbr)
      this.setState({requiredReload: true})
      onTranslationUpdate && onTranslationUpdate(tPathCopy)
    }
    const handlePageLayoutUpdate = (val) => {
      onPageLayoutUpdate && onPageLayoutUpdate(val)
    }
    return (
      <div>
        <Fab
          onClick={this.handleSettingsChanged}
          className={classes.topButton}
          color="primary"
          component={Router.Link}
          to='/'
        >
          <ChevronLeftIcon />
        </Fab>
        <Divider />
        <CboxTextField
          id="channel_name"
          label={t("channelName")}
          verifyLength={true}
          defaultValue={tmpValue}
          onUpdate={(str) => handleChannelTitleUpdate(str)}
        />
        <FormControlLabel
          control={
            <Switch
              checked={usePageLayout}
              disabled
              value="pageLayout"
              onChange={(ev,val) => handlePageLayoutUpdate(val)}
              color="primary"
            />
          }
          label="Customized Page Layout"
        />
        <Divider />
        <Typography
          type="title"
          color="inherit"
          className={classes.menuTitle}
        >{t("navLang")}:</Typography>
        <NavLangSelect
          languages={[defaultLang]}
          onSelectUpdate={this.handleNavLang}
        />
        <Divider />
        <Typography
          type="title"
          color="inherit"
          className={classes.menuTitle}
        >{t("mediaContentLang")}:</Typography>
        <LanguageSelect
          multi={true}
          isSearchable={true}
          languages={Object.keys(iso639Langs)}
          selLang={this.props.languages}
          onLanguageUpdate={this.props.onLangUpdate}
        />
        <Divider />
        <Typography
          type="title"
          color="inherit"
          className={classes.menuTitle}
        >{t("defaultInitLang")}:</Typography>
        <LanguageSelect
          multi={true}
          languages={this.props.languages}
          selLang={this.props.myLang}
          onLanguageUpdate={this.props.onMyLangUpdate}
        />
        <Divider />
        <div className={classes.table}>
          <CboxTPathTable
            data={translations}
            onDeleteRow={(row) => handleDeleteTPath(row)}
            onUpdateCell={(rowNbr,rowData) => handleTranslationUpdate(rowNbr,rowData)}
          />
        </div>
        <TextFieldSubmit
          onSubmit={(val) => handleAddTPath(val)}
          InputLabelProps={{
            shrink: true,
          }}
          label="Translation path"
          className={classes.textField}
        />
        <Divider />
        <Typography
          type="title"
          color="inherit"
          className={classes.menuTitle}
        >{t("installOnUSB")}: {this.props.usbPath}</Typography>
        <Button
          variant="contained"
          size="small"
          onClick={this.handleCBoxDownload}
          className={classes.downloadButton}
        >
          <DownloadIcon/>
        </Button>
        <Typography
          type="title"
          color="inherit"
          className={classes.menuTitle}
        >{t("installTest")}: {this.props.usbPath}</Typography>
        <Button
          variant="contained"
          size="small"
          onClick={this.handleCBoxSampleDownload}
          className={classes.debugButton}
        >
          <TestTube/>
        </Button>
        <Typography
          type="title"
          color="inherit"
          className={classes.menuTitle}
        >{t("setDebugMode")}</Typography>
        <Button
          variant="contained"
          size="small"
          onClick={this.handleDebug}
          className={classes.debugButton}
        >
          <BookOpen/>
        </Button>
      </div>
    )
  }

  handleToggle = () => this.setState({open: !this.state.open})
  handleClose = () => this.setState({open: false})
  handleMenuSelect = () => this.setState({langOpen: true})
  handleLangClose = () => this.setState({langOpen: false})
  handleEditMode = () => {
    this.setState({
      langOpen: false,
      editMode: true,
    })
  }
  handleMenuClick = (item) => {
    this.setState({open: false})
  }

  handleNavLang = (valArr) => {
console.log(valArr)
  }

  render() {
    const { t, channel, classes } = this.props
    const { openSnackbar, snackbarMessage } = this.state
    const isCurPlaying = (this.props.curPlay!=null)
    return (
      <div
        id="page_container"
        data-playing={isCurPlaying}
      >
        <Drawer
          docked="false"
          width={200}
          open={this.state.open}
          onClose={this.handleClose}
        >
          <CboxMenuList
            channel={channel}
            onMenuClick={this.handleMenuClick}
          />
        </Drawer>
        <Snackbar
          open={openSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={this.handleClose}
          autoHideDuration={6000}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{snackbarMessage}</span>}
          action={[
            <Button
              key="undo"
              color="secondary"
              size="small"
              onClick={this.handleSnackbarClose}
            >
              {t("ok")}
            </Button>,
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleSnackbarClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}

        />
        <Router.Switch>
          <Router.Route exact path='/' component={this.Home}/>
          <PropsRoute path='/audio' component={this.Audio} test="test"/>
          <Router.Route path='/music' component={this.Music}/>
          <Router.Route path='/books' component={this.Books}/>
          <Router.Route path='/training' component={this.Training}/>
          <Router.Route path='/test' component={this.Test}/>
          <Router.Route path='/bible' component={this.Bible}/>
          <Router.Route path='/download' component={this.Download}/>
          <Router.Route path='/video' component={this.VideoPlayer}/>
          <Router.Route path='/setting' component={this.Settings}/>
          <Router.Route path='/about' component={this.About}/>
        </Router.Switch>
        <Footer
          onSetPaused={this.handleSetPaused}
          onPlaying={this.props.onPlaying}
          onFinishedPlaying={this.handleFinishedPlaying}
          onStopPlaying={this.handleStopPlaying}/>
      </div>
    )
  }
}

CboxApp.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(withTranslation()(CboxApp))
