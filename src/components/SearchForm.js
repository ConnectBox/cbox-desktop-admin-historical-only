import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import { nullToEmptyStr } from '../utils/obj-functions'

const styles = {
	textField: {
		width: '85%',
		minWidth: 200,
	},
}

const SearchForm = (props) => {
	const {autoFocus} = props
	const [searchText, setStateTest] = useState('')
	const onChange = event => setStateTest(event.target.value)
	const onSearch = () => props.onSearch(searchText)
	return (
		<div>
			<TextField
				autoFocus={autoFocus}
        margin="dense"
        label="Keyword"
				value={nullToEmptyStr(searchText)}
				onChange={(ev) => onChange(ev)}
				onKeyPress={(ev) => {
					if ((ev.key === 'Enter') && (searchText.length>0)){
						ev.stopPropagation()
						onSearch()
					}
				}}
				style={styles.textField}
				placeholder="Image keyword (Unsplash search)"
	    />
			<IconButton
				disabled={(searchText.length<=0)}
				onClick={() => onSearch()}
			>
				<SearchIcon />
			</IconButton>
		</div>
	)
}

export default SearchForm
