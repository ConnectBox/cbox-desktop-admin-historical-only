import React, { useState, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CboxContext } from '../cbox-context'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import ListSubheader from '@material-ui/core/ListSubheader'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import InfoIcon from '@material-ui/icons/Info'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
  clickText: {
    cursor: 'pointer',
  },
  imgFullWidth: {
    width: 'auto',
    transform: 'none',
  },
  imgFullHeight: {
    width: 'auto',
    position: 'relative',
  },
  title: {
    color: 'white',
    fontSize: 12,
  },
  titleBar: {
    background:
      'linear-gradient(-45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0) 100%)',
  },
  titleBarSelected: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
}))

const Hover = (props) => {
  const {onHover,children} = props
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >{children}</div>
  )
}

const UnsplashGridList = (props) => {
  const { imgList, height, width, onClick } = props
  const [isSelected, setIsSelected] = useState([])
  const [hovering, setHovering] = useState([])
  const classes = useStyles()
  let size = "xs"
  if (width>=1200){
    size = "xl"
  } else if (width>=992){
    size = "lg"
  } else if (width>=768){
    size = "md"
  } else if (width>=576){
    size = "sm"
  }
  let useCols = 3
  if (size==="xs") useCols = 2
  else if (size==="lg") useCols = 4
  else if (size==="xl") useCols = 5

  const arrayExclude = (arr,inx) => arr.filter(item => item !== inx)
  const setHoveringTile = (inx,value) => {
    setHovering(prev => (value ? [...new Set([...prev, inx])] : arrayExclude(prev,inx)))
  }
  const setSelectedTile = (inx,value) => {
    setIsSelected(prev => (value ? [...new Set([...prev, inx])] : arrayExclude(prev,inx)))
  }
  const handleTileClick = (inx) => {
    onClick && onClick(inx)
  }
  const handleClick = (ev,inx) => {
    ev.stopPropagation()
    setSelectedTile(inx,!isSelected.includes(inx))
  }
  const handleTitleClick = (ev,inx,link) => {
    ev.stopPropagation()
    window.ipcRendererSend('open-ext-url',link)
  }
  const handleDescrClick = (ev,inx,link) => {
    ev.stopPropagation()
    window.ipcRendererSend('open-ext-url',link)
  }
  return (
    <div className={classes.root}>
      <GridList cellHeight={230} cols={useCols} className={classes.gridList}>
        {imgList.map((tile,index) => {
          const fullInfo = isSelected.includes(index)
          const showName = fullInfo || hovering.includes(index)
          const tileName = (<span className={classes.clickText}
                              onClick={(ev) => handleTitleClick(ev,index,tile.userLink)}
                            >{tile.author}</span>)
          const tileDescr = (<span className={classes.clickText}
                              onClick={(ev) => handleDescrClick(ev,index,tile.link)}
                            >{tile.descr}</span>)
          return (
              <GridListTile
                classes={{
                  imgFullWidth: classes.imgFullWidth,
                  imgFullHeight: classes.imgFullHeight,
                }}
                key={index}
                onClick={() => handleTileClick(index)}>
                <img src={tile.img} alt={tile.title} />
                <Hover onHover={(value) => setHoveringTile(index,value)}>
                  <GridListTileBar
                    title={(showName) ? tileName : null}
                    subtitle={(fullInfo) ? tileDescr : null}
                    classes={{
                      root: (showName) ? classes.titleBarSelected : classes.titleBar,
                      title: classes.title,
                    }}
                    actionIcon={
                      <IconButton
                        aria-label={`info about ${tile.title}`}
                        className={classes.icon}
                        onClick={(ev) => handleClick(ev,index)}
                      >
                        <InfoIcon />
                      </IconButton>
                    }
                  />
                </Hover>
              </GridListTile>
          )}
        )}
      </GridList>
    </div>
  )
}
export default UnsplashGridList
