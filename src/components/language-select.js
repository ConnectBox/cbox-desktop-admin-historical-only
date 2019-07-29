import React from 'react'
import Select from 'react-select'
//import {uniqueArray} from '../utils/obj-functions'
import './language-select.css'
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
  const handleChange = (selected) => {
    let selArr = []
    if (selected!=null){
      selected.forEach(obj => {
        selArr.push(obj.value)
      })
    }
    if (props.onSelectUpdate!=null) {
      props.onSelectUpdate(selArr)
    }
  }
  const getValue = (opts, val) => opts.find(o => o.value === val)
  let selectedLang = "eng"
  if ((props.languages!=null)&&(props.languages.length>0)){
    selectedLang = props.languages[0]
  }
  let langData = []
  Object.keys(iso639Langs).forEach(langKey => {
    langData.push({
      label: iso639Langs[langKey].name + " (" +iso639Langs[langKey].engName +")",
      value: langKey,
    })
  })
  return (
    <div style={styles.selectWrapper}>
        <Select
           style={styles.select}
           isDisabled={true}
           onChange={(val) => handleChange(val)}
           options={langData}
           isClearable={false}
           value={getValue(langData, selectedLang)}
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
  const { selLang, languages, multi, isSearchable } = props
  const tmpSearchable = isSearchable || false
  const handleChange = (selected) => {
    let selArr = []
    if (selected!=null){
      if (Array.isArray(selected)){
        selected.forEach(obj => {
          selArr.push(obj.value)
        })
      } else {
        selArr.push(selected)
      }
    }
    if (props.onLanguageUpdate!=null) {
      props.onLanguageUpdate(selArr)
    }
  }
  const getValues = (opts, values) => opts.filter(o => values.indexOf(o.value)>=0)
  let langData = []
  if ((languages!=null)&&(languages.length>0)){
    if (Array.isArray(languages)){
      languages.forEach(langKey => {
        if (iso639Langs[langKey]!=null){
          langData.push({
            label: iso639Langs[langKey].name + " (" +iso639Langs[langKey].engName +")",
            value: langKey,
          })
        }
      })
    }
  }
  let filteredSelLang = []
  if (!multi) {
    filteredSelLang = selLang
  } else if (selLang!=null){
    filteredSelLang = selLang.filter(item => {
      return !isEmptyObj(item)
    })
  }
  return (
    <div style={props.style || styles.multiSelectWrapper}>
        <Select
           style={styles.select}
           autoFocus
           isMulti={multi}
           isSearchable={tmpSearchable}
           isClearable={false}
           onChange={(val) => handleChange(val)}
           options={langData}
           name="langSelect"
           value={getValues(langData,filteredSelLang)}
         />
    </div>
  )
}
