'use strict';

import { App as HomeyApp }  from 'homey';

class FGLAirApp extends HomeyApp {
  api: any;
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('FGLAirApp has been initialized');
  }
}

export default FGLAirApp;