import React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';

const styles = {
  textField: {
    marginTop: 10,
    marginLeft: 40,
    marginBottom: 20,
    width: '70%',
    maxWidth: 400,
  },
}

export class CboxTextField extends React.Component {
  state = {
    orgValue: "",
    editValue: "",
    errorText: "",
  }
  verifyValue = (value,verifyLength,updateOrg) => {
    let errorText = "";
    if ((value!=null) && (value.length<3)){
      const tmpOrgValue = this.state.orgValue;
      if ((tmpOrgValue!=null) && (tmpOrgValue.length>=3)){
        this.props.onUpdate(tmpOrgValue)
      }
      if (verifyLength) {
        errorText = 'Error: Invalid channel name (too short)';
      }
    }
    if (updateOrg){
      this.setState({
        orgValue: value,
        editValue: value,
        errorText
      });
    } else {
      this.setState({
        editValue: value,
        errorText
      });
    }
  }
  componentDidMount = () => {
    const { defaultValue, verifyLength } = this.props;
    if (defaultValue != null){
      this.verifyValue(defaultValue,verifyLength,true)
    }
  }
  componentWillReceiveProps(nextProps) {
    const { defaultValue, verifyLength } = nextProps;
    if ((this.props.defaultValue !== defaultValue)
        && ((this.state.orgValue==null) || (this.state.orgValue.length<=0))){
      this.verifyValue(defaultValue,verifyLength,true)
    }
  }
  onKeyPress = (e) => {
    if(e.key === 'Enter'){
      const tmpObj = {
        title: e.target.value
      }
      if (this.props.onChannelUpdate!=null){
        this.props.onChannelUpdate(tmpObj)
      }
    }
  }
  onChange = (event) => {
    this.verifyValue(event.target.value,this.props.verifyLength,false)
    if (this.props.onUpdate!=null){
      this.props.onUpdate(event.target.value)
    }
  }
  render = () => {
    const hasError = (this.state.errorText.length>0);
    return (
      <FormControl
        onKeyPress={(e) => this.onKeyPress(e)}
        style={styles.textField}
        error={hasError}
      >
        <InputLabel htmlFor="name-error">{this.props.label}</InputLabel>
        <Input
          id="name-error"
          value={this.state.editValue}
          onChange={this.onChange}
          autoFocus={this.props.autoFocus}/>
        {hasError
          && (<FormHelperText
                id="name-error-text">{this.state.errorText}</FormHelperText>)}
      </FormControl>
    )
  }
}
