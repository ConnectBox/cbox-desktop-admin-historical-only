import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { getImgOfObj, isEmpty, jsonEqual, nullToEmptyStr } from '../utils/obj-functions';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ActionList from '@material-ui/icons/List';
import ImageCollections from '@material-ui/icons/Collections';
import TextField from '@material-ui/core/TextField';
import TranslateIcon from '@material-ui/icons/Translate';
import ImgGrid from './img-grid';
import EpisodesDialog from './episodes-dialog';
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
};

class MetadataConfigDialog extends React.Component {
  state = {
    eItem: {},
    dataOk: false,
    allEmpty: false,
    changedField: false,
    openListDialog: false,
    epDialogHandled: false,
  }

  verifyData = (dataObj,checkField) => {
    let copyItem = {};
    if (dataObj!=null){
      copyItem = JSON.parse(JSON.stringify(dataObj));
    }
    const tmpDataOk = ( (copyItem.image!=null)
                      && (copyItem.mediaType!=null)
                      && (copyItem.title!=null)
                      && (copyItem.language!=null) );
    const tmpAllEmpty = ( isEmpty(copyItem.image)
                        && isEmpty(copyItem.mediaType)
                        && isEmpty(copyItem.title)
                        && isEmpty(copyItem.description)
                        && isEmpty(copyItem.language) );
    const tmpChangedField = ( checkField
                                && !isEmpty(this.props.item)
                                && !jsonEqual(copyItem,this.props.item) );
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
    if ((nextProps.createNew)&&(!this.state.epDialogHandled)) {
      this.setState({
        openListDialog: true,
        epDialogHandled: true,
      });
    }
  }

  componentWillMount() {
    const {createNew} = this.props;
    if ((createNew)&&(!this.state.epDialogHandled)) {
      this.setState({
        openListDialog: true,
        epDialogHandled: true,
      });
    }
    this.verifyData(this.props.item);
  }

	handleSelectImage = (x) => {
    let tmpObj = this.state.eItem;
		tmpObj.image = x;
    this.verifyData(tmpObj,true);
    this.setState({openPixDialog: false});
	}

  handleOpenPixDialog = () => {
		this.setState({openPixDialog: true});
  }

  handleOpenListDialog = () => {
    this.setState({ openListDialog: true});
  }

	handleImport = () => {
  }

	handleClose = () => {
    this.verifyData(this.props.item);
    this.setState({epDialogHandled: false});
    this.props.onClose()
  }

	handleClosePixDialog = () => {
		this.setState({openPixDialog: false});
	}

  handleCloseListDialog = () => {
		this.setState({openListDialog: false});
    this.handleClose()
	}

  handleSaveListDialog = (list,curPath) => {
    const copy = Object.assign({}, this.state.eItem);
    this.setState({
      openListDialog: false,
    });
    copy.fileList=list;
    copy.curPath=curPath;
    this.verifyData(copy,true);
console.log(copy)
  }

  handleSave = () => {
    const {lang,filter,isSelectedSerie} = this.props;
    const {eItem} = this.state;

    const copy = Object.assign({}, eItem);
    if (this.props.onAddTitle!=null){
      copy.language = lang;
      copy.mediaType=filter;
      this.props.onAddTitle(copy,isSelectedSerie);
    }
    this.setState({epDialogHandled: false});
    this.props.onClose()
	}

  onFieldChange(event,inputName) {
    let tmpObj = this.state.eItem;
    tmpObj[inputName] = event.target.value;
    this.verifyData(tmpObj,true);
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
              color="primary"
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
    return (
      <TextField
        value={nullToEmptyStr(this.state.eItem[field])}
        onChange={(e) => this.onFieldChange(e, field)}
        style={styles.textField}
        margin="dense"
        placeholder={hint}
        label={label}
      />
    )
  };

  render() {
    const { t, backgroundColor, filter, createNew, usbPath, lang } = this.props;
    const { eItem, changedField } = this.state;

    const isList = (eItem!=null)&&(eItem.fileList!=null);
    let badgeCnt = 0;
    let imgSrc = "";
    if (eItem!=null){
      if (eItem.fileList!=null){
        badgeCnt = eItem.fileList.length;
      }
      imgSrc = getImgOfObj(usbPath,eItem);
    }
    let langStr = "undefined";
    if (lang!=null){
      langStr = iso639Langs[lang].name;
    }
    const isBook = (filter==="epub")
    const hasTranslations = false;
    return (
      <Dialog
        open={this.props.open}
        disableBackdropClick
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
        style={{backgroundColor}}
      >
        {(eItem!=null) && (<img src={imgSrc} alt={eItem.title} style={styles.image}/>)}
        <DialogContent>
          <Typography
            type="title"
          >{t("language")}: {langStr}</Typography>
          {this.renderTextField(t("title"),t("mainTitle"),"title")}
          {this.renderTextField(t("description"),t("descr"),"description")}
          {isBook && this.renderCheckBox(t("readOL"),"readOL")}
          <CardActions>
            {hasTranslations && (
              <Button
                color="primary"
  //              onClick={this.handleOpenListDialog}
              >
                <TranslateIcon />
              </Button>
            )}
            <Button
              color="primary"
              onClick={this.handleOpenPixDialog}>
              <ImageCollections />
            </Button>
            {(!isList)||(badgeCnt===0)
            ? (<Button
                color="primary"
                onClick={this.handleOpenListDialog}>
                <ActionList />
              </Button>)
            : (<Badge
              badgeContent={badgeCnt}
            >
              <Button
                color="primary"
                onClick={this.handleOpenListDialog}>
                <ActionList />
              </Button>
            </Badge>)}
          </CardActions>
					{this.state.openPixDialog
            && (<ImgGrid
              usbPath={this.props.usbPath}
              usbHash={this.props.usbHash}
              open={true}
              onClose={this.handleClosePixDialog}
              onSave={this.handleSelectImage}
            />)}
          {this.state.openListDialog
            && (<EpisodesDialog
              usbPath={this.props.usbPath}
              usbHash={this.props.usbHash}
              onClose={this.handleCloseListDialog}
              onSave={this.handleSaveListDialog}
              filter={filter}
              epList={eItem.fileList}
              curPath={eItem.curPath}
              createNew={createNew}
              open={true}
            />)}
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleClose}>
            {t("cancel")}
          </Button>
          {((eItem!=null) || (changedField))
            && (<Button
              color="primary"
              variant="contained"
              disabled={(eItem.title==null)||(eItem.title.length<=0)}
              onClick={this.handleSave}>
              {t("save")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

MetadataConfigDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withNamespaces()(MetadataConfigDialog));
