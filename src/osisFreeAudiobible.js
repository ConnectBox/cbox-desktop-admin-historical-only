export const osisId = [
  "Gen","Exod","Lev","Num","Deut","Josh","Judg","Ruth","1Sam","2Sam",
  "1Kgs","2Kgs","1Chr","2Chr","Ezra","Neh","Esth","Job","Ps","Prov","Eccl","Song",
  "Isa","Jer","Lam","Ezek","Dan","Hos","Joel","Amos","Obad","Jonah","Mic","Nah",
  "Hab","Zeph","Hag","Zech","Mal",
  "Matt","Mark","Luke","John","Acts","Rom","1Cor","2Cor","Gal","Eph","Phil",
  "Col","1Thess","2Thess","1Tim","2Tim","Titus","Phlm","Heb","Jas",
  "1Pet","2Pet","1John","2John","3John","Jude","Rev"
]
export const freeAudioId = [
  "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI",
  "1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG",
  "ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON",
  "MIC","NAM","HAB","ZEP","HAG","ZEC","MAL",
  "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP",
  "COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE",
  "1JN","2JN","3JN","JUD","REV"
]

const arrayToIndexedObj = (array1,array2) =>
  array1.reduce((obj,item,i) => {
    obj[item] = array2[i]
    return obj
  }, {})

export const osisFreeAudioIdMap = arrayToIndexedObj(freeAudioId,osisId)
export const freeAudioIdOsisMap = arrayToIndexedObj(osisId,freeAudioId)

const exceptionList = {
"1JO": "1JN",
"1KG": "1KI",
"2JO": "2JN",
"2KG": "2KI",
"3JO": "3JN",
"EZE": "EZK",
"JOH": "JHN",
"JOE": "JOL",
"MAR": "MRK",
"NAH": "NAM",
"PHI": "PHP",
"PHL": "PHM",
"PS": "PSA",
"SON": "SNG",
}

export const osisFreeAudiobibleId = osisId.map(id => {
  if (id==="Judg") id="JDG"
  let retId = id.substr(0,3).toUpperCase()
  if (exceptionList[retId]!=null){
    retId = exceptionList[retId]
  }
  return retId
})

export const osisFromFreeAudioId = (checkStr) => {
  let retId
  if ((checkStr!=null) && (checkStr.length===3)){
    retId = osisFreeAudioIdMap[checkStr]
  }
  return retId
}

export const checkFreeAudioId = (checkStr) => osisFromFreeAudioId(checkStr)!=null
