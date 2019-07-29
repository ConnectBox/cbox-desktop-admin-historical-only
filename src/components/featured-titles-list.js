import React, { useState, useContext } from 'react'
import { CboxContext } from '../cbox-context'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import SeriesItem from './series-item.js'
import MetadataConfigDialog from './metadata-config-dialog'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Typography from '@material-ui/core/Typography'
import Fab from '@material-ui/core/Fab'
import { Link } from 'react-router-dom'
import AddIcon from '@material-ui/icons/Add'
import { menuList } from './cbox-menu-list'
import { withTranslation } from 'react-i18next'

const styles = theme => ({
  button: {
    zIndex: 1,
    position: 'relative',
    margin: '22px 0 0 40px',
  },
  buttonLScreen: {
    zIndex: 1,
    position: 'relative',
    margin: '85px 0 0 29px',
  },
  logoLScreen: {
  },
  logo: {
    minWidth: 100,
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  floatingButton: {
    margin: '30px 10px 0 80%',
    zIndex: 100,
  },
  floatingButtonLScreen: {
    margin: '70% 10px 10px 70%',
    zIndex: 100,
  },
})

const FeaturedTitlesList = (props) => {
  const scope = useContext(CboxContext)
  const { usbPath, usbHash, height, width, titles, languages, myLang,
          featuredTitles, largeScreen, curView, curPos, curPlay, isPaused } = scope
  const { t, classes, channel, fullList, filter,
          onSetPaused, onSelectView, onPlayNext, onAddTitle, onDelete,
          onSelectFromLibrary, onStartPlay, onTitlesUpdate } = props
  const [curSer, setCurSer] = useState(undefined)
  const [createNew, setCreateNew] = useState(true)
  const [curEditModeInx, setCurEditModeInx] = useState(undefined)
  const [openConfigDialogue, setOpenConfigDialogue] = useState(false)
  const [curFilter, setCurFilter] = useState(undefined)
  const [anchorEl, setAnchorEl] = useState(null)
  const handleSelectFromLibrary = () => onSelectFromLibrary && onSelectFromLibrary()
  const handleStartPlay = (...params) => onStartPlay && onStartPlay(...params)
  const handleUpdate = (ser) => (action) => onTitlesUpdate && onTitlesUpdate(ser,action)
  const handleSetEditMode = (isSet,inx) => setCurEditModeInx(isSet ? inx : undefined)
  const handleStartEdit = (cur) => {
    setCurSer(cur)
    setCreateNew(false)
    setOpenConfigDialogue(true)
  }
  const handleClose = () => setAnchorEl(null)
  const handleCloseDialog = () => {
    setOpenConfigDialogue(false)
    setCurEditModeInx(undefined)
  }
  const handleAddClick = (ev) => {
    setAnchorEl(ev.currentTarget)
  }
  const handleClick = (ev,idStr) => {
    setCurSer(undefined)
    setCreateNew(true)
    setOpenConfigDialogue(true)
    setAnchorEl(null)
    setCurFilter(idStr)
  }

  let curTitleList = []
  if (titles){
    if (fullList){
      languages.forEach(lang => {
        if (titles[lang]!=null){
          Object.keys(titles[lang]).forEach((title) => {
            curTitleList.push(titles[lang][title])
          })
        }
      })
    } else if ((titles)&&(featuredTitles)){
      Object.keys(featuredTitles).filter(
        lang => myLang.indexOf(lang)>=0
      ).forEach((lang) => {
        if (titles[lang]!=null){
          featuredTitles[lang].forEach((title) => {
            if (titles[lang][title]!=null){
              curTitleList.push(titles[lang][title])
            }
          })
        }
      })
    }
  }
  let useBkgrdColor = 'rgba(15, 4, 76, 0.68)'
  if (curFilter==="vid"){
    useBkgrdColor = 'rgba(255, 215, 0, 0.78)'
  } else if (curFilter==="epub"){
    useBkgrdColor = 'rgba(120, 215, 120, 0.78)'
  } else if (curFilter==="html"){
    useBkgrdColor = 'rgba(81, 184, 233, 0.68)'
  }
  const hasCurView = (curView!= null)
  let featuredStr = t("featured")
  if ((channel) && (channel.title)) {
    featuredStr = channel.title
  }
  let showListTitle = ((channel!=null) || (curTitleList.length>0))
  if (hasCurView) {
    showListTitle = false
  }
  if (openConfigDialogue){
    return (
      <MetadataConfigDialog
        createNew={createNew}
        item={curSer}
        backgroundColor={useBkgrdColor}
        open={true}
        filter={curFilter}
        languages={props.languages}
        isSelectedSerie={true}
        onClose={handleCloseDialog}
        onAddTitle={onAddTitle}
        onDelete={onDelete}
        />
      )
  } else {
    return (
      <div id="home-div"
        data-active={hasCurView}
        data-disabled={(curEditModeInx!=null)}
      >
        {showListTitle && (<div className="list-header">{featuredStr}</div>)}
        {(curTitleList.length>0)
            && curTitleList.filter((ser) => {
              return ((ser.mediaType===filter) || (filter===''))
            }).map((ser,index) => {
              return (
                <SeriesItem
                  serie={ser}
                  key={index}
                  index={index}
                  disabled={((curEditModeInx!=null) && (curEditModeInx!==index))}
                  isPreview={fullList}
                  onSetPaused={onSetPaused}
                  onSelectView={onSelectView}
                  onPlayNext={onPlayNext}
                  onStartPlay={(...params) => handleStartPlay(...params)}
                  onTitlesUpdate={() => handleUpdate(ser)}
                  onSetEditMode={(isSet) => handleSetEditMode(isSet,index)}
                  onStartEdit={() => handleStartEdit(ser,index)}/>
              )
          })}
          <div
            className="serie-div dashed"
            data-active={false}
            data-playing={false}
          >
            <div
              className="item-div"
            >
              <Menu
                id="simple-menu"
                aria-label="mediaType"
                name="mediaType"
                keepMounted
                className={classes.group}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {menuList.filter(choice => choice.enabled && choice.path!=="/").map(choice => {
                  const {titleId, path, icon, color} = choice
                  const labelStr = t(titleId)
                  let btnStyle = {color}
                  let tmpTitle = t(titleId,{count: 100})
                  return (
                    <MenuItem
                      key={path}
                      onClick={(event) => handleClick(event,titleId)}
                    >
                      <ListItemIcon style={btnStyle}>
                        {icon}
                      </ListItemIcon>
                      <Typography variant="inherit">{labelStr}</Typography>
                    </MenuItem>
                  )
                })}
              </Menu>
              <Fab
                className={largeScreen? classes.floatingButtonLScreen : classes.floatingButton }
                color="primary"
                disabled={(curEditModeInx!=null)}
                onClick={(ev) => handleAddClick(ev)}
              >
                <AddIcon className={classes.addIcon}/>
              </Fab>
            </div>
          </div>
      </div>
    )
  }
}

FeaturedTitlesList.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(withTranslation()(FeaturedTitlesList))
