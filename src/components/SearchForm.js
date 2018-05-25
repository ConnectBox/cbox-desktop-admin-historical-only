import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

const styles = {
	textField: {
		paddingLeft: 20,
		width: '85%',
		minWidth: 200,
	},
}

export default class SearchForm extends Component {
	state = {
		searchText: ''
	};

	onChange = value => {
		this.setState({searchText: value})
	};

	onSearch = () => {
		this.props.onSearch(this.state.searchText);
	};

	render() {
		return (
			<div>
				<TextField
					value={this.state.searchText}
					disabled
					onChange={(value) => this.onChange(value)}
					onKeyPress={(ev) => {
						if (ev.key === 'Enter') {
							ev.preventDefault();
							this.onSearch()
						}
					}}
					style={styles.textField}
					placeholder="Image keyword (Unsplash search)"
		    />
				<IconButton onClick={this.onSearch}>
					<SearchIcon />
				</IconButton>
			</div>
		);
	}
}
