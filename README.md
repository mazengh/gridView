# gridView [![coverage](https://badgen.net/codecov/c/github/mazengh/gridView)](https://codecov.io/gh/mazengh/gridView)

> Vue.js Single File Component Grid View

Sample running demo at https://brite-core-1d49c.firebaseapp.com/

### About

Grid View is a table grid component for a firebase object representing tablular data. 

The component was developed without any prior knowledge to the below:
  - Vue.js
  - VuexFire
  - Firebase
  - Jest
  
The development time required was anywhere between 20 to 25 hours.

The project can be improved by abstracting the database connection layer and making it 
compatible with other database systems like MySQL.

The component can be adapted for usage as a widget in a dashboard.

One of the useful CSS properties was flexbox whichhelped with alignment of elements.

My favorite modern JavaScript feature, which was used in the project, is the computed 
property name syntax because it allows for easier creation of dynamic objects.

Instead of:
```
var a = "b"
var c = {}
c[a] = "d"
```
You can write:
```
var a = "b"
var c = {[a]: "d"}
```

My Favorite Vue.js third party library used in this project is vue-fontawesome. 
It helped me use fontawesome as a component inside my grid template.


## Install

    $ git clone https://github.com/mazengh/gridView.git
    $ cd PROJECT

### Configure app

- Copy `firebaseConfig.default.js` to `firebaseConfig.js` then edit it with your firebase database information.
- Configure default grid configuration variable to be passed as a prop to grid view component. Sample below. 
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
    "@fortawesome/fontawesome-svg-core": "^1.2.17" \
    "@fortawesome/free-solid-svg-icons": "^5.8.1" \
    "@fortawesome/vue-fontawesome": "^0.1.6" \
    "firebase": "^5.9.2" \
    "vue": "^2.5.11" \
    "vue-loader": "^15.7.0" \
    "vue-router": "^3.0.2" \
    "vuex": "^3.1.0" \
    "vuexfire": "^2.3.1"

# serve with hot reload at localhost:8080
$ npm run dev

# build for production with minification
$ npm run build
```


