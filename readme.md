Broccoli-materialize
---

Materialize [http://materializecss.com/] has a weird way of setting up their distro that basically makes it impossible to use for amd, so after I made it work in my project I decided to make a plugin to make my brocfile a little less ugly.

### Install
`npm install --save-dev broccoli-materialize`

### Usage in Brocfile.js
```
var path = require('path')
var Funnel = require('broccoli-funnel');
var BroccoliMaterialize = require('broccoli-materialize');
var findup = require('findup');

var materializeRootPath = findup.sync(require.resolve('materialize-css'), 'package.json');
var materialize = new BroccoliMaterialize(materializeRootPath);
materialize = new Funnel(materialize, {
    destDir: 'materialize'
});
module.exports = [materialize];
```

This will generate a file structure like so:
```
- materialize
    - js
        - materialize.js
        - hammer.min.js
        - jquery.easing.1.3.js
        - jquery.hammer.js
        - velocity.min.js
        - date_picker
            - picker.js
            - picker.date.js
    - css
        ...
    - fonts
        ...
```

### RequireJS config
I'm using this with amd modules, and I had to modify my require config like so:
```
window.require = {
    shim: {
        "jquery.easing": ["jquery"],
        "velocity": ["jquery"]
    },
    paths: {
        "jquery.easing": "/path/to/materialize/js/jquery.easing.1.3",
        "jquery.hammer": "/path/to/materialize/js/jquery.hammer",
        "velocity": "/path/to/materialize/js/velocity.min",
        "hammerjs": "/path/to/materialize/js/hammer.min",
        "picker": "/path/to/materialize/js/date_picker/picker",
        "picker.date": "/path/to/materialize/js/date_picker/picker.date",
        "materialize": "/path/to/materialize/js/materialize"
    }
}
```

Issues
---

Just make an issue, or a Pull Request.
