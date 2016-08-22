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

var materializeRootPath = path.resolve(path.dirname(require.resolve('materialize-css')), '..')

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
        "materialize": "/path/to/materialize/js/materialize"
    }
}
```

Issues
---

Just make an issue, or a Pull Request.
