import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();
import Homey  from 'homey';

class FGLAirApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit(): Promise<void> {
    this.log('FGLAirApp has been initialized');
  }

  async onUninit() {

  }
}

module.exports = FGLAirApp;