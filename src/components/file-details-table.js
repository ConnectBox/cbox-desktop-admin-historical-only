import React, { useState } from "react";
import i18next from 'i18next';
import TableSubmit from "./table-submit";

const FileDetailsTable = props => {
  const { ...other } = props
  const [rows,setRows] = useState([])

  return (
    <TableSubmit
      { ...other }
      header={[
        {
          prop: "inUse",
          type: "checkbox",
        },
        {
          name: i18next.t("id"),
          prop: "id",
          type: "hidden",
        },
        {
          name: i18next.t("title"),
          prop: "title",
          width: 200,
          canEdit: true
        },
        {
          name: i18next.t("descr"),
          prop: "descr",
          width: 200,
          canEdit: true
        },
        {
          name: i18next.t("image"),
          prop: "image",
          type: "image",
          height: 80,
          canEdit: false
        },
        {
          name: i18next.t("fname"),
          prop: "fname",
          width: 150,
          canEdit: false
        },
      ]}
    />
  )
}

export default FileDetailsTable;
