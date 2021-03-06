'use strict';

import { Driver as HomeyDriver } from 'homey';
import Homey from 'homey/lib/Homey';
import ManagerSettings from 'homey/manager/settings';
import fglair from '../../lib/fglair';

class FGLAirDriver extends HomeyDriver {
  homey: any;
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {    
    (this.homey as Homey).log('FGLAirDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices(): Promise<any[]> {

    (this.homey as Homey).log('onPairListDevices');

    const f = new fglair(this.homey.settings as ManagerSettings);

    f.failOnInvalidConfig();

    const devices = await f.getDevices();

    return devices;
  }
}

export default FGLAirDriver;