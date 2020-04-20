export default {
  tableName: "payments",
  colsToShow: [
    { name: "description", visible: true, expr: "", editable: true },
    { name: "name", visible: true, expr: "", editable: false },
    { name: "id", visible: true, expr: "", editable: false },
    {
      name: "date",
      visible: true,
      expr: "",
      editable: false,
      format: function(value, filterComparison = false, compareWithFilter = true) {
        try {
          if (filterComparison && !compareWithFilter) {
            return value;
          }
          if (value) {
            const dateObject = new Date(Date.parse(value)).toLocaleString();
            return dateObject;
          }
        } catch (e) {
          // return the default value if formatting fails
          return value;
        }
      },
    },
    {
      name: "amount",
      visible: true,
      expr: "",
      editable: false,
      format: function(value, filterComparison = false, compareWithFilter = false) {
        try {
          // do not compare data with filtered value if compareWithFilter is false
          if (filterComparison && !compareWithFilter) {
            return value;
          }
          if (value) {
            return `$${(value / 1).toFixed(2)}`;
          }
        } catch (e) {
          // return the default value if formatting fails
          return value;
        }
      },
    },
  ],
  colOrder: ["id", "name", "description", "date", "amount"],
  pageSize: 10,
};
