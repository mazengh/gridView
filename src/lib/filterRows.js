export default function filterRows(rows, columnsWithFilter) {
  // apply filters for columns with filters
  const filteredRows = rows.filter((row) => {
    for (const col of columnsWithFilter) {
      // =, >, >=, <, <=, !=, <>
      // search for logical comparison operator in string
      const comparisonOperator = col.expr.match("^(<[=>]?|=|>=?|!=)");

      // do not start filtering while user is inputing comparison operator
      if (comparisonOperator && comparisonOperator[0] === col.expr) {
        return true;
      }

      // if column specifies a format, get the requested
      // format for filter comparision, otherwise use the
      // raw data for the comparision
      let cellData = col.format ? col.format(row[col.name], true) : row[col.name];

      // perform logical comparisons
      if (comparisonOperator) {
        switch (comparisonOperator[0]) {
          case "=":
            return cellData == col.expr.substr(1);
          case ">":
            return cellData > col.expr.substr(1);
          case ">=":
            return cellData >= col.expr.substr(2);
          case "<":
            return cellData < col.expr.substr(1);
          case "<=":
            return cellData <= col.expr.substr(2);
          case "!=":
          case "<>":
            return cellData != col.expr.substr(2);
        }
      }

      // if type of cellData is not a string, convert it to string to use in regex
      if (!isNaN(cellData)) {
        cellData = cellData.toString();
      }

      const regexpr = new RegExp(col.expr, "gi");

      if (!cellData.match(regexpr)) {
        return false;
      }
    }
    return true;
  });

  return filteredRows;
}
