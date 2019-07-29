export const osisAudiobibleId = {
  "A": ["Gen","Exod","Lev","Num","Deut","Josh","Judg","Ruth","1Sam","2Sam",
        "1Kgs","2Kgs","1Chr","2Chr","Ezra","Neh","Esth","Job",
        "Ps","Prov","Eccl","Song","Isa","Jer","Lam","Ezek","Dan","Hos",
        "Joel","Amos","Obad","Jonah","Mic","Nah","Hab","Zeph","Hag","Zech","Mal"],
  "B": ["Matt","Mark","Luke","John","Acts",
        "Rom","1Cor","2Cor","Gal","Eph","Phil","Col","1Thess","2Thess",
        "1Tim","2Tim","Titus","Phlm","Heb","Jas","1Pet","2Pet",
        "1John","2John","3John","Jude","Rev"]
}

export const osisIdAudiobibleTitle = {
  "Gen": "Genesis",
  "Exod": "Exodus",
  "Lev": "Leviticus",
  "Num": "Numbers",
  "Deut": "Deuteronomy",
  "Josh": "Joshua",
  "Judg": "Judges",
  "Ruth": "Ruth",
  "1Sam": "1Samuel",
  "2Sam": "2Samuel",
  "1Kgs": "1Kings",
  "2Kgs": "2Kings",
  "1Chr": "1Chronicles",
  "2Chr": "2Chronicles",
  "Ezra": "Ezra",
  "Neh": "Nehemiah",
  "Esth": "Esther",
  "Job": "Job",
  "Ps": "Psalms",
  "Prov": "Proverbs",
  "Eccl": "Ecclesiastes",
  "Song":	"Song of Solomon",
  "Isa": "Isaiah",
  "Jer": "Jeremiah",
  "Lam": "Lamentations",
  "Ezek": "Ezekiel",
  "Dan": "Daniel",
  "Hos": "Hosea",
  "Joel": "Joel",
  "Amos": "Amos",
  "Obad": "Obadiah",
  "Jonah": "Jonah",
  "Mic": "Micah",
  "Nah": "Nahum",
  "Hab": "Habakkuk",
  "Zeph": "Zephaniah",
  "Hag": "Haggai",
  "Zech": "Zechariah",
  "Mal": "Malachi",
  "Matt": "Matthew",
  "Mark": "Mark",
  "Luke": "Luke",
  "John": "John",
  "Acts": "Acts",
  "Rom": "Romans",
  "1Cor": "1Corinthians",
  "2Cor": "2Corinthians",
  "Gal": "Galatians",
  "Eph": "Ephesians",
  "Phil": "Philippians",
  "Col": "Colossians",
  "1Thess": "1Thess",
  "2Thess": "2Thess",
  "1Tim": "1Timothy",
  "2Tim": "2Timothy",
  "Titus": "Titus",
  "Phlm": "Philemon",
  "Heb": "Hebrews",
  "Jas": "James",
  "1Pet": "1Peter",
  "2Pet": "2Peter",
  "1John": "1John",
  "2John": "2John",
  "3John": "3John",
  "Jude": "Jude",
  "Rev": "Revelation"
}

const pad = (n) => {
  return ((n < 10) && (n >=0)) ? ("0" + n) : n;
}

const arrayToIndexedObj = (array) =>
  array.reduce((obj,item,i) => {
    const prefixStr = (i < nbrBooksInOT) ? "A" : "B"
    const nbr = i % nbrBooksInOT
    obj[item] = prefixStr + pad(nbr+1)
    return obj
  }, {})

export const nbrBooksInOT = osisAudiobibleId["A"].length
export const nbrBooksInNT = osisAudiobibleId["B"].length
export const osisBooksArr = [...osisAudiobibleId["A"], ...osisAudiobibleId["B"]]

export const audiobibleOsisId = arrayToIndexedObj(osisBooksArr)

export const osisFromAudioId = (checkStr) => {
  let retId
  if ((checkStr!=null) && (checkStr.length===3)){
    const letter = checkStr[0].toUpperCase()
    const inxStr = checkStr.substr(1,2)
    const inx = parseInt(inxStr)
    if ((inx!=null)&& (inx>0)) {
      if ((letter==="A") && (inx <= nbrBooksInOT)) {
        retId = osisAudiobibleId.A[inx-1]
      } if ((letter==="B") && (inx <= nbrBooksInNT)) {
        retId = osisAudiobibleId.B[inx-1]
      }
    }
  }
  return retId
}

export const checkAudioId = (checkStr) => osisFromAudioId(checkStr)!=null
