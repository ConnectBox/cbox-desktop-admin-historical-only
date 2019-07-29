import React, { useState, useContext } from 'react'
import { CboxContext } from '../cbox-context'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import NavClose from '@material-ui/icons/Close';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { pad } from '../utils/obj-functions';
import { withTranslation } from 'react-i18next'
import { rangeArray } from '../utils/obj-functions';
import { osisIconId, osisIconList } from '../osisIconList'
import { getOsisChTitle, getChoiceTitle } from '../osisChTitles'
import { naviSortOrder, chInBook,
          naviBooksLevel1, naviBooksLevel2, naviChapters } from '../naviChapters'

const styles = {
  info:{
    color: 'lightgrey',
    paddingTop: 50,
    paddingBottom: 70,
    width: '99%' // ToDo: fix this differently later ?
  },
  tile: {
  },
  imgFullWidth: {
    width: 'auto',
    position: 'relative',
  },
  imgFullHeight: {
    height: 'auto',
    position: 'relative',
  },
  gridList: {
    // Promote the list into its own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
  },
  exitButtonLS: {
    margin: 0,
    top: 80,
    bottom: 'auto',
    right: 20,
    left: 'auto',
    zIndex: 100,
    position: 'fixed',
  },
  exitButton: {
    margin: 0,
    bottom: 'auto',
    right: 20,
    left: 'auto',
    zIndex: 100,
    position: 'fixed',
  },
  title: {
    margin: '15px 0px 4px 0px',
  },
  gridListRoot: {
    borderWidth: 0,
  },
  root: {
    display: 'flex',
  },
};

const SerieGridBar = (props) => {
  const { classes, title, subtitle } = props;
  return (
      <GridListTileBar
        title={title}
        classes={{
          root: classes.titleBar,
          title: classes.title,
        }}
        subtitle={subtitle}
      />
  )
}

const CboxBibleNavigation = (props) => {
  const scope = useContext(CboxContext)
  const { curPlay, height, width, size, curView, curPos, isPaused } = scope
  const { t, classes, onExitNavigation, onStartPlay } = props
  const curSerie = (curPlay!=null) ? curPlay.curSerie : undefined
  const [curLevel, setCurLevel] = useState(1)
  const [level1, setLevel1] = useState(1)
  const [level2, setLevel2] = useState("")
  const [level3, setLevel3] = useState("")
//  const [curList,setCurList] = useState(Object.keys(chInBook))
  const [skipLevelList,setSkipLevelList] = useState([])
  const [curList,setCurList] = useState((curSerie!=null) ? curSerie.bibleBookList : [])
  const maxLevel = 3
  const preNav = process.env.PUBLIC_URL + "/navIcons/"
  const preBook = process.env.PUBLIC_URL + "/bookIcons/"
  const getSort = (val) => naviSortOrder.indexOf(parseInt(val))
  const addSkipLevel = (level) => setSkipLevelList([...skipLevelList,level])

  const getOsisIcon = (osisId) => {
    const exceptionBook = ["1Sam","2Sam","1Kgs","2Kgs","1Chr","2Chr"]
    let bookNameEng = t(osisId, { lng: 'en' })
    if (exceptionBook.indexOf(osisId)>=0){
      bookNameEng = bookNameEng.substr(2,bookNameEng.length)
    }
    return bookNameEng.replace(/ /g,"-").toLowerCase()
  }

  const getChIcon = (key,lev1,lev2,bookObj,ch) => {
    let checkIcon = "000-" + pad(lev1)
    if (lev2!=null) checkIcon = "00-" + pad(level1) + lev2
    let imgSrc
    let checkTitle
    const bk = (bookObj!=null)?bookObj.bk:null
    if (bk!=null){ // level 3
      const checkObj = osisIconList[bk]
      if (checkObj!=null){
        let useCh
        if (ch==null){
          const entry = Object.entries(checkObj)[0]
          useCh = entry[0]
          if (bk!=null){ // level 3
            const {beg,end} = bookObj
            if ((beg!=null)&&(end!=null)){
              useCh = Object.keys(checkObj).find(key => key>=beg)
            }
          }
        } else {
          if (checkObj[ch]!=null) useCh = ch
        }
        if (useCh!=null){
          const firstId = pad(parseInt(useCh))
          const firstEntry = checkObj[useCh][0]
          checkIcon = osisIconId[bk] + "_" + firstId + "_" + firstEntry
        }
      }
// Book Icon - To Do - to be added in the future
//    imgSrc = preBook +getOsisIcon(bk) +".png"
      checkTitle = t(bk)
    } else {
      checkTitle = t(checkIcon)
    }
    imgSrc = preNav +checkIcon +".png"
    const title = (ch!=null) ? getOsisChTitle(bk,ch) : checkTitle
    let subtitle
    if (bk==null){ // level 1 and 2
      const checkStr = checkIcon + "-descr"
      subtitle = t(checkStr)
      if (subtitle===checkStr) subtitle = ""
    } else if (ch==null){ // level 3
      const {beg,end} = bookObj
      if ((beg!=null)&&(end!=null)){
        subtitle = (beg===end) ? beg : beg + " - " + end
      }
      const choiceTitle = getChoiceTitle(bk,key+1)
      if (choiceTitle!=null) subtitle += " " + choiceTitle
    }
    return {
      imgSrc,
      key,
      subtitle,
      title,
      isBookIcon: false
    }
  }

  const handleClick = (ev,id,isBookIcon) => {
    if (curLevel===1){
      setLevel1(id)
      setCurLevel(2)
    } else if (curLevel===2){
      setLevel2(id)
      if (naviChapters[level1][id].length===1){
        setLevel3(0)
        setCurLevel(4)
      } else setCurLevel(3)
    } else if (curLevel===3){
      setLevel3(id)
      setCurLevel(4)
    } else {
      const bookObj = naviChapters[level1][level2][level3]
      const {curSerie} = curPlay
      onStartPlay(curSerie,bookObj,id)
    }
  }

  const navigateUp = (level) => {
    if (level===0){
      onExitNavigation()
    } else if (skipLevelList.includes(level)) {
      navigateUp(level-1)
    } else {
      setCurLevel(level)
    }
  }

  const handleReturn = () => {
    if ((curLevel===4)&&(naviChapters[level1][level2].length===1)){
      navigateUp(2)
    } else
    if (curLevel>1){
      navigateUp(curLevel-1)
    } else {
      onExitNavigation()
    }
  }

  let validIconList = []
  let validBookList = []
  let showTitleBar = true
  if (curSerie!=null) {
    if (curLevel===1){
      let lastInx
      Object.keys(naviBooksLevel1).sort((a,b)=>getSort(a)-getSort(b)
      ).forEach(iconInx => {
        const foundList = naviBooksLevel1[iconInx].filter(x => curList.includes(x))
        validBookList.push(...foundList)
        if (foundList.length>0){
          lastInx = iconInx
          validIconList.push(getChIcon(iconInx,iconInx))
        }
      })
      if (validIconList.length===1) {
        setLevel1(lastInx)
        setCurLevel(2)
        addSkipLevel(1)
        validIconList = []
        validBookList = []
      }
    }
    if (curLevel===2){
      let lastLetter
      Object.keys(naviChapters[level1]).forEach(iconLetter => {
        const foundList = naviBooksLevel2[level1][iconLetter].filter(x => curList.includes(x))
        validBookList.push(...foundList)
        if (foundList.length>0) {
          lastLetter = iconLetter
          validIconList.push(getChIcon(iconLetter,level1,iconLetter))
        }
      })
      if (validIconList.length===1) {
        setLevel2(lastLetter)
        setCurLevel(3)
        addSkipLevel(2)
        validIconList = []
        validBookList = []
      }
    }
    if (curLevel===3){
      naviChapters[level1][level2].forEach((bookObj,i) => {
        validIconList.push(getChIcon(i,level1,level2,bookObj))
      })
    } else if (curLevel===4){
      const bookObj = naviChapters[level1][level2][level3]
      const {bk} = bookObj
      if (bk!=null){
        if (bookObj.beg==null) bookObj.beg = 1
        if (bookObj.end==null) bookObj.end = chInBook[bk]
        const {beg,end} = bookObj
        rangeArray(beg,end).forEach(ch => {
          validIconList.push(getChIcon(ch,level1,level2,bookObj,ch))
//          validIconList.push(getChIcon(index here,level1,bookObj,ch,ch))
        })
      }
    }
  }
  let useCols = 3
  if (size==="xs") useCols = 2
  else if (size==="lg") useCols = 4
  else if (size==="xl") useCols = 5
  const largeScreen = (width>=768)
  return (
    <div className={classes.info}>
      <Fab
        onClick={handleReturn}
        className={largeScreen ? classes.exitButtonLS : classes.exitButton}
        color="primary"
      >
        <NavClose />
      </Fab>
      <Typography
        type="title"
      >Bible Navigation</Typography>
      <GridList
        cellHeight="auto"
        cols={useCols}
        className={classes.gridListRoot}
      >
      {validIconList.map(iconObj => {
        const {key,imgSrc,title,subtitle,isBookIcon} = iconObj
        return (
          <GridListTile
            className={classes.tile}
            classes={{
              imgFullWidth: classes.imgFullWidth,
              imgFullHeight: classes.imgFullHeight,
            }}
            onClick={(ev) => handleClick(ev,key,isBookIcon)}
            key={key}
          >
            <img
              src={imgSrc}
              alt={title}/>
            <SerieGridBar
              classes={classes}
              title={title}
              subtitle={subtitle}
            />
          </GridListTile>
        )
      })}
      </GridList>
    </div>
  )
}

export default withStyles(styles, { withTheme: true })(withTranslation()(CboxBibleNavigation));
