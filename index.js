/* eslint-env node */
'use strict';
var map = require('broccoli-stew').map;
var path = require('path');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-cli-swiper',

  treeForVendor: function(defaultTree) {
    var trees = [];
    var swiperPath = path.join(path.dirname(require.resolve('swiper')), '..');
    var browserVendorLib = new Funnel(swiperPath, {
      destDir: 'swiper',
      include: ['js/swiper.min.js', 'css/swiper.min.css']
    });

    browserVendorLib = map(browserVendorLib, (content, relativePath) => {
      if (relativePath.indexOf('css') !== -1) {
        return content;
      }

      // HACK: the sourcemap included in swiper library breaks the build for production sourcemaps
      // this just removes it.  I've tried to add a treeForPublic to include the sourcemap so it loads
      // which works, but ember then thinks its the only source map and ignores the rest of the app
      // the real fix is probably to import the ESModules and have ember-cli generate its own sourcemaps
      content = content.replace('//# sourceMappingURL=maps/swiper.min.js.map', '');
      return `if (typeof FastBoot === 'undefined') { ${content} }`
    });

    if (defaultTree !== undefined) {
      trees.push(defaultTree);
    }

    trees.push(browserVendorLib);

    return new mergeTrees(trees);
  },

  included: function(app) {
    this._super.included.apply(this, arguments);

    this.app.import('vendor/swiper/js/swiper.min.js');
    this.app.import('vendor/swiper/css/swiper.min.css');
  }

};
