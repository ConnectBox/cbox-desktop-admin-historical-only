import React, { useState, useEffect, useContext } from 'react'
import { CboxContext } from '../cbox-context'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import path from 'path'
import { getImgOfObj, isPathInsideUsb, isEmpty,
          jsonEqual, nullToEmptyStr } from '../utils/obj-functions'
import { getHostPathSep, getRelPath } from '../utils/file-functions'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import Badge from '@material-ui/core/Badge'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Switch from '@material-ui/core/Switch'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import ActionList from '@material-ui/icons/List'
import ImageCollections from '@material-ui/icons/Collections'
import TextField from '@material-ui/core/TextField'
import TranslateIcon from '@material-ui/icons/Translate'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import { LanguageSelect } from './language-select'
import ImgGrid from './img-grid'
import PictureMenu from './picture-menu'
import EpisodesDialog from './episodes-dialog'
import Typography from '@material-ui/core/Typography'
import {iso639Langs} from '../iso639-1-full.js'
import { withTranslation } from 'react-i18next'

const styles = {
  card: {
    height: '100%',
  },
  dialog: {
    width: 500,
    minWidth: 400,
    zIndex: 2000,
  },
  image: {
    margin: '18px 0 0 24px',
    cursor: 'pointer',
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
  langSelect: {
    marginTop: 10,
    marginLeft: 0,
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
  floatingButtonEdit: {
    left: 165,
    top: 150,
    width: 65,
    zIndex: 100,
    position: 'relative',
  },
  textFieldNumber: {
    paddingLeft: 20,
  },
  checkbox: {
    marginLeft: 20,
    width: "auto",
    maxWidth: "50%",
  },
}

const MetadataConfigDialog = (props) => {
  const scope = useContext(CboxContext)
  const { usbPath, usbHash, height, width } = scope
  const { t, backgroundColor, createNew, item, open,
          isSelectedSerie, onClose, onAddTitle } = props
  const [anchorEl, setAnchorEl] = useState(null)
  const [lang, setLang] = useState(undefined)
  const [filter, setFilter] = useState(undefined)
  const [canSelectLang,setCanSelectLang] = useState(scope.lang==null)
  const [eItem, setEItem] = useState({})
  const [dataOk, setDataOk] = useState(false)
  const [allEmpty, setAllEmpty] = useState(false)
  const [changedField, setChangedField] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [openListDialog, setOpenListDialog] = useState(false)
  const [openUnsplashDialog, setOpenUnsplashDialog] = useState(false)
  const [epDialogHandled, setEpDialogHandled] = useState(false)
  const isList = (eItem!=null)&&(eItem.fileList!=null)
  const verifyData = (dataObj,checkField) => {
    let copyItem = {}
    if (dataObj!=null){
      copyItem = JSON.parse(JSON.stringify(dataObj))
    }
    const tmpDataOk = ( (copyItem.image!=null)
                      && (copyItem.mediaType!=null)
                      && (copyItem.lang!=null)
                      && (copyItem.title!=null)
                      && (copyItem.language!=null) )
    const tmpAllEmpty = ( isEmpty(copyItem.image)
                        && isEmpty(copyItem.mediaType)
                        && isEmpty(copyItem.title)
                        && isEmpty(copyItem.lang)
                        && isEmpty(copyItem.description)
                        && isEmpty(copyItem.language) )
    const tmpChangedField = ( checkField
                                && !isEmpty(item)
                                && !jsonEqual(copyItem,item) )
    setEItem(copyItem)
    setDataOk(tmpDataOk)
    setAllEmpty(tmpAllEmpty)
    setChangedField(tmpChangedField)
/*
    if (onEditModeChange!=null){
      onEditModeChange(eMode)
    }
*/
  }
  useEffect(() => {
    if ((createNew)&&(!epDialogHandled)) {
      setOpenListDialog(true)
      setEpDialogHandled(true)
    }
    verifyData(item)
  }, [item,lang])
  useEffect(() => {
    if (props.filter!=null){
      setFilter(props.filter)
    } else if (item) {
      setFilter(item.mediaType)
    }
  }, [item,props.filter])
  useEffect(() => {
    let canSelect = true
    if (scope.lang!=null){
      setLang(scope.lang)
      canSelect = false
    } else if (item && item.language) {
      setLang(item.language)
      canSelect = false
    }
    setCanSelectLang(canSelect)
  }, [item,scope.lang])

	const handleSelectImage = (x) => {
    let tmpObj = eItem
		tmpObj.image = x
    verifyData(tmpObj,true)
    setOpenUnsplashDialog(false)
	}

//  const handleClose = () => setAnchorEl(null)
  const handlePixChoice = (ev) => {
    setAnchorEl(ev.currentTarget)
  }
  const handleSelectImageFileClick = (ev) => {
    openFile()
    setAnchorEl(undefined)
  }
  const handleUnsplashClick = (ev) => {
    setOpenUnsplashDialog(true)
    setAnchorEl(undefined)
  }
  const handleOpenListDialog = () => setOpenListDialog(true)
  const handleUngroup = () => {
    let tmpObj = eItem
    const curValue = (tmpObj!=null)&&(tmpObj.ungrouped)
		tmpObj.ungrouped = !curValue
    verifyData(tmpObj,true)
  }

  const handleLangSelect = (newLang) => {
console.log(newLang[0])
    setLang(newLang[0].value)
  }

	const handleClose = () => {
    verifyData(item)
    setEpDialogHandled(false)
    onClose()
  }

  const handleCloseListDialog = () => {
    setOpenListDialog(false)
    handleClose()
	}

  const handleSaveListDialog = (list,curPath,isFreeAudiobibleType,pathPattern) => {
    const isBibleContent = (filter === "bible")
    const copy = Object.assign({}, eItem)
    setOpenListDialog(false)
    if (isBibleContent){
      copy.bibleBookList=list
      copy.freeType = isFreeAudiobibleType
      copy.pathPattern = pathPattern
    } else {
      copy.fileList=list
    }
    copy.curPath=curPath
    verifyData(copy,true)
  }

  const openFile = () => {
// Possible alternative for later? Import from any local location
//  and copy to the configure local directory
    const resObj = window.showOpenDialog({
      defaultPath: usbPath,
      filters: [{ name: 'Images', extensions: ['gif', 'jpg', 'jpeg', 'png', 'tif'] }],
      buttonLabel: t("selectImage"),
      properties: [
        'openFile', (fileNames) => {
          if(fileNames === undefined){
              console.log("No file selected")
              return
          }
          console.log(fileNames)
        }
      ]
    })
    if (resObj!=null){
      const checkStr = resObj[0]
      const relCheckStr = getRelPath(usbPath,checkStr)
      if (!isPathInsideUsb(checkStr,usbPath)) {
        const errMsgStr = t("imgErrMsg1") + " (" + usbPath + ") " +t("imgErrMsg2")
        setSnackbarMessage(errMsgStr)
        setOpenSnackbar(true)
      } else {
        const retObj = {
          origin: "Local",
          filename: relCheckStr,
        }
        let tmpObj = eItem
    		tmpObj.image = retObj
        verifyData(tmpObj,true)
      }
    }
  }

  const handleSave = () => {
    const copy = Object.assign({}, eItem)
    if (onAddTitle!=null){
      copy.language = lang
      copy.mediaType=filter
      if ((filter==="epub") && (!copy.unzipped)){
        const data = {
          curPath: usbPath +getHostPathSep() + copy.curPath,
          fileList: copy.fileList.map(item => path.basename(item.filename))
        }
        onAddTitle(copy,isSelectedSerie,data)
      } else {
        onAddTitle(copy,isSelectedSerie)
      }
    }
    setEpDialogHandled(false)
    onClose()
	}

  const onFieldChange = (event,inputName) => {
    let tmpObj = eItem
    tmpObj[inputName] = event.target.value
    verifyData(tmpObj,true)
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false)
  }

  const onCheck = (event,isChecked,inputName) => {
    let tmpObj = eItem
    tmpObj[inputName] = isChecked
    setEItem(tmpObj)
  }

  const renderCheckBox = (textStr,field) => (
    <FormControlLabel
      control={
        <Switch
          color="primary"
          checked={eItem[field] || false}
          onChange={(e, checked) => onCheck(e, checked, field)}
          value={field}
        />
      }
      label={textStr}
    />
  )

  const renderTextField = (label,hint,field,errorText) => (
    <TextField
      value={nullToEmptyStr(eItem[field])}
      onChange={(e) => onFieldChange(e, field)}
      style={styles.textField}
      margin="dense"
      placeholder={hint}
      label={label}
    />
  )

  let badgeCnt = 0
  let imgSrc = ""
  if (eItem!=null){
    if (eItem.fileList!=null){
      badgeCnt = eItem.fileList.length
    }
    imgSrc = getImgOfObj(usbPath,eItem)
  }
  let langStr = "undefined"
  if (lang!=null){
    langStr = iso639Langs[lang].name + " (" +iso639Langs[lang].engName +")"
  }
  const isBook = (filter==="epub")
  const isBibleContent = (filter === "bible")
  const isAVContent = (filter === "aud") || (filter === "vid")
  const canUngroup = isList && eItem.fileList.length>1 && isAVContent
  const isUngrouped = ((eItem!=null)&&(eItem.ungrouped)) || false
  const saveDisabled = (eItem.title==null)||(eItem.title.length<=0)||(lang==null)
  const showWarning = isBook && !saveDisabled
  return (
    <Dialog
      open={open}
      disableBackdropClick
      onClose={() => handleClose()}
      aria-labelledby="form-dialog-title"
      style={{backgroundColor}}
    >
      {(eItem!=null) && (
        <Button
          style={styles.floatingButtonEdit}
          color="primary"
          variant="contained"
          onClick={(ev) => handlePixChoice(ev)}>
          <ImageCollections />
        </Button>
      )}
      {(eItem!=null) && (
        <img
          src={imgSrc}
          alt={eItem.title}
          style={styles.image}
          onClick={(ev) => handlePixChoice(ev)}/>
      )}
      <DialogContent>
        <Typography
          color={(lang==null) ? "error" : "primary"}
          type="title"
        >{t("language")}: {langStr}</Typography>
        {canSelectLang && (
          <LanguageSelect
            style={styles.langSelect}
            languages={scope.languages}
            isSearchable={true}
            selLang={[lang]}
            onLanguageUpdate={handleLangSelect}
          />
        )}
        {renderTextField(t("title"),t("mainTitle"),"title")}
        {renderTextField(t("description"),t("descr"),"description")}
        {isBook && renderCheckBox(t("readOL"),"readOL")}
        <CardActions>
          {(!isList)||(badgeCnt===0)
          ? (<Button
              color="primary"
              onClick={handleOpenListDialog}>
              <ActionList />
            </Button>)
          : (<Badge
            badgeContent={badgeCnt}
          >
            <Button
              color="primary"
              onClick={handleOpenListDialog}>
              <ActionList />
            </Button>
          </Badge>)}
          {canUngroup && (
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={isUngrouped}
                  onChange={handleUngroup}
                  value="ungroup"
                />
              }
              label="Ungroup"
            />
          )}
        </CardActions>
				{openUnsplashDialog
          && (<ImgGrid
            imgSrc={imgSrc}
            open={true}
            onClose={() => setOpenUnsplashDialog(false)}
            onSave={handleSelectImage}
          />)}
        <PictureMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onSelectImageFileClick={(event) => handleSelectImageFileClick(event)}
          onUnsplashClick={(event) => handleUnsplashClick(event)}
        />
        {openListDialog
          && (<EpisodesDialog
            usbPath={usbPath}
            usbHash={usbHash}
            onClose={handleCloseListDialog}
            onSave={handleSaveListDialog}
            filter={filter}
            epList={eItem.fileList}
            bibleBookList={eItem.bibleBookList}
            pathPattern={eItem.pathPattern}
            curPath={eItem.curPath}
            createNew={createNew}
            open={true}
          />)}
          {showWarning && <Typography align="right" type="title">{t("unzipNotice")}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={handleClose}>
          {t("cancel")}
        </Button>
        {((eItem!=null) || (changedField))
          && (<Button
            color="primary"
            variant="contained"
            disabled={saveDisabled}
            onClick={handleSave}>
            {t("save")}
          </Button>
        )}
      </DialogActions>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar}
        onClose={handleSnackbarClose}
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
            onClick={handleSnackbarClose}
          >
            {t("ok")}
          </Button>,
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            style={styles.close}
            onClick={handleSnackbarClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </Dialog>
  )
}

MetadataConfigDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(withTranslation()(MetadataConfigDialog))
