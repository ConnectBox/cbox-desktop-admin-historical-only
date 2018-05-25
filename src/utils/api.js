import localforage from 'localforage';
import { unique } from 'shorthash';

export const getIdFromItem = (curSerie) => {
  let retStr = "";
  if ((curSerie!=null)){
    const titleIdStr = unique(curSerie.title);
    retStr = titleIdStr;
  }
  return retStr;
}

export const getIdStr = (curObj,field) => {
  let retStr = "";
  if ((curObj!=null) && (curObj.curSerie!=null)){
    const titleIdStr = unique(curObj.curSerie.title);
    retStr = curObj.curSerie.language + "_" + titleIdStr;
    if (curObj.curEp!=null){
      retStr = retStr + "_" + curObj.curEp.id;
    }
    retStr = retStr + "_" + field;
  }
  return retStr;
}

export const apiSetStorage = (usbHash,key,value) => localforage.setItem(key,value)

export const apiGetStorage = async (usbHash,key) => {
  return localforage.getItem(key).then(async function(value) {
    return Promise.resolve(value);
  }).catch(function(err) {
    console.log(err);
  });
}

export const apiObjSetStorage = (usbHash,obj,field,value) => apiSetStorage(usbHash,getIdStr(obj,field),value)

export const apiObjGetStorage = async (usbHash,obj,field) => apiGetStorage(usbHash,getIdStr(obj,field))
