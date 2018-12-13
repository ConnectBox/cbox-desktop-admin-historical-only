import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Footer from './footer'
import CBoxAppBar from './cbox-app-bar';
import CBoxEditChannel from './cbox-edit-channel';
import CboxMenuList from './cbox-menu-list';
import { isEmptyObj } from '../utils/obj-functions';
import { NavLangSelect, LanguageSelect } from './language-select';
import { CboxTextField } from './cbox-text-field';
import Typography from '@material-ui/core/Typography';
import { Switch, Route, Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import FeaturedTitlesList from './featured-titles-list.js';
import TypeLangSelect from './type-lang-select';
import MediaStore from './media-store.js';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import Snackbar from '@material-ui/core/Snackbar';
import { BookOpen, TestTube } from 'mdi-material-ui';
import verge from 'verge';
import {iso639Langs} from '../iso639-1-full.js'
import {loadingStateValue} from '../utils/config-data';
import { withNamespaces } from 'react-i18next';
import {LiveProvider,LiveEditor,LiveError,LivePreview} from 'react-live'

const defaultBackgroundStyle = {
  height: 'auto',
  minHeight: '100%',
  background: 'black'
};

const versionStr = 'Version 2.12';

const codeExample = `const Wrapper = ({ children }) => (
  <div style={{
    background: 'papayawhip',
    width: '100%',
    padding: '2rem'
  }}>
    {children}
  </div>
)

const Title = () => (
  <h3 style={{ color: 'palevioletred' }}>
    Hello World!
  </h3>
)

render(
  <Wrapper>
    <Title />
  </Wrapper>
)`


const styles = theme => ({
  iFrame: {
    overflow: 'visible',
    width: '100%',
  },
  menuTitle: {
    margin: '15px 0px 4px 20px',
  },
  aboutTitle: {
    margin: '15px 0px 4px 50px',
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
  mainMessage: {
    marginLeft: 50,
    paddingTop: 90,
    maxWidth: 720,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 55,
  },
  mainMessageWhileEditing: {
    marginLeft: 50,
    maxWidth: 720,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 55,
  },
  mainMessageComment: {
    clear: "right",
    display: "block",
    marginLeft: 10,
    maxWidth: 720,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 20,
    fontStyle: "italic",
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
});

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const PropsRoute = ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest);
    }}/>
  );
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
    containerWidth: this.calcContainerWidth(),
  }

  calcContainerWidth() {
    let retVal = verge.viewportW();
    return retVal;
  }

  componentDidMount = () => {
    window.addEventListener('resize', () => {
      const containerWidth = this.calcContainerWidth();
      this.setState({containerWidth});
    }, false);
  }

  handleFinishedPlaying = () => {
    this.props.onPlayNext();
  }

  handleStopPlaying = () => {
    this.props.onStartPlay(undefined);
    this.setState({isPaused: false});
  }

  handleStartPlay = (inx,curSerie,curEp) => {
    this.setState({isPaused: false});
    this.props.onStartPlay(inx,curSerie,curEp);
  }

  handleSetPaused = (isPaused) => {
    this.setState({isPaused});
  }

  handleReturnToHome = () => {
    this.props.onSelectView(undefined);
  }

  handleChannelUpdate = (obj) => {
console.log(obj)
    const validChDef = ((obj!=null)
                        && (obj.title!=null)
                        && (obj.title.length>2));
    if (validChDef) {
      this.setState({chEditMode:false})
    }
    if (this.props.onChannelUpdate!=null){
      this.props.onChannelUpdate(obj)
    }
  }

  handleStartClick = () => {
    this.setState({chEditMode: true});
  }

  VideoPlayer = () => (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Link}
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
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onFeaturedTitlesUpdate={this.props.onFeaturedTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )

  MainInitMessage = (isEditMode) => {
    const { t, classes } = this.props;
    return (
      <div className={isEditMode? classes.mainMessageWhileEditing : classes.mainMessage}>
        {t("createChannel")}
        <span  className={classes.mainMessageComment}>
          {t("createChannelComment")}
        </span>
      </div>
    )
  }

// ToDo: -> ASAP enable write access and then change text to:
// Share your media channel
  Home = () => {
    const { t, classes, loadingState, titles, curView,
            channel, percentList, percentDownload,
            progressTextList, progressTextDownload } = this.props;
    const largeScreen = (this.state.containerWidth>=768);
    const chDefExists = ((channel!=null)
                        && (channel.title!=null));
    const validChDef = (chDefExists
                        && (channel.title.length>2));
    const editChDef = this.state.chEditMode || (!validChDef && chDefExists);
//    const editChDef = false;
    return (
    <div style={(curView!=null)? defaultBackgroundStyle : null}>
      <CBoxAppBar
        displayMenu={true}
        onLeftIconButtonClick={this.handleToggle}
      />
      {editChDef && (<CBoxEditChannel
        channel={channel}
        verifyLength={chDefExists}
        onChannelUpdate={(obj) => this.handleChannelUpdate(obj)}
        onLeftIconButtonClick={this.handleToggle}
      />)}
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
      {!validChDef && this.MainInitMessage(editChDef)}
      {!editChDef && !validChDef && (<Button
        variant="contained"
        className={classes.startNowButton}
        onClick={this.handleStartClick}
        color="primary"
      >{t("startNow")}
      </Button>)}
      {(!this.props.loading) && validChDef && (<FeaturedTitlesList
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        featuredTitles={this.props.featuredTitles}
        titles={titles}
        channel={channel}
        myLang={this.props.myLang}
        loadingState={loadingState}
        filter=''
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onReset={this.props.onReset}
        onSetPaused={this.handleSetPaused}
        onFeaturedTitlesUpdate={this.props.onFeaturedTitlesUpdate}
        isPaused={this.state.isPaused}
        largeScreen={largeScreen}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={curView}
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
        component={Link}
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
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onFeaturedTitlesUpdate={this.props.onFeaturedTitlesUpdate}
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
        component={Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
    </div>
  )

  Books = () => (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Link}
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
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onFeaturedTitlesUpdate={this.props.onFeaturedTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )

  Pages = () => (
    <div
      style={{height: '100%'}}
    >
      <Fab
        onClick={this.handleReturnToHome}
        color="primary"
        className={this.props.classes.floatingButton}
        component={Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Fab>
      <LiveProvider
        style={{position: 'relative', height: '100%', paddingLeft: 90}}
        code={codeExample}
        mountStylesheet={false}
        noInline={true}
      >
        <LivePreview
          style={{
            padding: 20}}/>
        <LiveEditor
          style={{
            color: 'darkblue',
            backgroundColor: 'white'}}/>
        <LiveError
          style={{
            position: 'absolute',
            bottom: 0,
            backgroundColor: 'lightpink',
            whiteSpace: 'pre-line'}}/>
      </LiveProvider>
    </div>
  )

  Training = () => (
    <div style={defaultBackgroundStyle}>
      <Fab
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Link}
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
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onFeaturedTitlesUpdate={this.props.onFeaturedTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )

  Bible = () => (<div/>)

  handleEditClose = (history) => {
    history.goBack()
  };

  handleCBoxDownload = () => {
    const {usbPath} = this.props;
    window.ipcRendererSend('download-to-usb',usbPath);
  }

  handleSnackbarClose = () => {
    this.setState({ openSnackbar: false });
  };

  handleCBoxSampleDownload = () => {
    const {t,usbPath,titles} = this.props;
    if (titles!=null){
      this.setState({
        openSnackbar: true,
        snackbarMessage: t("usbMustBeEmpty"),
      })
    } else {
      window.ipcRendererSend('download-sample-to-usb',usbPath);
    }
  }

  handleDebug = () => {
    window.ipcRendererSend('open-dev')
  }

  AddSerie = (props) => (
    <div>
      <TypeLangSelect
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        defaultLang={this.props.defaultLang}
        onClose={() => this.handleEditClose(props.history)}
        onAddTitle={this.props.onAddTitle}
        onDelete={this.handleDelete}
      />
    </div>
  )

  About = () => {
    const { t, classes } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleReturnToHome}
          className={classes.topButton}
          color="primary"
          component={Link}
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
        >{versionStr}</Typography>
      </div>
    )
  }

  Settings = () => {
    const { t, classes, channel, defaultLang } = this.props;
    const tmpValue = !isEmptyObj(channel)? channel.title : null;
    const textFieldUpdate = (str) => {
      const tmpObj = {
        title: str
      }
      if (this.props.onChannelUpdate!=null){
        this.props.onChannelUpdate(tmpObj)
      }
    }
    return (
      <div>
        <Fab
          onClick={this.handleReturnToHome}
          className={classes.topButton}
          color="primary"
          component={Link}
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
          onUpdate={textFieldUpdate}
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

  handleToggle = () => this.setState({open: !this.state.open});
  handleClose = () => this.setState({open: false});
  handleMenuSelect = () => this.setState({langOpen: true});
  handleLangClose = () => this.setState({langOpen: false});
  handleEditMode = () => {
    this.setState({
      langOpen: false,
      editMode: true,
    });
  }
  handleMenuClick = (item) => {
    this.setState({open: false});
  }

  handleNavLang = (valArr) => {
console.log(valArr)
  }

  render() {
    const { t, channel, classes } = this.props;
    const { openSnackbar, snackbarMessage } = this.state;
    const isCurPlaying = (this.props.curPlay!=null);
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
        <Switch>
          <Route exact path='/' component={this.Home}/>
          <PropsRoute path='/audio' component={this.Audio} test="test"/>
          <Route path='/music' component={this.Music}/>
          <Route path='/books' component={this.Books}/>
          <Route path='/training' component={this.Training}/>
          <Route path='/test' component={this.Test}/>
          <Route path='/bible' component={this.Bible}/>
          <Route path='/pages' component={this.Pages}/>
          <Route path='/video' component={this.VideoPlayer}/>
          <Route path='/setting' component={this.Settings}/>
          <Route path='/about' component={this.About}/>
          <Route path='/add' component={this.AddSerie}/>
        </Switch>
        <Footer
          usbPath={this.props.usbPath}
          usbHash={this.props.usbHash}
          isPaused={this.state.isPaused}
          onSetPaused={this.handleSetPaused}
          curPlay={this.props.curPlay}
          curPos={this.props.curPos}
          onPlaying={this.props.onPlaying}
          onFinishedPlaying={this.handleFinishedPlaying}
          onStopCallback={this.handleStopPlaying}/>
      </div>
    );
  }
}

/*
<div>
  <TextField
    id="mapGUID"
    label="MAP key"
    onChange={this.handleChangeGUID}
    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (GUID)"
    helperText="Please request your key from mapglobalmedia@twr.org"
    className={classes.textField}
    value={this.state.keyGUID}
  />
  <Button
    variant="contained"
    size="small"
    disabled={!this.state.changedGUID}
    onClick={this.handleSaveGUID}
    className={classes.updateButton}
  >Update</Button>
</div>
<Divider />
*/

CboxApp.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withNamespaces()(CboxApp));
