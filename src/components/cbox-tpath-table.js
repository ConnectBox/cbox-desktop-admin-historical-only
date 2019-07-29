import React from "react";
import i18next from 'i18next';
import TableSubmit from "./table-submit";

const CboxTPathTable = props => {
  const { ...other } = props
  return (
    <TableSubmit
      { ...other }
      header={[
        {
          name: i18next.t("tPath"),
          prop: "tPath",
          hidden: true,
          canEdit: true
        },
        {
          name: i18next.t("language", {count: 10}),
          prop: "tPLang",
          canEdit: false
        }
      ]}
    />
  )
}

export default CboxTPathTable;
