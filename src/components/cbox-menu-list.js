import React from 'react'
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { isEmptyObj } from '../utils/obj-functions'
import Divider from '@material-ui/core/Divider'
import ActionHome from '@material-ui/icons/Home'
import SettingsIcon from '@material-ui/icons/Settings'
import ActionBook from '@material-ui/icons/Book'
import AvPlayArrow from '@material-ui/icons/PlayArrow'
import HeadsetIcon from '@material-ui/icons/Headset'
import SocialSchool from '@material-ui/icons/School'
import InfoIcon from '@material-ui/icons/Info'
import { Group } from 'mdi-material-ui'
import { Download } from 'mdi-material-ui'
// import ImageMusicNote from '@material-ui/icons/MusicNote'
import { withTranslation } from 'react-i18next'

export const menuList = [
  {
    titleId: "myChannel",
    path: "/",
    icon: (<ActionHome/>),
    color: "green",
    enabled: true,
  },
  {
    titleId: "aud",
    path: "/audio",
    icon: (<HeadsetIcon/>),
    color: "darkblue",
    enabled: true,
  },
  {
    titleId: "vid",
    path: "/video",
    icon: (<AvPlayArrow/>),
    color: "orange",
    enabled: true,
  },
  {
    titleId: "bible",
    path: "/bible",
    icon: (<ActionBook/>),
    color: "black",
    enabled: true,
  },
  {
    titleId: "html",
    path: "/training",
    icon: (<SocialSchool/>),
    color: "purple",
    enabled: true,
  },
  {
    titleId: "epub",
    path: "/books",
    icon: (<ActionBook/>),
    color: "darkgreen",
    enabled: true,
  },
  /*
  {
    titleId: "dwnl",
    path: "/download",
    icon: (<Download/>),
    color: "darkgoldenrod",
    enabled: true,
  },
  {
    titleId: "page",
    path: "/pages",
    icon: (<Group/>),
    color: "cadetblue",
    enabled: true,
  },
  {
    titleId: "pdf",
    path: "/pdf",
    icon: (<ActionBook/>),
    color: "#b15353",
    enabled: true,
  },
  {
    titleId: "music",
    path: "/music",
    icon: (<ImageMusicNote/>),
    color: "red",
    enabled: false,
  },
  */
]

const linkStyle =  {
  color: "black",
  textDecoration: 'none'
}

const CboxMenuList = props => {
  const {channel,t,hideIcons,onMenuClick} = props
  return (
    <div>
      <List>
        {menuList.map((item,index) => {
          let btnStyle =  {color: "lightgrey"}
          if (item.enabled){
            btnStyle.color = item.color
          }
          let tmpTitle = t(item.titleId,{count: 100})
          if (!isEmptyObj(channel) && (item.path === "/")){
            tmpTitle = channel.title
          }
          let tmpIcon  = item.icon
          if (hideIcons){
            tmpIcon = null
          }
          return (
            <Link key={index} to={item.path} style={linkStyle}>
              <ListItem
                button
                onClick={item.enabled? (e) => onMenuClick(item) : null}
              >
                <ListItemIcon style={btnStyle}
                >
                  {tmpIcon}
                </ListItemIcon>
                <ListItemText primary={tmpTitle}/>
              </ListItem>
            </Link>
          )
        })}
      </List>
      <Divider />
      <List>
        <Link to={"/setting"} style={linkStyle}>
          <ListItem
            button
            onClick={(e) => onMenuClick(null)}
          >
            <ListItemIcon>
              <SettingsIcon/>
            </ListItemIcon>
            <ListItemText primary={t("settings")}/>
          </ListItem>
        </Link>
      </List>
      <List>
        <Link to={"/about"} style={linkStyle}>
          <ListItem
            button
            onClick={(e) => onMenuClick(null)}
          >
            <ListItemIcon>
              <InfoIcon/>
            </ListItemIcon>
            <ListItemText primary={t("about")}/>
          </ListItem>
        </Link>
      </List>
    </div>
  )
}

export default withTranslation()(CboxMenuList)
