# gridView

> Vue.js Single File Component Grid View

Sample running demo at https://mazengh.github.io/grid-view

### About

Grid View is a table grid component for a firebase object representing tablular data.

This sample project is an example of refactoring messy code to a more readable code that doesn't
feature any nested v-ifs in v-for directives in the template tag. The source code for the messy code
is available in the `messy-code` folder at the root level.

This component offers the below features

- A **responsive** layout
- Ability to **toggle** data columns
- Ability to **sort** columns
- Ability to **search** data
- Ability to **filter** data with logical operators =, >, >=, <, <=, !=, <>
- Ability to **paginate** results based on configured page size
- Ability to select rows to **export** the **visible** results to CSV file
- Ability to **edit** cell data based on editable column in config

The CSS for this project can be refactored, cleaned and improved. The project can also be improved
by abstracting the database connection layer and making it compatible with other database systems
like MySQL.

The component can be adapted for usage as a widget in a dashboard.

## Install

    $ git clone https://github.com/mazengh/gridView.git
    $ cd PROJECT

### Configure app

- Copy `src/firebaseConfig.default.js` to `src/firebaseConfig.js` then edit it with your firebase
  database information.
- Configure default grid configuration variable to be passed as a prop to grid view component.
  Sample below.

```
    gridConfig: {
        tableName: "payments",  // parent object encapsulating grid objects
        colsToShow: [           // array of columns to be allow the user to view
          // column name, initial visibility, filtering expression, editable flag, format function for vue filtering
          { name: "name", visible: true, expr: "", editable: false },
          { name: "id", visible: true, expr: "", editable: false },
          {
            name: "amount",
            visible: true,
            expr: "",
            editable: false,
            format: function(
              value,
              filterComparison = false,
              compareWithFilter = false
            ) {
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
            }
          }
        ],
        colOrder: ["id", "name","amount"],  // column ordering
        pageSize: 10                        // number of results per page to display
      }
```

- Add component to template with configured prop object

## Build

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:8080
$ npm run dev

# build for production with minification
$ npm run build

# test coverage
$ npm test -- --coverage
```
