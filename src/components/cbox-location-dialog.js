import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CBoxAppBar from './cbox-app-bar';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withTranslation } from 'react-i18next';
import {getNormalizedPath, pathExistsAsync} from '../utils/file-functions'

const styles = theme => ({
  mainMessage: {
    marginLeft: 50,
    paddingTop: 90,
    maxWidth: 720,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 55,
  },
  usbMessage: {
    marginLeft: 60,
    paddingTop: 15,
    maxWidth: 720,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 18,
  },
  locationList: {
    marginLeft: 60,
    paddingTop: 22,
    maxWidth: 720,
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 18,
  },
  continueButton: {
    marginTop: 25,
    marginLeft: 80,
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
  title: {
    cursor: 'pointer',
  },
});

class CboxLocationDialog extends React.Component {
  state = {
    openRUsure: false,
    value: undefined,
  }

  getDefaultValue = (locationList) => {
    let retValue = undefined;
    if (locationList.length>0){
      retValue = locationList[0].path;
    }
    return retValue;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.locationList !== nextProps.locationList){
      this.setState({value: this.getDefaultValue(nextProps.locationList)})
    }
  }

  componentWillMount() {
    if (this.props.locationList !== null){
      this.setState({value: this.getDefaultValue(this.props.locationList)})
    }
  }

  handleSelectPath = async () => {
    const {usbPath} = this.props;
    let foundSharedDir = false;
    if ((this.state.value==null)||(this.state.value!=="/")){
console.log("check LibraryBox")
      if (this.state.value==="/LibraryBox/Content/"){
console.log(this.state.value)
const checkFName = getNormalizedPath(usbPath + "/LibraryBox/Shared/");
        foundSharedDir = await pathExistsAsync(checkFName);
      }
    }
    if (foundSharedDir){
console.log("found Shared")
      this.setState({openRUsure: true})
    } else {
      this.props.onSelectPath(this.state.value)
    }
  }

  handleClose = () => {
    this.setState({openRUsure: false})
  }

  handleContinue = () => {
    const {usbPath} = this.props;
console.log(usbPath)
    if (this.state.value!=null){
console.log(this.state.value)
      window.ipcRendererSend('move-from-librarybox',usbPath);
      this.props.onSelectPath(this.state.value)
    }
  }

  MainInitMessage = () => {
    const {t} = this.props;
    return (
      <div className={this.props.classes.mainMessage}>
        {t("selectInstall")}
      </div>
    )
  }

  handleChange = event => {
    this.setState({ value: event.target.value });
  }

  locationListView = () => {
    const { t, classes, locationList } = this.props;
    const validLocationList = ((locationList!=null)&&(locationList.length>0));
    if (validLocationList){
      const radioList = locationList;
      return (
        <div className={classes.locationList}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">
              {t("detectedLocations")}
            </FormLabel>
            <RadioGroup
              aria-label="LocationList"
              name="LocationList"
              className={classes.group}
              value={this.state.value}
              onChange={this.handleChange}
            >
              {radioList.map(choice => {
                const {path, name} = choice;
                const labelStr = name + " → " + path;
                return (
                  <FormControlLabel
                    key={path}
                    value={path}
                    control={<Radio color="primary"/>}
                    label={labelStr} />
                )
              })}
            </RadioGroup>
          </FormControl>
        </div>
      )
    } else {
      return (
        <div className={this.props.classes.usbMessage}>
          {t("prepInstallLoc")}
          <CircularProgress
            className={classes.progress}
            size={65} />
        </div>
      )
    }
  }

  render() {
    const { t, classes, locationList } = this.props;
    const changedField = true;
    const validLocationList = ((locationList!=null)&&(locationList.length>0));
    return (
      <div
        id="page_container"
      >
        <CBoxAppBar
          channel={null}
          displayMenu={false}
        />
        {this.MainInitMessage()}
        {this.locationListView()}
        {validLocationList && (<Button
          variant="contained"
          className={classes.continueButton}
          onClick={this.handleSelectPath}
          color="primary"
        >
         {t("continue")}
      </Button>)}
      <Dialog
        open={this.state.openRUsure}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="episodes-title">{t("incompatibilityWarning")}</DialogTitle>
        <DialogContent>
          <br/>{t("moveSharedFolder")}
          <br/>{t("rUSureInstall")}
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleClose}>
            {t("cancel")}
          </Button>
          {(changedField)
            && (<Button
              color="primary"
              variant="contained"
              disabled={false}
              onClick={this.handleContinue}>
              {t("continue")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>)
  }
}

CboxLocationDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withTranslation()(CboxLocationDialog));
