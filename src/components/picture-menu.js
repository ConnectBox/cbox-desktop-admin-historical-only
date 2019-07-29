import React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import { FolderMultipleImage, Camera } from 'mdi-material-ui'
import Typography from '@material-ui/core/Typography'
import { withTranslation } from 'react-i18next'

const styles = {
  downloadIcon: {
    color: "darkblue"
  },
}

const PictureMenu = props => {
  const {t, anchorEl, open, onClose,
          onSelectImageFileClick, onUnsplashClick, } = props
  return (
    <Menu
      id="simple-menu"
      aria-label="mediaType"
      name="mediaType"
      keepMounted
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
    >
          <MenuItem
            onClick={onSelectImageFileClick}
          >
            <ListItemIcon style={styles.downloadIcon}>
              <FolderMultipleImage/>
            </ListItemIcon>
            <Typography variant="inherit">{t("selectFile")}</Typography>
          </MenuItem>
          <MenuItem
            onClick={onUnsplashClick}
          >
            <ListItemIcon style={styles.downloadIcon}>
              <Camera/>
            </ListItemIcon>
            <Typography variant="inherit">Unsplash</Typography>
          </MenuItem>
        )
      })}
    </Menu>
  )
}

export default withTranslation()(PictureMenu)
