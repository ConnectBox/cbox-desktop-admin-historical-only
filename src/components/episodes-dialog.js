import React from 'react';
import path from 'path';
import { unique } from 'shorthash';
import { getRelPath,
          getFileName, getAllFiles } from '../utils/file-functions';
import { isPathInsideUsb } from '../utils/obj-functions';
import Button from '@material-ui/core/Button';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListSubheader from '@material-ui/core/ListSubheader';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import update from 'immutability-helper';
//import './fix-create-class' // Workaround for using 'react-data-grid-addons'
//import './fix-prop-types'
import ReactDataGrid from 'react-data-grid';

const styles = {
  dialog: {
    width: 500,
    minWidth: 400,
    zIndex: 2000,
  },
  subheader: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '30px',
    color: "rgba(0, 0, 0, 0.770588)",
    fontFamily: "Roboto, sans-serif"
  },
  close: {
    width: 10,
    height: 10,
  },
  groupHeader: {
    display: 'flex',
    paddingTop: 20,
  }
};

const validExtList = (typeStr) => {
  const tmpValidList = {
    'aud': ['mp3'],
    'vid': ['mp4'],
  }
  let retList = [];
  if (tmpValidList[typeStr]!=null){
    retList=tmpValidList[typeStr]
  }
  return retList
}

export default class EpisodesDialog extends React.Component {
  constructor(props) {
    super(props);
    const { selectedIndexes} = props;
    this.onRowsSelected.bind(this);
    this.onRowsDeselected.bind(this);
    this.state = { selectedIndexes }
    this._columns = [
      {
        key: 'id',
        name: 'ID',
        width: 80,
        defaultChecked: true
      },
      {
        key: 'title',
        name: 'Title',
        editable: true
      },
      {
        key: 'fname',
        name: 'Filename',
        editable: false
      }
    ];

    this.state = {
      openSnackbar: false,
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
        return {
          id: i+1,
          title: item.title,
          fname: getFileName(item.filename),
        }
      })
      this.setState({ rows, curList, selectedIndexes });
    }
  }

  componentDidMount = () => {
    const {epList, curPath, createNew} = this.props;
    if (epList!=null){
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
        return {
          id: i,
          title: this.state.rows[i].title,
          filename: item.filename,
        }
      });
      const curPath = this.state.curPath;
console.log(curPath)
console.log(unique(curPath))
      this.props.onSave(copy,curPath);
    }
	}

  renderHeader = (headerStr) => {
    return <ListSubheader style={styles.subheader}>{headerStr}</ListSubheader>
  }

  rowGetter = (i) => {
    return this.state.rows[i];
  };

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
    this.updateRows(validFiles)
  };

  getFiles = (pathName) => {
    if ((pathName!=null)&&(pathName.length>0)&&(path.basename(pathName)!==".")){
      this.getAllFilesInfo(pathName)
        .then(files => this.setFilelist(files,pathName))
        .catch(console.error);
    }
  }

  handleSelectFolder = () => {
    const resObj = window.showOpenDialog({
        defaultPath: this.props.usbPath,
        buttonLabel: "Set path",
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
      const relCheckStr = getRelPath(this.props.usbPath,checkStr);
      if (!isPathInsideUsb(checkStr,this.props.usbPath)) {

        this.setState({
          snackbarMessage: "Parent directories not allowed, please select a child directory!",
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

  render() {
    const { curPath,
              openSnackbar, snackbarMessage } = this.state;
    const listActions = [
      <Button
        key="close"
        color="primary"
        variant="raised"
        onClick={this.props.onClose}>
        Cancel
      </Button>,
      <Button
        key="save"
        color="primary"
        variant="raised"
        onClick={this.handleSave}>
        OK
      </Button>
    ];
    return (
      <Dialog
        fullScreen
        disableBackdropClick
        disableEscapeKeyDown
        onClose={this.props.onClose}
        open={this.props.open}
      >
        <div style={styles.groupHeader}>
          {this.renderHeader("Path")}
          {(curPath!=null) && this.renderHeader(curPath)}
          <Button
            variant="raised"
            size="small"
            onClick={this.handleSelectFolder}>
            <FolderOpen/>
          </Button>
        </div>
        <DialogTitle id="episodes-title">Episodes</DialogTitle>
        <ReactDataGrid
          rowKey='id'
          enableCellSelect={true}
          columns={this._columns}
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
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={openSnackbar}
          onClose={this.handleClose}
          autoHideDuration={6000}
          SnackbarContentProps={{
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
              OK
            </Button>,
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              style={styles.close}
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
