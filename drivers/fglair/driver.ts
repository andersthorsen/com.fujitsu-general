import { Driver as HomeyDriver } from 'homey';
import fglair from '../../lib/fglair';

class FGLAirDriver extends HomeyDriver {
  //homey: any;
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit(): Promise<void> {    
    this.homey.log('FGLAirDriver has been initialized');
  }

  async onUninit(): Promise<void> {
    
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices(): Promise<any[]> {

    this.homey.log('onPairListDevices');

    const f = new fglair(this.homey.settings);

    f.failOnInvalidConfig();

    const devices = await f.getDevices();

    return devices;
  }
}

module.exports = FGLAirDriver;