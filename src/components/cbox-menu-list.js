import React from 'react';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { isEmptyObj } from '../utils/obj-functions';
import Divider from '@material-ui/core/Divider';
import ActionHome from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import ActionBook from '@material-ui/icons/Book';
import AvPlayArrow from '@material-ui/icons/PlayArrow';
import HeadsetIcon from '@material-ui/icons/Headset';
import SocialSchool from '@material-ui/icons/School';
import InfoIcon from '@material-ui/icons/Info';
// import { Group } from 'mdi-material-ui';
// import ImageMusicNote from '@material-ui/icons/MusicNote';
import { withNamespaces } from 'react-i18next';

export const menuList = [
  {
    titleId: "myChannel",
    path: "/",
    icon: (<ActionHome/>),
    color: "green",
    enabled: true,
  },
  {
    titleId: "audio",
    path: "/audio",
    icon: (<HeadsetIcon/>),
    color: "darkblue",
    enabled: true,
  },
  {
    titleId: "book",
    path: "/books",
    icon: (<ActionBook/>),
    color: "darkgreen",
    enabled: true,
  },
  {
    titleId: "training",
    path: "/training",
    icon: (<SocialSchool/>),
    color: "purple",
    enabled: true,
  },
  /*
  {
    titleId: "page",
    path: "/pages",
    icon: (<Group/>),
    color: "cadetblue",
    enabled: true,
  },
  {
    titleId: "Music",
    path: "/music",
    icon: (<ImageMusicNote/>),
    color: "red",
    enabled: false,
  },
  {
    titleId: "bible",
    path: "/bible",
    icon: (<ActionBook/>),
    color: "black",
    enabled: false,
  },
*/
  {
    titleId: "video",
    path: "/video",
    icon: (<AvPlayArrow/>),
    color: "orange",
    enabled: true,
  },
]

const CboxMenuList = props => {
  const {channel,t,hideIcons} = props;
  return (
    <div>
      <List>
        {menuList.map((item,index) => {
          let btnStyle =  {color: "lightgrey"};
          if (item.enabled){
            btnStyle.color = item.color;
          }
          let tmpTitle = t(item.titleId,{count: 100});
          if (!isEmptyObj(channel) && (item.path === "/")){
            tmpTitle = channel.title;
          }
          let tmpIcon  = item.icon;
          if (hideIcons){
            tmpIcon = null
          }
          return (
            <Link key={index} to={item.path} style={{ textDecoration: 'none' }}>
              <ListItem
                button
                onClick={item.enabled? (e) => props.onMenuClick(item) : null}
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
        <Link to={"/setting"} style={{ textDecoration: 'none' }}>
          <ListItem
            button
            onClick={(e) => props.onMenuClick(null)}
          >
            <ListItemIcon>
              <SettingsIcon/>
            </ListItemIcon>
            <ListItemText primary={t("settings")}/>
          </ListItem>
        </Link>
      </List>
      <List>
        <Link to={"/about"} style={{ textDecoration: 'none' }}>
          <ListItem
            button
            onClick={(e) => props.onMenuClick(null)}
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

export default withNamespaces()(CboxMenuList);
