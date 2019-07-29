export const naviSortOrder = [ 1, 2, 3, 4, 10, 5, 6, 7, 8, 9]

export const chInBook = {
  "Gen":50,"Exod":40,"Lev":27,"Num":36,"Deut":34,"Josh":24,"Judg":21,"Ruth":4,
  "1Sam":31,"2Sam":24,"1Kgs":22,"2Kgs":25,"1Chr":29,"2Chr":36,"Ezra":10,"Neh":13,
  "Esth":10,"Job":42,"Ps":150,"Prov":31,"Eccl":12,"Song":8,"Isa":66,
  "Jer":52,"Lam":5,"Ezek":48,"Dan":12,"Hos":14,"Joel":3,"Amos":9,"Obad":1,
  "Jonah":4,"Mic":7,"Nah":3,"Hab":3,"Zeph":3,"Hag":2,"Zech":14,"Mal":4,
  "Matt":28,"Mark":16,"Luke":24,"John":21,"Acts":28,"Rom":16,
  "1Cor":16,"2Cor":13,"Gal":6,"Eph":6,"Phil":4,"Col":4,"1Thess":5,"2Thess":3,
  "1Tim":6,"2Tim":4,"Titus":3,"Phlm":1,"Heb":13,"Jas":5,"1Pet":5,"2Pet":3,
  "1John":5,"2John":1,"3John":1,"Jude":1,"Rev":22
}

export const osisIdEngTitle = {
  "Gen": "Genesis",
  "Exod": "Exodus",
  "Lev": "Leviticus",
  "Num": "Numbers",
  "Deut": "Deuteronomy",
  "Josh": "Joshua",
  "Judg": "Judges",
  "Ruth": "Ruth",
  "1Sam": "1 Samuel",
  "2Sam": "2 Samuel",
  "1Kgs": "1 Kings",
  "2Kgs": "2 Kings",
  "1Chr": "1 Chronicles",
  "2Chr": "2 Chronicles",
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
  "1Cor": "1 Corinthians",
  "2Cor": "2 Corinthians",
  "Gal": "Galatians",
  "Eph": "Ephesians",
  "Phil": "Philippians",
  "Col": "Colossians",
  "1Thess": "1 Thessalonians",
  "2Thess": "2 Thessalonians",
  "1Tim": "1 Timothy",
  "2Tim": "2 Timothy",
  "Titus": "Titus",
  "Phlm": "Philemon",
  "Heb": "Hebrews",
  "Jas": "James",
  "1Pet": "1 Peter",
  "2Pet": "2 Peter",
  "1John": "1 John",
  "2John": "2 John",
  "3John": "3 John",
  "Jude": "Jude",
  "Rev": "Revelation"
}

export const naviBooksLevel1 = {
  1:["Gen"],
  2:["Exod","Lev","Num","Deut","Josh"],
  3:["Judg","Ruth","1Sam"],
  4:["1Sam","2Sam","1Chr","1Kgs","1Kgs","2Chr"],
  5:["1Kgs","2Kgs","2Chr","2Chr","Amos","Jonah","Isa","Jer","Lam"],
  6:["Dan","Ezek","Ezra","Hag","Zech","Esth","Neh","Mal",
     "Hos", "Joel", "Obad", "Mic", "Nah", "Hab", "Zeph"],
  7:["Matt","Mark","Luke","John"],
  8:["Acts"],
  9:["Rom","1Cor","2Cor","Gal","Eph","Phil","Col","1Thess","2Thess",
     "1Tim","2Tim","Titus","Phlm","Heb","Jas","1John","2John","3John",
     "1Pet","2Pet","Jude","Rev"],
  10:["Job","Ps","Prov","Eccl","Song"]
}

export const naviBooksLevel2 = {
     1: {
     a: ["Gen"],
     b: ["Gen"],
     c: ["Gen"],
     d: ["Gen"],
     e: ["Gen"]
  }, 2: {
    a: ["Exod"],
    b: ["Exod"],
    c: ["Exod"],
    d: ["Exod"],
    e: ["Lev","Num"],
    f: ["Deut"],
    g: ["Josh"],
  }, 3: {
    a: ["Judg"],
    b: ["Ruth"],
    c: ["1Sam"],
  }, 4: {
    a: ["1Sam"],
    b: ["1Sam"],
    d: ["2Sam","1Chr"],
    e: ["1Kgs"],
    f: ["1Kgs","2Chr"],
  }, 5: {
    a: ["1Kgs","2Kgs","2Chr","2Chr"],
    b: ["2Kgs","Amos","Jonah"],
    c: ["2Chr"],
    d: ["Isa","Jer"],
  }, 6: {
    a: ["Dan"],
    b: ["Ezek"],
    c: ["Ezra"],
    d: ["Esth"],
    e: ["Ezra","Neh"],
    f: ["Neh","Neh","Mal"],
    g: ["Hos","Joel","Obad","Mic"],
    h: ["Nah","Hab","Zeph"],
  }, 7: {
    a: ["Matt"],
    b: ["Mark"],
    c: ["Luke"],
    d: ["John"],
  }, 8: {
    a: ["Acts"],
    b: ["Acts"],
    c: ["Acts"],
    d: ["Acts"],
  }, 9: {
    a: ["Rom","1Cor","2Cor","Gal","Eph","Phil","Col","1Thess","2Thess"],
    b: ["1Tim","2Tim","Titus","Phlm"],
    c: ["Heb","Jas","1John","2John","3John","1Pet","2Pet","Jude"],
    d: ["Rev"]
  }, 10: {
    a: ["Job"],
    b: ["Ps"],
    c: ["Ps"],
    d: ["Ps"],
    e: ["Ps"],
    f: ["Ps"],
    g: ["Prov"],
    h: ["Eccl"],
    i: ["Song"]
  }
}

export const naviChapters = {
     1: {
     a: [{bk:"Gen",beg:1,end:4}],
     b: [{bk:"Gen",beg:6,end:11}],
     c: [{bk:"Gen",beg:12,end:24}],
     d: [{bk:"Gen",beg:25,end:35}],
     e: [{bk:"Gen",beg:37,end:49}]
  }, 2: {
    a: [{bk:"Exod",beg:1,end:12}],
    b: [{bk:"Exod",beg:12,end:16}],
    c: [{bk:"Exod",beg:19,end:24}],
    d: [{bk:"Exod",beg:25,end:39}],
    e: [{bk:"Lev"},{bk:"Num"}],
    f: [{bk:"Deut"}],
    g: [{bk:"Josh"}],
  }, 3: {
    a: [{bk:"Judg"}],
    b: [{bk:"Ruth"}],
    c: [{bk:"1Sam",beg:1,end:8}],
  }, 4: {
    a: [{bk:"1Sam",beg:9,end:15}],
    b: [{bk:"1Sam",beg:16,end:31}],
    d: [{bk:"2Sam",beg:1,end:18},{bk:"1Chr",beg:10,end:19}],
    e: [{bk:"1Kgs",beg:1,end:2}],
    f: [{bk:"1Kgs",beg:3,end:11},{bk:"2Chr",beg:1,end:6}],
  }, 5: {
    a: [
          {bk:"1Kgs",beg:12,end:21},
          {bk:"2Kgs",beg:1,end:3},
          {bk:"2Chr",beg:10,end:10},
          {bk:"2Chr",beg:22,end:24}
       ],
    b: [{bk:"2Kgs",beg:4,end:25},{bk:"Amos"},{bk:"Jonah"}],
    c: [{bk:"2Chr",beg:29,end:36}],
    d: [{bk:"Isa"},{bk:"Jer"}],
  }, 6: {
    a: [{bk:"Dan"}],
    b: [{bk:"Ezek"}],
    c: [{bk:"Ezra",beg:1,end:6}],
    d: [{bk:"Esth"}],
    e: [{bk:"Ezra",beg:7,end:10},{bk:"Neh",beg:8,end:12}],
    f: [{bk:"Neh",beg:1,end:7},{bk:"Neh",beg:13,end:13},{bk:"Mal",beg:1,end:4}],
    g: [{bk:"Hos"},{bk:"Joel"},{bk:"Obad"},{bk:"Mic"}],
    h: [{bk:"Nah"},{bk:"Hab"},{bk:"Zeph"}],
  }, 7: {
    a: [
          {bk:"Matt",beg:1,end:11},
          {bk:"Matt",beg:12,end:15},
          {bk:"Matt",beg:16,end:20},
          {bk:"Matt",beg:21,end:25},
          {bk:"Matt",beg:26,end:28}
       ],
    b: [{bk:"Mark",beg:1,end:13},{bk:"Mark",beg:14,end:16}],
    c: [{bk:"Luke",beg:1,end:6},{bk:"Luke",beg:7,end:19},{bk:"Luke",beg:20,end:24}],
    d: [{bk:"John",beg:1,end:12},{bk:"John",beg:13,end:17},{bk:"John",beg:18,end:21}],
  }, 8: {
    a: [{bk:"Acts",beg:1,end:7}],
    b: [{bk:"Acts",beg:8,end:12}],
    c: [{bk:"Acts",beg:13,end:20}],
    d: [{bk:"Acts",beg:21,end:28}],
  }, 9: {
    a: [{bk:"Rom"},{bk:"1Cor"},{bk:"2Cor"},{bk:"Gal"},{bk:"Eph"},{bk:"Phil"},
        {bk:"Col"},{bk:"1Thess"},{bk:"2Thess"}],
    b: [{bk:"1Tim"},{bk:"2Tim"},{bk:"Titus"},{bk:"Phlm"}],
    c: [{bk:"Heb"},{bk:"Jas"},{bk:"1John"},{bk:"2John"},{bk:"3John"},
        {bk:"1Pet"},{bk:"2Pet"},{bk:"Jude"}],
    d: [{bk:"Rev"}]
  }, 10: {
    a: [{bk:"Job"}],
    b: [{bk:"Ps",beg:1,end:41}],
    c: [{bk:"Ps",beg:42,end:72}],
    d: [{bk:"Ps",beg:73,end:89}],
    e: [{bk:"Ps",beg:90,end:106}],
    f: [{bk:"Ps",beg:107,end:150}],
    g: [{bk:"Prov"}],
    h: [{bk:"Eccl"}],
    i: [{bk:"Song"}]
  }
}
