import React from "react";
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableRowSubmit from "./table-row-submit";

export default props => {
  const { data, header, headerData, onUpdateCell, onDeleteRow,
          onEditMode, onUpdateCol, ...other } = props
  const handleDeleteRow = (i) => onDeleteRow && onDeleteRow(i)
  const handleEditMode = (isEditMode) => onEditMode && onEditMode(isEditMode)
  const handleUpdateCol = (ev,col) => onUpdateCol && onUpdateCol(ev,undefined,col)
  const getRowData = (col) => {
    if (col.type && col.type==="checkbox") {
      return (
        <Checkbox
          checked={(headerData[col.prop]!=null) && headerData[col.prop]}
          color="primary"
          onChange={(ev) => handleUpdateCol(ev,col.prop)}
          value={col.prop}
          indeterminate={headerData[col.prop]==null}
        />
      )
    } else return col.name
  }
  return (
    <Table {...other} >
      {(data && (data.length>0)) && (<TableHead>
        <TableRow>
          {header.filter(col => {
              return (col.type==null || col.type!=="hidden")
          }).map((col, row) => (
            <TableCell key={`thc-${row}`}>
              <span>{getRowData(col)}</span>
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableHead>)}
      <TableBody>
        {data && data.map((col, row) =>
          <TableRowSubmit key={`tr-${row}`}
            header={header}
            rowData={col}
            onSubmit={(val) => onUpdateCell(row,val)}
            onEditMode={(isEditMode) => handleEditMode(isEditMode)}
            onDeleteRow={() => handleDeleteRow(row)}
            onUpdateCol={(ev,col) => onUpdateCol(ev,row,col)}
          />
        )}
      </TableBody>
    </Table>
  )
}
