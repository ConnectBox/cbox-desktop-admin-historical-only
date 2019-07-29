import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import CheckIcon from "@material-ui/icons/Check";
import CancelIcon from "@material-ui/icons/Cancel";

const styles = {
  textField: {
    color: 'rgba(0, 0, 0, 0.87)'
  },
  firstIcon: {
    marginTop: 15,
    marginLeft: 40,
  },
}

const TextFieldSubmit = props => {
  const { onSubmit, value, ...other} = props
  const [ curVal, setValue ] = useState(value)
  const isEditing = value !== curVal
  const handleCancel = () => setValue(value)
  const handleChange = (nextVal) => setValue(nextVal)
  const handleSubmit = () => {
    onSubmit && onSubmit(curVal)
    handleCancel()
  }
  return (
    <div style={styles.textField}>
      <TextField
        {...other}
        value={curVal || ""}
        onChange={(ev) => handleChange(ev.target.value)}
      />
      {isEditing && <CheckIcon style={styles.firstIcon} onClick={handleSubmit} />}
      {isEditing && <CancelIcon onClick={handleCancel} />}
    </div>
  )
}
export default TextFieldSubmit;
