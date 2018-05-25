import React from 'react';
import { unique } from 'shorthash';
import { isEmpty, jsonEqual, nullToEmptyStr } from '../utils/obj-functions';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ActionList from '@material-ui/icons/List';
import ImageCollections from '@material-ui/icons/Collections';
import TextField from '@material-ui/core/TextField';

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

export default class EpEntryDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataOk: false,
      changedField: false,
      allEmpty: false,
      eItem: {},
      openListDialog: false,
    }
  };

  verifyData = (eMode,dataObj,checkField) => {
    const copyItem = Object.assign({}, dataObj)
    const tmpDataOk = (copyItem.title!=null);
    const tmpAllEmpty = ( isEmpty(copyItem.title)
                        && isEmpty(copyItem.description)
                        && isEmpty(copyItem.url) );
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
      this.verifyData(false,nextProps.item);
    }
    if (nextProps.createNew){
console.log(this.props)
console.log(nextProps)
console.log(this.state.eItem)
      this.setState({ openListDialog: true});
    }
  }

  componentWillMount() {
    this.verifyData(false,this.props.item);
  }

	handleSelectImage = (x) => {
    let tmpObj = this.state.eItem;
		tmpObj.image = x;
    this.verifyData(true,tmpObj,true);
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
    this.verifyData(false,this.props.item);
    this.props.onClose()
  }

	handleClosePixDialog = () => {
		this.setState({openPixDialog: false});
	}

  handleCloseListDialog = () => {
		this.setState({openListDialog: false});
	}

  handleDelete = () => {
    this.verifyData(false,{});
console.log("delete: "+this.props.item.pathStr);
    this.props.onDelete(this.props.item.pathStr);
  }

  handleSaveListDialog = (list,curPath) => {
    const copy = Object.assign({}, this.state.eItem);
    this.setState({
      openListDialog: false,
    });
    copy.fileList=list;
    copy.curPath=curPath;
    this.verifyData(false,copy,true);
  }

  handleSave = () => {
    const {lang,filter} = this.props;
    const copy = Object.assign({}, this.state.eItem);
    if (this.props.onTitlesUpdate!=null){
      copy.language=lang;
      copy.mediaType=filter;
      this.props.onTitlesUpdate(copy);
    }
    this.props.onSave(copy)
	}

  onFieldChange(event,inputName) {
    let tmpObj = this.state.eItem;
    tmpObj[inputName] = event.target.value;
    this.verifyData(true,tmpObj,true);
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
    const { backgroundColor, filter, createNew } = this.props;
    const { eItem, changedField } = this.state;
    return (
      <Dialog
        open={this.props.open}
        disableBackdropClick
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
        style={{backgroundColor}}
      >
        <DialogTitle id="episodes-title">New Episode</DialogTitle>
        <DialogContent>
          {this.renderTextField("URL","Internet link","url")}
          {this.renderTextField("Title","Main title","title")}
          {this.renderTextField("Description","Short description","descr")}
          <br/>
          <br/>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="raised"
            onClick={this.handleClose}>
            Cancel
          </Button>
          {((eItem!=null) || (changedField))
            && (<Button
              color="primary"
              variant="raised"
              disabled={(eItem.title==null)||(eItem.title.length<=0)}
              onClick={this.handleSave}>
              Add
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}
