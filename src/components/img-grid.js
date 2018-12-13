import React from 'react';
//import axios from 'axios';
import './img-grid.css';
import { getRelPath } from '../utils/file-functions';
import { isPathInsideUsb, getLocalMediaFName } from '../utils/obj-functions';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Gallery from 'react-photo-gallery';
import SearchForm from './SearchForm';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Upload } from 'mdi-material-ui';
import { withNamespaces } from 'react-i18next';

const styles = {
  button: {
    left: '91%',
  },
  mainSearchDiv: {
    overflow: 'hidden',
  },
  image: {
    margin: '18px 0 0 24px',
    maxWidth: 180,
    maxHeight: 180,
    width: "auto",
    height: "auto"
  },
  search: {
    top: 40,
    margin: '0 auto',
    maxWidth: 800
  },
  grpDiv: {
    paddingBottom: 10,
  },
}

class ImgGrid extends React.Component {
  state = {
    openSnackbar: false,
    snackbarMessage: "",
    imgs: [],
    curQueryStr: "",
    curPage: 1,
    imgSrcStr: undefined,
		loadingState: true,
    hasMoreItems: true,
  }

  performSearch = (query,page = 1) => {
console.log(page);
/*
		axios
			.get(
				`https://api.unsplash.com/search/photos/?page=`+page+`&per_page=36&query=${query}&client_id=${cred.APP_ID}`
//				`https://api.unsplash.com/users/(username)/collections?page=1&per_page=12&client_id=${cred.APP_ID}`
			)
			.then(data => {
        const newList = [...this.state.imgs, ...data.data.results];
        this.setState({
          imgs: newList,
          curQueryStr: query,
          curPage: page,
          loadingState: false
        })
			})
			.catch(err => {
				console.log('Error happened during fetching!', err);
			});
*/
	};

  onClickPhoto = (event,item) => {
    if (this.props.onSave!=null){
      const orgImg = this.state.imgs[item.index];
      const retObj = {
        origin: "Unsplash",
        urls: orgImg.urls,
        links: orgImg.links,
        user: { name: orgImg.user.name, html: orgImg.user.links.html }
      };
      this.props.onSave(retObj)
    }
  }

  handleSave = () => {
    if (this.props.onSave!=null){
      const retObj = {
        origin: "Local",
        filename: this.state.imgSrcStr,
      };
      this.props.onSave(retObj)
    }
  }

  loadItems = () => {
    this.performSearch(this.state.curQueryStr,this.state.curPage+1)
  }

  openFile = () => {
// Possible alternative for later? Import from any local location
//  and copy to the configure local directory
    const {t, usbPath} = this.props;
    const resObj = window.showOpenDialog({
      defaultPath: usbPath,
      filters: [{ name: 'Images', extensions: ['gif', 'jpg', 'jpeg', 'png', 'tif'] }],
      buttonLabel: t("selectImage"),
      properties: [
        'openFile', (fileNames) => {
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
        const errMsgStr = t("imgErrMsg1") + " (" + this.props.usbPath + ") " +t("imgErrMsg2");
        this.setState({
          snackbarMessage: errMsgStr,
          openSnackbar: true,
        })
      } else {
        this.setState({ imgSrcStr: relCheckStr });
      }
    }
  }

  handleSnackbarClose = () => {
    this.setState({ openSnackbar: false });
  }

// Import Icon CC Attribution http://www.happyiconstudio.com/free-mobile-icon-kit.htm
  render() {
    const { t } = this.props;
    const { openSnackbar, snackbarMessage, imgSrcStr } = this.state;
    let mapppedImgList = [];
    if (this.state.imgs!=null) {
      mapppedImgList = this.state.imgs.map((item) => {
        return {
          src: item.urls.thumb,
          width: item.width,
          height: item.height
        }
      });
    }
//    const loader = <div className="loader">Loading ...</div>;
    const pixsActions = [
      <Button
        key="local-file"
        color="primary"
        variant="contained"
        onClick={this.openFile}>
         <Upload />
      </Button>,
      <Button
        key="cancel"
        color="primary"
        variant="contained"
        onClick={this.props.onClose}>
        {t("cancel")}
      </Button>,
      <Button
        key="ok"
        color="primary"
        variant="contained"
        disabled={imgSrcStr==null}
        onClick={this.handleSave}>
        {t("ok")}
      </Button>
    ];
    var items = [];
    mapppedImgList.forEach((item, i) => {
        items.push(
            <div className="track" key={i}>
                <img src={item.src} width="150" height="150" alt={i}/>
            </div>
        );
    });
    return (
      <Dialog
        fullScreen
//                maxWidth="xs"
        onClose={this.props.onClose}
        open={this.props.open}
      >
        <DialogTitle id="select-picture-title">{t("selectImage")}</DialogTitle>
        {(imgSrcStr!=null) && (<img style={styles.image}
                                    src={getLocalMediaFName(this.props.usbPath,imgSrcStr)}
                                    alt="selected"/>)}
        <div className="main-search-form" style={styles.mainSearchDiv}>
          <div style={styles.grpDiv}>
            <div style={styles.search}>
              <SearchForm onSearch={this.performSearch}/>
            </div>
          </div>
          <div className="main-content">
            {this.state.loadingState
              ? null
              // Later we can add lightbox handling, navigating pages,
              // We also can add Unsplash search user/collections (inkl. navigation)
              : (
                <div>
                  <Gallery photos={mapppedImgList} onClick={this.onClickPhoto}/>
                  <Button
                    backgroundColor={"white"}
                    label="more"
                    onClick={this.loadItems}
                  />
                </div>
              )}
          </div>
        </div>
        <DialogActions>{pixsActions}</DialogActions>
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
              {t("ok")}
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

export default withNamespaces()(ImgGrid);
