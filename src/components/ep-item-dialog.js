import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { getImgOfObj, isEmpty, jsonEqual, nullToEmptyStr } from '../utils/obj-functions';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ImageCollections from '@material-ui/icons/Collections';
import TextField from '@material-ui/core/TextField';
import TranslateIcon from '@material-ui/icons/Translate';
import ImgGrid from './img-grid';
import Typography from '@material-ui/core/Typography';
import {iso639Langs} from '../iso639-1-full.js'
import { withNamespaces } from 'react-i18next';

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
  image: {
    margin: '18px 0 0 24px',
    maxWidth: 180,
    maxHeight: 180,
    width: "auto",
    height: "auto"
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

class EpItemDialog extends React.Component {
  state = {
    eItem: {},
    dataOk: false,
    allEmpty: false,
    changedField: false,
  }

  getEp = (serObj) => {
    let retObj = undefined;
    const { epInx } = this.props;
    if ((serObj!=null)&&(serObj.fileList!=null)&&(serObj.fileList.length>epInx)) {
      retObj = serObj.fileList[epInx];
    }
    return retObj
  }

  verifyData = (dataObj,checkField) => {
    let copyItem = {};
    if (dataObj!=null){
      copyItem = JSON.parse(JSON.stringify(dataObj));
    }
    const checkEp = this.getEp(copyItem)
    const tmpDataOk = ( (checkEp!=null)
                      && (checkEp.image!=null)
                      && (checkEp.mediaType!=null)
                      && (checkEp.title!=null)
                      && (checkEp.language!=null) );
    const tmpAllEmpty =  (checkEp==null)
                      || ( isEmpty(checkEp.image)
                        && isEmpty(checkEp.mediaType)
                        && isEmpty(checkEp.title)
                        && isEmpty(checkEp.description)
                        && isEmpty(checkEp.language) );
    const tmpChangedField = ( checkField
                                && !isEmpty(this.getEp(this.props.item))
                                && !jsonEqual(checkEp,this.getEp(this.props.item)) );
    this.setState({
      eItem: copyItem,
      dataOk: tmpDataOk,
      allEmpty: tmpAllEmpty,
      changedField: tmpChangedField,
    });
/*
    if (this.props.onEditModeChange!=null){
      this.props.onEditModeChange(eMode)
    }
*/
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item !== nextProps.item){
      this.verifyData(nextProps.item);
    }
  }

  componentWillMount() {
    this.verifyData(this.props.item);
  }

	handleSelectImage = (x) => {
    let tmpSer = this.state.eItem;
    let tmpObj = this.getEp(tmpSer);
		tmpObj.image = x;
    this.verifyData(tmpSer,true);
    this.setState({openPixDialog: false});
	}

  handleOpenPixDialog = () => {
		this.setState({openPixDialog: true});
  }

	handleImport = () => {
  }

	handleClose = (ev) => {
    ev.stopPropagation();
    this.verifyData(this.props.item);
    this.props.onClose()
  }

	handleClosePixDialog = () => {
		this.setState({openPixDialog: false});
	}

  handleSave = () => {
    const {lang,filter,isSelectedSerie} = this.props;
    const {eItem} = this.state;

    const copy = Object.assign({}, eItem);
    if (this.props.onAddTitle!=null){
      copy.language = lang;
      copy.mediaType=filter;
console.log(eItem)
console.log(this.props)
      this.props.onAddTitle(copy,isSelectedSerie);
    }
    this.props.onClose()
	}

  onFieldChange(event,inputName) {
    let tmpSer = this.state.eItem;
    let tmpObj = this.getEp(tmpSer);
    if (tmpObj!=null){
      tmpObj[inputName] = event.target.value;
      this.verifyData(tmpSer,true);
    }
  }

  onCheck(event,isChecked,inputName) {
    let tmpObj = this.state.eItem;
    tmpObj[inputName] = isChecked;
    this.setState({
      eItem: tmpObj
    });
  }

  renderCheckBox = (textStr,field) => {
    return (
      <FormGroup row>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.eItem[field]}
              onChange={(e, checked) => this.onCheck(e, checked, field)}
              value={field}
            />
          }
          label={textStr}
        />
      </FormGroup>
    )
  }

  renderTextField = (label,hint,field,errorText) => {
    const checkEp = this.getEp(this.state.eItem);
    let valStr = "";
    if (checkEp!=null) {
      valStr = checkEp[field]
    }
    return (
      <TextField
        value={nullToEmptyStr(valStr)}
        onChange={(e) => this.onFieldChange(e, field)}
        style={styles.textField}
        margin="dense"
        placeholder={hint}
        label={label}
      />
    )
  };

  render() {
    const { t, backgroundColor, usbPath, lang } = this.props;
    const { eItem, changedField } = this.state;
    const checkEp = this.getEp(eItem);

    let imgSrc = "";
    if ((checkEp!=null)&&(checkEp.image!=null)){
      imgSrc = getImgOfObj(usbPath,checkEp);
    } else if (eItem!=null){
      imgSrc = getImgOfObj(usbPath,eItem);
    }
    let langStr = "undefined";
    if (lang!=null){
      langStr = iso639Langs[lang].name;
    }
    const hasTranslations = false;
    return (
      <Dialog
        open={this.props.open}
        disableBackdropClick
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
        style={{backgroundColor}}
      >
        {(checkEp!=null) && (<img src={imgSrc} alt={checkEp.title} style={styles.image}/>)}
        <DialogContent>
          <Typography
            type="title"
          >{t("language")}: {langStr}</Typography>
          {this.renderTextField(t("title"),t("mainTitle"),"title")}
          {this.renderTextField(t("description"),t("descr"),"descr")}
          <CardActions>
            {hasTranslations && (
              <Button
                color="primary"
//                onClick={this.handleOpenListDialog}
              >
                <TranslateIcon />
              </Button>
            )}
            <Button
              color="primary"
              onClick={this.handleOpenPixDialog}>
              <ImageCollections />
            </Button>
          </CardActions>
					{this.state.openPixDialog
            && (<ImgGrid
              usbPath={this.props.usbPath}
              usbHash={this.props.usbHash}
              open={true}
              onClose={this.handleClosePixDialog}
              onSave={this.handleSelectImage}
            />)}
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleClose}>
            {t("cancel")}
          </Button>
          {((checkEp!=null) || (changedField))
            && (<Button
              color="primary"
              variant="contained"
              disabled={(checkEp.title==null)||(checkEp.title.length<=0)}
              onClick={this.handleSave}>
              {t("save")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

EpItemDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withNamespaces()(EpItemDialog));
