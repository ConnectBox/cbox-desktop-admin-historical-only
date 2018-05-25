import React from 'react';
import { unique } from 'shorthash';
import { apiObjGetStorage } from '../utils/api';

class MediaStoreItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serieCurEp: undefined,
    };
  }

  restoreCurEp = (obj) => {
    const { usbHash } = this.props;
    let tmpEp = undefined;
    const tmpObj = {curSerie: obj};
    apiObjGetStorage(usbHash,tmpObj,"curEp").then((value) => {
      if (value==null){
        value=0;
      }
      if ((obj!=null) && (obj.fileList!=null)
          && (obj.fileList[value]!=null)){
        tmpEp=obj.fileList[value];
      }
      this.setState({serieCurEp: tmpEp})
    }).catch(function(err) {
      console.error(err);
    });
  }

  componentDidMount = () => {
    const {serie,curPlay} = this.props;
    if (serie!=null){
      if ((curPlay!=null) && (curPlay.curSerie===serie) && (curPlay.curEp!=null)){
        this.setState({serieCurEp: curPlay.curEp})
      } else {
        this.restoreCurEp(serie);
      }
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const {serie,curPlay} = nextProps;
    if (serie!=null){
      if (serie!==this.props.serie){
        if ((curPlay!=null) && (curPlay.curSerie===serie) && (curPlay.curEp!=null)){
          this.setState({serieCurEp: curPlay.curEp})
        } else {
          this.restoreCurEp(serie);
        }
      } else if ((curPlay!=null) && (this.props.curPlay!=null)
                  && (curPlay.curEp!==this.props.curPlay.curEp)){
        if ((curPlay.curSer===serie)
            && ((this.state.curEp==null)
                || (curPlay.curEp.id>this.state.curEp.id))){
          this.setState({serieCurEp: curPlay.curEp})
        }
      }
    }
  }

  render() {
    const { serie, onlyEpTitle } = this.props;
    const { serieCurEp } = this.state;
    let curEpDescr="";
    if (serieCurEp!=null){
      if (serieCurEp.title!=null){
        curEpDescr = serieCurEp.title
      } else {
        curEpDescr = serieCurEp.id +1;
      }
    }
    if (serie == null) {
      return (
        <div></div>
    )} else {
      return (
        <span
          className={unique(serie.title)+'_item item-div'}
        >
            {(!onlyEpTitle) && (<span className="Description">{serie.description}</span>)}
            <br/>
            <span className="EpDescription">{curEpDescr}</span>
        </span>
    )}
  }
};

export default MediaStoreItem;
