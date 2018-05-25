'use strict';

const path = require('path');

// LG - 11 May 2018
// - Bug Fix: Introduce decodeURI in order to be able to accept spaces in filenames
module.exports = {
  basepath ( base ) {
    return uri => {
      if ( uri.pathname ) {
        return decodeURI(path.join( base, uri.hostname, uri.pathname) );
      }
      return decodeURI(path.join( base, uri.hostname ));
    };
  }
};
