import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Footer from './footer'
import CBoxAppBar from './cbox-app-bar';
import CBoxEditAppBar from './cbox-edit-app-bar';
import CboxMenuList from './cbox-menu-list';
import { isEmptyObj } from '../utils/obj-functions';
import { NavLangSelect, LanguageSelect } from './language-select';
import { CboxTextField } from './cbox-text-field';
import Typography from '@material-ui/core/Typography';
import { Switch, Route, Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import MyTitlesList from './my-titles-list.js';
import TypeLangSelect from './type-lang-select';
import MediaStore from './media-store.js';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import verge from 'verge';
import {iso639Langs} from '../iso639-1-full.js'
import 'react-select/dist/react-select.css';
import {loadingStateValue} from '../utils/config-data';

const defaultBackgroundStyle = {
  height: 'auto',
  minHeight: '100%',
  background: 'black'
};

const styles = theme => ({
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
      <Button
        variant="fab"
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Button>
      <MediaStore
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        myTitles={this.props.myTitles}
        titles={this.props.titles}
        myLang={this.props.myLang}
        languages={this.props.languages}
        filter='vid'
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onMyTitlesUpdate={this.props.onMyTitlesUpdate}
        onAddTitle={this.props.onAddTitle}
        onDeleteTitle={this.props.onDeleteTitle}
        isPaused={this.state.isPaused}
        curPlay={this.props.curPlay}
        curPos={this.props.curPos}
        curView={this.props.curView}
      />
    </div>
  )

  MainInitMessage = () => {
    return (
      <div className={this.props.classes.mainMessage}>
        Create a media channel
      </div>
    )
  }

// ToDo: -> ASAP enable write access and then change text to:
// Share your media channel
  Home = () => {
    const { classes, loadingState, titles, curView,
            channel, percentList, percentDownload,
            progressTextList, progressTextDownload } = this.props;
    const largeScreen = (this.state.containerWidth>=768);
    const chDefExists = ((channel!=null)
                        && (channel.title!=null));
    const validChDef = (chDefExists
                        && (channel.title.length>2));
    const editChDef = this.state.chEditMode || (!validChDef && chDefExists);
    return (
    <div style={(curView!=null)? defaultBackgroundStyle : null}>
      {!editChDef && (<CBoxAppBar
        channel={channel}
        displayMenu={true}
        onLeftIconButtonClick={this.handleToggle}
      />)}
      {editChDef && (<CBoxEditAppBar
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
      {!validChDef && this.MainInitMessage()}
      {!editChDef && !validChDef && (<Button
        variant="raised"
        className={classes.startNowButton}
        onClick={this.handleStartClick}
        color="primary"
      >Start Now
      </Button>)}
      {(!this.props.loading) && validChDef && (<MyTitlesList
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        myTitles={this.props.myTitles}
        titles={titles}
        myLang={this.props.myLang}
        loadingState={loadingState}
        filter=''
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onReset={this.props.onReset}
        onSetPaused={this.handleSetPaused}
        onMyTitlesUpdate={this.props.onMyTitlesUpdate}
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
      <Button
        variant="fab"
        onClick={this.handleReturnToHome}
        className={this.props.classes.floatingButton}
        color="primary"
        component={Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Button>
      <MediaStore
        usbPath={this.props.usbPath}
        usbHash={this.props.usbHash}
        myTitles={this.props.myTitles}
        titles={this.props.titles}
        myLang={this.props.myLang}
        languages={this.props.languages}
        filter='aud'
        fullList
        onSelectView={this.props.onSelectView}
        onPlayNext={this.props.onPlayNext}
        onStartPlay={this.handleStartPlay}
        onSetPaused={this.handleSetPaused}
        onMyTitlesUpdate={this.props.onMyTitlesUpdate}
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
      <Button variant="fab"
        onClick={this.handleReturnToHome}
        secondary={true}
        className={this.props.classes.floatingButton}
        component={Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Button>
    </div>
  )

  Books = () => (
    <div/>
  )

  Trainng = () => (<div/>)

  Bible = () => (<div/>)

  handleEditClose = (history) => {
    history.goBack()
  };

  handleCBoxDownload = () => {
    const {usbPath} = this.props;
    window.ipcRendererSend('download-to-usb',usbPath);
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

  About = () => (
    <div>
      <Button variant="fab"
        onClick={this.handleReturnToHome}
        className={this.props.classes.topButton}
        color="primary"
        component={Link}
        to='/'
      >
        <ChevronLeftIcon />
      </Button>
      <Divider />
      <Typography
        type="title"
        color="inherit"
        className={this.props.classes.aboutMainTitle}
      >ConnectBox Desktop Admin</Typography>
      <Typography
        type="title"
        className={this.props.classes.aboutTitle}
      >Admin Application for configuring a ConnectBox</Typography>
      <Typography
        type="title"
        className={this.props.classes.aboutTitle}
      >Version 2.02</Typography>
    </div>
  )

  Settings = () => {
    const { classes, channel } = this.props;
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
        <Button
          variant="fab"
          onClick={this.handleReturnToHome}
          className={classes.topButton}
          color="primary"
          component={Link}
          to='/'
        >
          <ChevronLeftIcon />
        </Button>
        <Divider />
        <CboxTextField
          id="channel_name"
          label="Channel name"
          verifyLength={true}
          defaultValue={tmpValue}
          onUpdate={textFieldUpdate}
        />
        <Divider />
        <Typography
          type="title"
          color="inherit"
          className={classes.menuTitle}
        >Navigation language:</Typography>
        <NavLangSelect
          languages={["eng"]}
          onSelectUpdate={this.handleNavLang}
        />
        <Divider />
        <Typography
          type="title"
          color="inherit"
          className={classes.menuTitle}
        >Media content languages:</Typography>
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
        >Default initial languages:</Typography>
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
        >Install latest ConnectBox static host files on USB: {this.props.usbPath}</Typography>
        <Button
          variant="raised"
          size="small"
          onClick={this.handleCBoxDownload}
          className={classes.downloadButton}
        >
          <DownloadIcon/>
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
    const { channel } = this.props;
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
        <Switch>
          <Route exact path='/' component={this.Home}/>
          <PropsRoute path='/audio' component={this.Audio} test="test"/>
          <Route path='/music' component={this.Music}/>
          <Route path='/books' component={this.Books}/>
          <Route path='/training' component={this.Trainng}/>
          <Route path='/bible' component={this.Bible}/>
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
    variant="raised"
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

export default withStyles(styles, { withTheme: true })(CboxApp);
