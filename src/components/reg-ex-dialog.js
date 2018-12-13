import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { nullToEmptyStr } from '../utils/obj-functions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import {iso639Langs} from '../iso639-1-full.js'
import { withNamespaces } from 'react-i18next';
import i18n from 'i18next';

const styles = {
  card: {
    height: '100%',
  },
  dialog: {
    width: 500,
    minWidth: 400,
    zIndex: 2000,
  },
  radioButton: {
    marginTop: 16,
  },
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  dropdownlabel: {
  },
  textField: {
    width: '85%',
    minWidth: 180,
  },
  helpHeader: {
    paddingBottom: 20,
    paddingLeft: 16,
    fontSize: 14,
    fontWeight: 200,
    color: "grey",
    fontFamily: "Roboto, sans-serif",
  },
  groupHeader: {
    display: 'flex',
    paddingTop: 20,
  },
  seriesModeIcon: {
    right: -20,
  },
  icon: {
    width: 40,
    height: 40,
  },
  button: {
    marginLeft: 20,
  },
  buttonLabelOn: {
    whiteSpace: "nowrap",
  },
  buttonLabelOff: {
    whiteSpace: "nowrap",
    color: "rgba(0, 0, 0, 0.770588)",
  },
  textFieldNumber: {
    paddingLeft: 20,
  },
  checkboxLabel: {
    whiteSpace: "nowrap",
    color: "rgba(0, 0, 0, 0.770588)"
  },
  checkbox: {
    marginLeft: 20,
    width: "auto",
    maxWidth: "50%",
  },
  selectedmenuitem: {
    color: "red",
    fontWeight: 500,
    backgroundColor: "lightcyan"
  },
  info:{
    float: 'right',
    color: 'grey',
    top: 7,
    right: 15,
    position: 'relative',
    heigth: 25,
    width: 25,
  }
};

class RegExDialog extends React.Component {
  state = {
    regExPath: "",
    dataOk: false,
    changedField: false,
    multiline: 'Controlled',
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.orgPath !== nextProps.orgPath){
      this.setState({
        regExPath: nextProps.orgPath
      });
    }
  }

  componentWillMount() {
    if (this.props.orgPath != null){
      this.setState({
        regExPath: this.props.orgPath
      });
    }
  }

	handleImport = () => {
  }

	handleClose = () => {
    this.props.onClose()
  }

  handleSave = () => {
    const {regExPath} = this.state;
    if (this.props.onSaveRegEx!=null){
      this.props.onSaveRegEx(regExPath);
    }
    this.props.onClose()
	}

  onRegExChange(event) {
    this.setState({
      regExPath: event.target.value
    });
  }

  onCheck(event,isChecked,inputName) {
  }

  render() {
    const { t, usbPath, lang } = this.props;
    const { changedField } = this.state;

    let langStr = "undefined";
    if (lang!=null){
      langStr = iso639Langs[lang].name;
    }
    const canSave = false;
    const tmpStr=nullToEmptyStr(this.state.regExPath)
    const checkRegEx = /[^/]+/g
    const matches = tmpStr.match(checkRegEx);
console.log(matches)
console.log(i18n)
    return (
      <Dialog
        open={this.props.open}
        disableBackdropClick
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogContent>
          <Typography
            type="title"
          >{t("language")}: {langStr}</Typography>
          <TextField
            id="outlined-select-currency"
            style={styles.textField}
            select
            placeholder={t("hintRegEx")}
            label={t("editRegEx")}
            value={this.state.currency}
            onChange={this.handleChange('currency')}
            SelectProps={{
              MenuProps: {
//                className: classes.menu,
              },
            }}
            helperText="Please select your currency"
            margin="normal"
            variant="outlined"
          >
            {matches.map(match => (
              <MenuItem key={match} value={match}>
                {match}
              </MenuItem>
            ))}
          </TextField>
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
              disabled={(!canSave)}
              onClick={this.handleSave}>
              {t("save")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

RegExDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withNamespaces()(RegExDialog));
