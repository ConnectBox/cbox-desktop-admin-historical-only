import React, { useState, useEffect, useContext } from 'react'
import { CboxContext } from '../cbox-context'
import axios from 'axios'
import './img-grid.css'
import cred from '../cred'
import { getHostPathSep, getRelPath } from '../utils/file-functions'
import { isPathInsideUsb, getLocalMediaFName,
            removeOrgPathPrefix } from '../utils/obj-functions'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import UnsplashGridList from './unsplash-gridlist'
import SearchForm from './SearchForm'
import Button from '@material-ui/core/Button'
import { Upload } from 'mdi-material-ui'
import { withTranslation } from 'react-i18next'

const styles = {
  button: {
    left: '91%',
  },
  mainSearchDiv: {
  },
  title: {
    marginLeft: 15,
  },
  image: {
    margin: '18px 0 0 24px',
    maxWidth: 100,
    maxHeight: 100,
    width: "auto",
    height: "auto"
  },
  search: {
    top: 40,
    paddingLeft: 20,
    margin: '0 auto',
    maxWidth: 800
  },
  grpDiv: {
    paddingBottom: 10,
  },
}

const ImgGrid = (props) => {
  const scope = useContext(CboxContext)
  const { t, open, imgSrc, onSave, onClose } = props
  const { usbPath, height, width } = scope
  const [useImgSrc, setUseImgSrc] = useState(undefined)
  const [imgs, setImgs] = useState([])
  const [curQueryStr, setCurQueryStr] = useState("")
  const [curPage, setCurPage] = useState(1)
  const [curImage, setCurImage] = useState(undefined)
  const [loadingState, setLoadingState] = useState(false)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingText, setDownloadingText] = useState("")
  const [progressText, setProgressText] = useState("")
  const [percentProgress, setPercentProgress] = useState(0)
  useEffect(() => {
    window.ipcRendererOn('image-download-progress',(event, jsonObj) => {
      const obj = JSON.parse(jsonObj)
      const { received, total } = obj
      const locPercentProgress = (received * 100) / total
      const receivedMB = (received / 1000000).toFixed(2)
      const totalMB = (total / 1000000).toFixed(2)
      setIsDownloading(true)
      setDownloadingText(t("downloading"))
      setProgressText(receivedMB + " / " + totalMB + " Mbyte")
      setPercentProgress(locPercentProgress)
    })
    return () => {
      window.ipcRendererRemoveListener('image-download-progress')
    }
  }, [])

  useEffect(() => {
    window.ipcRendererOn('download-end',(event, value) => {
      setIsDownloading(false)
      setDownloadingText("")
      setProgressText("")
      setPercentProgress(0)
      onSave(curImage)
    })
    return () => {
      window.ipcRendererRemoveListener('download-end')
    }
  }, [curImage])

  useEffect(() => {
    if (usbPath && imgSrc) setUseImgSrc(removeOrgPathPrefix(usbPath,imgSrc))
  }, [usbPath,imgSrc])

  const uniqueArrayByThumb = (a,b) => a.filter(aItem => !b.some(bItem => {
    return aItem.urls.thumb === bItem.urls.thumb
  }))
  const performSearch = (query,page = 1) => {
    setLoadingState(true)
console.log(scope.accessToken)
		axios
      .get(`https://qombi.com/unsplashSearch`
            +`?query=${query}&page=${page}&id=${scope.accessToken}`)
			.then(data => {
        const uniqueArr = uniqueArrayByThumb(imgs,data.data)
        setImgs([...uniqueArr, ...data.data])
        setCurQueryStr(query)
        setCurPage(page)
        setLoadingState(false)
			})
			.catch(err => {
				console.log('Error happened during fetching!', err)
			})
  }

  const onConnect = () => {
console.log("connect")
    window.ipcRendererSend('connect-proxy')
  }

  const onClickPhoto = (index) => {
    if (onSave!=null){
      const orgImg = imgs[index]
      const retObj = {
        origin: "Unsplash",
        descr: orgImg.description || orgImg.alt_description,
        urls: orgImg.urls,
        links: orgImg.links,
        user: { name: orgImg.user.name, html: orgImg.user.links.html }
      }
      setCurImage(retObj)
      setIsDownloading(true)
      window.ipcRendererSend('download-image',{
        image: retObj,
        target: usbPath +getHostPathSep() + "x" +getHostPathSep() +"images.unsplash.com"
      })
    }
  }

  const loadItems = () => {
    performSearch(curQueryStr,curPage+1)
  }

  let mapppedImgList = []
  if (imgs!=null) {
    mapppedImgList = imgs.map((item) => {
      return {
        img: item.urls.thumb,
        descr: item.description || item.alt_description,
        link: item.links.html,
        author: item.user.name,
        userImg: item.user.profile_image.small,
        userLink: item.user.links.html,
      }
    })
  }
//    const loader = <div className="loader">Loading ...</div>
  let pixsActions = [
    <Button
      key="cancel"
      color="primary"
      variant="contained"
      onClick={onClose}>
      {t("cancel")}
    </Button>
  ]
  const isConnected = scope.accessToken
  if (!isConnected){
    pixsActions.push(
        (<Button
          key="connect"
          color="primary"
          variant="contained"
          onClick={onConnect}>
          {t("connect")}
        </Button>))
  }
  var items = []
  mapppedImgList.forEach((item, i) => {
      items.push(
          <div className="track" key={i}>
              <img src={item.src} width="150" height="150" alt={i}/>
          </div>
      )
  })
  const hideMoreButton = (items.length<=0) || loadingState || isDownloading
  return (
    <Dialog
      fullScreen
      onClose={onClose}
      open={open}
    >
      <DialogTitle id="select-picture-title">
        {(useImgSrc!=null) && (<img style={styles.image}
                                    src={getLocalMediaFName(usbPath,useImgSrc)}
                                    alt="selected"/>)}
        <span style={styles.title}>
          {t("selectImage")}
        </span>
      </DialogTitle>
      <div className="main-search-form" style={styles.mainSearchDiv}>
        {loadingState || isDownloading || !isConnected
          ? null
          : (
            <div style={styles.grpDiv}>
              <div style={styles.search}>
                <SearchForm autoFocus={true} onSearch={performSearch}/>
              </div>
            </div>
        )}
        <div className="main-content">
          {isDownloading
            ? null
            // Later we can add lightbox handling, navigating pages,
            // We also can add Unsplash search user/collections (inkl. navigation)
            : (
              <div>
                <UnsplashGridList
                  imgList={mapppedImgList}
                  onClick={onClickPhoto}
                  height={height}
                  width={width}
                />
                {hideMoreButton
                  ? null
                  : (
                    <Button
                      key="more"
                      color="secondary"
                      size="small"
                      onClick={loadItems}
                    >
                      {t("more")}
                    </Button>
                )}
              </div>
            )}
        </div>
      </div>
      <DialogActions>{pixsActions}</DialogActions>
    </Dialog>
  )
}

export default withTranslation()(ImgGrid)
