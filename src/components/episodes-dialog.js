import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import path from 'path';
import { unique } from 'shorthash';
import { getRelPath,
          getFileName, getAllFiles } from '../utils/file-functions';
import { isPathInsideUsb, getLocalMediaFName } from '../utils/obj-functions';
import Button from '@material-ui/core/Button';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListSubheader from '@material-ui/core/ListSubheader';
import Snackbar from '@material-ui/core/Snackbar';
import RegExDialog from './reg-ex-dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Regex } from 'mdi-material-ui';
import update from 'immutability-helper';
import ReactDataGrid from 'react-data-grid';
//import { Formatters } from 'react-data-grid-addons';
import { withNamespaces } from 'react-i18next';

const styles = theme => ({
  dialog: {
    width: 500,
    minWidth: 400,
    zIndex: 2000,
  },
  subheader: {
    fontSize: 16,
    fontWeight: 400,
    paddingRight: 0,
    color: "rgba(0, 0, 0, 0.770588)",
    fontFamily: "Roboto, sans-serif",
  },
  close: {
    width: 10,
    height: 10,
  },
  groupHeader: {
    display: 'flex',
    paddingTop: 10,
  },
  dialogTitle: {
    paddingTop: 60,
  },
  button: {
  },
})

const validExtList = (typeStr) => {
  const tmpValidList = {
    'aud': ['mp3'],
    'epub': ['opf'],
    'html': ['html'],
    'vid': ['mp4'],
  }
  let retList = [];
  if (tmpValidList[typeStr]!=null){
    retList=tmpValidList[typeStr]
  }
  return retList
}

//const { ImageFormatter } = Formatters;

class EpisodesDialog extends React.Component {
  constructor(props) {
    super(props);
    const { selectedIndexes} = props;
    this.onRowsSelected.bind(this);
    this.onRowsDeselected.bind(this);
    this.state = { selectedIndexes }
    this._columns = [
      {
        key: 'id',
        width: 80,
        defaultChecked: true
      },
      {
        key: 'title',
        editable: true
      },
      {
        key: 'descr',
        editable: true
      },
/*
      {
        key: 'image',
        formatter: ImageFormatter,
        editable: false
      },
*/
      {
        key: 'fname',
        editable: false
      },
    ];

    this.state = {
      openSnackbar: false,
      openRegEx: false,
      snackbarMessage: "",
      changedField: false,
      allEmpty: false,
      rows: [],
      selectedIndexes: [],
      curList: [],
      curPath: undefined,
    }
  };

  updateRows = (curList) => {
    let selectedIndexes = [];
    if (curList!=null) {
      let rows = curList.map((item,i) => {
        selectedIndexes.push(i)
        let image = undefined;
        if ((item.image!=null)&&(item.image.origin==="Local")) {
          const {usbPath} = this.props;
          image = getLocalMediaFName(usbPath,item.image.filename);
        }
        return {
          id: i+1,
          title: item.title,
          descr: item.descr,
          image,
          fname: getFileName(item.filename),
        }
      })
      this.setState({ rows, curList, selectedIndexes });
    }
  }

  componentDidMount = () => {
    const {epList, curPath, createNew} = this.props;
    if (epList!=null){
console.log(epList)
      this.updateRows(epList)
    }
    if (curPath!=null){
      this.setState({curPath})
    }
    if (createNew){
      setTimeout(() => {this.handleSelectFolder()}, 0);
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const {epList, curPath, createNew } = nextProps;
    if ((epList!=null)&&(epList!==this.props.epList)){
console.log(epList)
      this.updateRows(epList)
    }
    if ((curPath!==this.props.curPath)){
      this.setState({curPath})
    }
    if (createNew && !this.props.createNew){
      setTimeout(() => {this.handleSelectFolder()}, 0);
    }
  }

  handleSave = () => {
    if (this.props.onSave!=null){
      const copy = this.state.curList.filter((item,i) => {
        return (this.state.selectedIndexes.indexOf(i)>=0)
      }).map((item,i) => {
        const tempCopy = this.state.rows[i];
        return {
          id: i,
          title: tempCopy.title,
          descr: tempCopy.descr,
          image: item.image,
          filename: item.filename,
        }
      });
      const curPath = this.state.curPath;
      if (curPath!=null){
console.log(curPath)
console.log(unique(curPath))
        this.props.onSave(copy,curPath);
      }
    }
	}

  renderHeader = (headerStr) => {
    const {classes} = this.props;
    return <ListSubheader className={classes.subheader}>{headerStr}</ListSubheader>
  }

  rowGetter = (i) => {
    return this.state.rows[i];
  };

  getColumns = () => {
    const {t} = this.props;
    return this._columns.map(column => {
      const resObj = {}
      Object.keys(column).forEach(k => resObj[k] = column[k]);
      resObj.name = t(column.key)
      return resObj;
    })
  }

  handleGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    let rows = this.state.rows.slice();
    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i];
      let updatedRow = update(rowToUpdate, {$merge: updated});
      rows[i] = updatedRow;
    }
    this.setState({ rows });
  }

  onRowsSelected = (rows) => {
    this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))});
  };

  onRowsDeselected = (rows) => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1 )});
  };

  getAllFilesInfo = async (pathName) => {
    const filenamesArr = pathName && await getAllFiles(pathName);
    const fileStatArr = filenamesArr.map(file => {
      return {
        filePath: file.filePath ,
        isDirectory: file.isDirectory,
      }
    });
    return Promise.resolve(fileStatArr);
  };

  verifiedExt = (extStr) => {
    let checkStr = extStr.substring(1,extStr.length);
    const tmpValidExtList = validExtList(this.props.filter);
    return (tmpValidExtList.findIndex(item => checkStr.toLowerCase() === item.toLowerCase())>=0);
  }

  setFilelist = (checkFiles) => {
    let validFiles = checkFiles.filter(file => {
      return this.verifiedExt(path.extname(file.filePath))
    }).map((item,i) => {
      return {
        id: i,
        filename: getRelPath(this.props.usbPath,item.filePath)
      }
    });
console.log(validFiles)
    this.updateRows(validFiles)
  };

  getFiles = (pathName) => {
    if ((pathName!=null)&&(pathName.length>0)&&(path.basename(pathName)!==".")){
      this.getAllFilesInfo(pathName)
        .then(files => this.setFilelist(files,pathName))
        .catch(console.error);
    }
  }

  handleRegEx = () => {
    const { curPath } = this.state;
console.log(curPath)
    this.setState({
      openRegEx: true,
    })
  }

  handleSelectFolder = () => {
    const {t, usbPath} = this.props;
    const resObj = window.showOpenDialog({
        defaultPath: usbPath,
        buttonLabel: t("setPath"),
        properties: [
            'openDirectory', (fileNames) => {
              if(fileNames === undefined){
                  console.log("No file selected");
                  return;
              }
              console.log(fileNames);
            }
        ]
    });
    if (resObj!=null){
      const checkStr = resObj[0];
      const relCheckStr = getRelPath(usbPath,checkStr);
      if (!isPathInsideUsb(checkStr,usbPath)) {
        const errMsgStr = t("pathErrMsg1") + " (" + this.props.usbPath + ") " +t("pathErrMsg2");
        this.setState({
          snackbarMessage: errMsgStr,
          openSnackbar: true,
        })
      } else {
        this.setState({curPath: relCheckStr})
        this.getFiles(checkStr)
      }
    }
  }

  handleSnackbarClose = () => {
    this.setState({ openSnackbar: false });
  };

  handleRegExClose = () => {
    this.setState({ openRegEx: false });
  };

  handleRegExSave = () => {
console.log("Save RegEx")
  };

/*
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
*/

  render() {
    const useColumns = this.getColumns();
    const { t, classes} = this.props;
    const { curPath,
              openSnackbar, snackbarMessage } = this.state;
    const listActions = [
      <Button
        key="close"
        color="primary"
        variant="contained"
        onClick={this.props.onClose}>
        {t("cancel")}
      </Button>,
      <Button
        key="save"
        color="primary"
        variant="contained"
        onClick={this.handleSave}>
        {t("ok")}
      </Button>
    ];
    const regExEnabled = false; // not yet fully implemented
    return (
      <Dialog
        fullScreen
        disableBackdropClick
        disableEscapeKeyDown
        onClose={this.props.onClose}
        open={this.props.open}
      >
        <div className={classes.groupHeader}>
          {this.renderHeader(t("path"))}
          {(curPath!=null) && regExEnabled &&
            <Button
              className={classes.button}
              onClick={this.handleRegEx}>
              <Regex/>
            </Button>
          }
          {(curPath!=null) && this.renderHeader(curPath)}
          <IconButton
            className={classes.button}
            color="primary"
            onClick={this.handleSelectFolder}>
            <FolderOpen/>
          </IconButton>
        </div>
        <DialogTitle
          className={classes.dialogTitle}
          id="episodes-title">{t("episode",{count: 100})}
        </DialogTitle>
        <ReactDataGrid
          rowKey='id'
          enableCellSelect={true}
          columns={useColumns}
          rowSelection={{
            showCheckbox: true,
            enableShiftSelect: true,
            onRowsSelected: this.onRowsSelected,
            onRowsDeselected: this.onRowsDeselected,
            selectBy: {
              indexes: this.state.selectedIndexes
            }
          }}
          rowGetter={this.rowGetter}
          rowsCount={this.state.rows.length}
          minHeight={500}
          onGridRowsUpdated={this.handleGridRowsUpdated}
        />
        <DialogActions>{listActions}</DialogActions>
        {regExEnabled && (<RegExDialog
          usbPath={this.props.usbPath}
          open={this.state.openRegEx}
          orgPath={curPath}
          lang={"eng"}
          onClose={this.handleRegExClose}
          onSaveRegEx={this.handleRegExSave}
        />)}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={openSnackbar}
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
      </Dialog>
    );
  }
}

EpisodesDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withNamespaces()(EpisodesDialog));
