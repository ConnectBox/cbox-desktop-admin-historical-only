import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import CheckIcon from "@material-ui/icons/Check";
import CancelIcon from "@material-ui/icons/Cancel";
import TableCell from '@material-ui/core/TableCell';
import ImageCollections from '@material-ui/icons/Collections';
import Button from '@material-ui/core/Button';

const InlineForm = props => {
  const { onUpdateCol, onSubmit } = props
  const [ values, setValues ] = useState(props.data)
  const handleUpdateCol = (ev,col) => onUpdateCol && onUpdateCol(ev,col)
  const change = (value,key) => {
    setValues({
      ...values,
      [key]: value
    })
  }
  const validate = () => false
  const handleSubmit = e => {
    e.stopPropagation()
    const err = validate()
    if (!err) onSubmit(values)
  }
  const getRowData = (col) => {
    if (col.type && col.type==="checkbox") {
      return "#"
    } else if (col.type && col.type==="image") {
      return (
        <Button
          color="primary"
          onClick={(ev) => handleUpdateCol(ev,col.prop)}>
          <ImageCollections />
        </Button>
      )
    }
    return values[col.prop]
  }
  const { header } = props
  return [
    header.filter(col => {
      return (col.type==null || col.type!=="hidden")
    }).map((col, k) => {
      const errStr = ""
      const hasError = (errStr!=null)&&(errStr.lenght>0)
      const valueStr = hasError ? errStr : getRowData(col)
      return (
        <TableCell key={`trc-${k}`}>
          {col.canEdit ? (<TextField
            label={col.name}
            onChange={(ev) => change(ev.target.value,col.prop)}
            value={valueStr}
            error={hasError}
          />) : valueStr}
        </TableCell>
      )}
    ),
    <TableCell key="icon-row-column">
      <CheckIcon onClick={onSubmit && handleSubmit} />
      <CancelIcon onClick={props.stopEditing} />
    </TableCell>
  ];
}

export default InlineForm
