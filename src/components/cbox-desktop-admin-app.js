import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CBoxAppBar from './cbox-app-bar';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  mainMessage: {
    marginLeft: 50,
    paddingTop: 120,
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
  usbList: {
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

const bytesToSize = (bytes) => {
  const kDivisor = 1000; // or 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(kDivisor)), 10);
  if (i === 0) return bytes + ' ' + sizes[i];
  return (bytes / Math.pow(kDivisor, i)).toFixed(0) + ' ' + sizes[i];
}

class CboxDesktopAdminApp extends React.Component {
  state = {
    value: undefined,
  }

  getPathList = (usbList) => {
    let retList = [];
    const validUsbDrive = ((usbList!=null)&&(usbList.length>0));
    if (validUsbDrive){
      usbList.forEach(drive => {
        if (drive.mountpoints!=null) {
          drive.mountpoints.forEach(mnt => {
            if (mnt.path!=null){
              retList.push({
                path: mnt.path,
                name: drive.displayName,
                descr: drive.description,
                size: drive.size,
              })
            }
          })
        }
      })
    }
    return retList;
  }

  getDefaultValue = (usbList) => {
    let retValue = undefined;
    const list = this.getPathList(usbList);
    if (list.length>0){
      retValue = list[0].path;
    }
    return retValue;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.usbList !== nextProps.usbList){
      this.setState({value: this.getDefaultValue(nextProps.usbList)})
    }
  }

  componentWillMount() {
    if (this.props.usbList !== null){
      this.setState({value: this.getDefaultValue(this.props.usbList)})
    }
  }

  handleSelectPath = () => {
    if (this.state.value!=null){
      this.props.onSelectPath(this.state.value)
    }
  }

  MainInitMessage = () => {
    const { t } = this.props;
    return (
      <div className={this.props.classes.mainMessage}>
        {t('selectDrive')}
      </div>
    )
  }

  handleChange = event => {
    this.setState({ value: event.target.value });
  }

  UsbListView = () => {
    const { t, classes, usbList } = this.props;
    const validUsbDrive = ((usbList!=null)&&(usbList.length>0));
    if (validUsbDrive){
      const radioList = this.getPathList(usbList);
      return (
        <div className={classes.usbList}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">
              {t('detectedDrive', {count: usbList.length})}
            </FormLabel>
            <RadioGroup
              aria-label="usbDrive"
              name="usbDrive"
              className={classes.group}
              value={this.state.value}
              onChange={this.handleChange}
            >
              {radioList.map(choice => {
                const {path, name, descr, size} = choice;
                const labelStr = name + " (" + bytesToSize(size) + " " + descr
                                      + " → " + path + ")";
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
          {t('noUSB')}
        </div>
      )
    }
  }

  render() {
    const { t, classes, usbList, versionStr } = this.props;
    const validUsbDrive = ((usbList!=null)&&(usbList.length>0));
    return (
      <div
        id="page_container"
      >
        <CBoxAppBar
          channel={null}
          versionStr={versionStr}
          displayMenu={false}
        />
        {this.MainInitMessage()}
        {this.UsbListView()}
        {validUsbDrive && (<Button
          variant="contained"
          className={classes.continueButton}
          onClick={this.handleSelectPath}
          color="primary"
        >{t('continue')}
      </Button>)}
    </div>)
  }
}

CboxDesktopAdminApp.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withTranslation()(CboxDesktopAdminApp));
