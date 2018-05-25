import url from 'url';
import isPathInside from 'path-is-inside';

export const isWin = window.isWin();

export const isEmpty = obj => ((obj==null) || (Object.getOwnPropertyNames(obj).length === 0))

export const isEmptyObj = obj => ((isEmpty(obj)) || (Object.keys(obj).length === 0))

export const arrayToObject = (array, keyField) =>
  array.reduce((obj, item) => {
    obj[item[keyField]] = item
    return obj
  }, {})

const getOrgPathPrefix = (orgPath) => {
  let retPath = "cbox:/" + orgPath;
  if (isWin) {
    retPath = "file://" + orgPath.replace(/\\/g, '/');
  }
  return retPath;
}

export const isPathInsideUsb = (curPath,orgPath) => {
  return isPathInside(curPath,orgPath)
}

export const getLocalImgFName = (orgPath,remoteUrl, key) => {
  const tmpPath = getOrgPathPrefix(orgPath);
  const checkURL = url.parse(remoteUrl);
  return tmpPath+"/x/" + checkURL.host + checkURL.pathname + "-" + key + ".jpg";
}

export const getLocalMediaFName = (orgPath,locUrl) => {
  const tmpPath = getOrgPathPrefix(orgPath);
  return tmpPath+"/" + locUrl;
}

export const getImgOfType = (orgPath,type) => {
  let retStr = process.env.PUBLIC_URL +"/icon/clapperboard.png";
  if (type==="aud"){
    retStr = process.env.PUBLIC_URL +"/icon/headphones.png";
  }
  return retStr;
}

export const getImgOfSerie = (orgPath,ser) => {
  const tmpPath = getOrgPathPrefix(orgPath);
  let retStr = process.env.PUBLIC_URL +"/img/Placeholder.png";
  if (ser!=null){
    if(ser.image!=null){
      if((ser.image.origin==="Unsplash")
        &&(ser.image.urls!=null)
        &&(ser.image.urls.raw!=null)){
        retStr = getLocalImgFName(orgPath,ser.image.urls.raw,"small");
      } else if((ser.image.origin==="Local")
        &&(ser.image.filename!=null)){
        retStr = tmpPath+"/" +ser.image.filename;
      }
    }
  }
  return retStr;
}

export const pad = (n) => {
  return ((n < 10) && (n >=0)) ? ("0" + n) : n;
}

export const removeAllDigits = str => str.replace(/\d/g, "")

export const keepAllDigits = str => str.replace(/\D/g, "")

export const uniqueArray = array => [ ...new Set(array)]

export const nbrOfKeysInObj = obj => ((obj==null) ? 0 : Object.getOwnPropertyNames(obj).length )

export const jsonEqual = (a,b) => JSON.stringify(a) === JSON.stringify(b)

export const nullToEmptyStr = str => {
  if (str==null){
    return ""
  } // else
  return str;
}

export const removeEqualEndOfStr = (a, b) => {
  var resStr = "";
  var diffFound = false;
  for (let i = a.length-1; i >= 0; i--) {
    if (diffFound || (a[i]!==b[i])){
      diffFound = true;
      resStr = a[i] + resStr;
    }
  }
  return resStr;
}

/* Example mapped function on object
const oMap = (o, f) => Object.assign(...Object.keys(o).map(k => ({ [k]: f(o[k]) })));
// For instance - square of each value:
let mappedObj = oMap(myObj, (x) => x * x);
*/
