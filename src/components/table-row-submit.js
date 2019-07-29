import React, { useState } from "react";
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import EditIcon from "@material-ui/icons/Edit";
import TrashIcon from "@material-ui/icons/Delete";
import Checkbox from '@material-ui/core/Checkbox';
import InlineForm from "./inline-form";

export default (props) => {
  const { header, rowData, selectedList, onSubmit, onDeleteRow,
          onEditMode, onUpdateCol, ...other } = props
  const [ isEditing, setEditing ] = useState(false)
  const handleUpdateCol = (ev,col) => onUpdateCol && onUpdateCol(ev,col)
  const handleSetEditing = (val) => {
    onEditMode && onEditMode(val)
    setEditing(val)
  }
  const handleRemove = () => {
    onDeleteRow()
    handleSetEditing(false)
  }
  const handleSubmit = (val) => {
    onSubmit(val)
    handleSetEditing(false)
  }
  const getStyleStr = (col) => {
    if (col.width) return {width: `${col.width}px`}
    if (col.height) return {height: `${col.height}px`}
    return undefined
  }
  const getRowData = (col) => {
    if (col.type && col.type==="checkbox") {
      return (
        <Checkbox
          checked={rowData[col.prop]}
          color="primary"
          onChange={(ev) => handleUpdateCol(ev,col.prop)}
          value={col.prop}
        />
      )
    } else if (col.type && col.type==="image") {
      const useData = rowData[col.prop]
      if ((useData!=null) && (useData.length>0)) {
        return (
          <img src={rowData[col.prop]} alt={col.prop} style={getStyleStr(col)}/>
        )
      }
      return undefined
    }
    return rowData[col.prop]
  }
  return (
    <TableRow
      { ...other }
    >
      { isEditing && (
        <InlineForm
          onSubmit={onSubmit && handleSubmit}
          onUpdateCol={onUpdateCol}
          header={header}
          data={rowData}
          stopEditing={() => handleSetEditing(false)}
        />
      )}
      { !isEditing && header.filter(col => {
          return (col.type==null || col.type!=="hidden")
        }).map((col, k) => (
          <TableCell style={getStyleStr(col)} key={`trc-${k}`}>{getRowData(col)}</TableCell>
      ))}
      { !isEditing && (
        <TableCell style={{paddingLeft: 15, paddingRight: 15,}}>
          <EditIcon onClick={() => handleSetEditing(true)} />
          {onDeleteRow && (<TrashIcon onClick={onDeleteRow && handleRemove} />)}
        </TableCell>
      )}
    </TableRow>
  )
}
