'use strict';

var init = require('../base/init');
var config = require('../base/config');
var expb = require('../express/express-base');

require('../writing/writing-new');
require('../writing/writing-view');
require('../writing/writing-list');
require('../writing/writing-update');
require('../writing/writing-delete');

require('../user/user-new');
require('../user/user-view');
require('../user/user-list');
require('../user/user-update');
require('../user/user-deactivate');
require('../user/user-reset-pass');

require('../about/about-all');
require('../counter/counter-all');
require('../banner/banner-all');
require('../redirect/redirect-all');

require('../writing/writing-listu'); // url 유저명 대조는 맨 마지막에

init.run(function (err) {
  if (err) throw err;
});
