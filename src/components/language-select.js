import React from 'react';
import Select from 'react-select';
//import {uniqueArray} from '../utils/obj-functions';
import './language-select.css';
import 'react-select/dist/react-select.css';
import {isEmptyObj} from '../utils/obj-functions'
import {iso639Langs} from '../iso639-1-full.js'

const styles = {
  select: {
    boxSizing: 'border-box',
  },
  selectWrapper: {
    margin: "0 15px 0 40px",
    width: "60%",
    paddingBottom: 15,
  },
  multiSelectWrapper: {
    margin: "0 15px 0 40px",
    width: "85%",
    paddingBottom: 15,
  },
}

export const NavLangSelect = (props) => {

  const handleChange = (selArr) => {
    if (props.onSelectUpdate!=null) {
      props.onSelectUpdate(selArr)
    }
  }

  const selectedLang = "eng";
  let langData = [];
  Object.keys(iso639Langs).forEach(langKey => {
    langData.push({
      label: iso639Langs[langKey].name + " (" +iso639Langs[langKey].engName +")",
      value: langKey,
    })
  });
  return (
    <div style={styles.selectWrapper}>
        <Select
           style={styles.select}
           disabled={true}
           simpleValue
           onChange={(val) => handleChange(val)}
           options={langData}
           clearable={false}
           value={selectedLang}
         />
    </div>
  )
}

// ToDo: Get all the iso639-3 languages from remote host query in the VirtualizedSelect
// Verify the conditions for usage here: http://www-01.sil.org/iso639-3/download.asp
// https://www.npmjs.com/package/iso-639-3
//   - done! The remote async loading seems completely ok, like here:
//             "Combining Async and Creatable" from https://github.com/JedWatson/react-select/#usage
//              probably also wise to use "combine and promise" ?


export const LanguageSelect = (props) => {
  const { selLang, languages, onLanguageUpdate, multi } = props;

  const handleChange = (selArr) => {
    if (onLanguageUpdate!=null) {
      onLanguageUpdate(selArr)
    }
  }
  let langData = [];
  if ((languages!=null)&&(languages.length>0)){
    languages.forEach(langKey => {
      if (iso639Langs[langKey]!=null){
        langData.push({
          label: iso639Langs[langKey].name + " (" +iso639Langs[langKey].engName +")",
          value: langKey,
        })
      }
    });
  }
  let filteredSelLang = [];
  if (!multi) {
    filteredSelLang = selLang;
  } else if (selLang!=null){
    filteredSelLang = selLang.filter(item => {
      return !isEmptyObj(item)
    })
  }
  return (
    <div style={styles.multiSelectWrapper}>
        <Select
           style={styles.select}
           autoFocus
           multi={multi}
           onChange={(val) => handleChange(val)}
           options={langData}
           searchable={true}
           clearable={false}
           value={filteredSelLang}
         />
    </div>
  )
}
