'use strict';

import {Device as HomeyDevice } from 'homey';
import fglair from '../../lib/fglair';

class FGLAirDevice extends HomeyDevice {
  homey: any;
  private _fglair: fglair | undefined;
  private _readTimer: NodeJS.Timeout | undefined;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit(): Promise<void> {
    this.log('FGLAirDevice has been initialized');

    this._fglair = new fglair(this.homey.settings);      

    this.registerCapabilityListener('custom_extended_mode', (value, opts) => {
      return this.onOpdateCustomExtendedMode(value, opts);
    });

    this.registerCapabilityListener('target_temperature', (value, opts) => {
      return this.onUpdateTargetTemperature(value, opts);
    });

    if (this.hasCapability('thermostat_mode')) {
      this.registerCapabilityListener('thermostat_mode', (value, opts) => {
        return this.onUpdateThermostatMode(value, opts);
      });
    }    

    this.readState();

  }
  
  async onUpdateTargetTemperature(value, opts) {

    this.clearReadSchedule();

    try {
      await this._fglair?.setTargetTemperature(this.getData().id, value);
    }
    catch(error) {
      this.log(`error while setting target temperature to ${value}`);
    }
    finally {
      this.scheduleRead(1);
    }
  }

  async onUpdateThermostatMode(value, opts) {
    
    this.clearReadSchedule();

    try {
      await this._fglair?.setMode(this.getData().id, value, 'none');  
    }
    catch (error) {
      this.log(`error while changing mode to ${value}`);
    }
    finally {
      this.scheduleRead(1);
    }
  }

  async onOpdateCustomExtendedMode(value, opts) {
    
    this.clearReadSchedule();

    try {
      await this._fglair?.setMode(this.getData().id, 'off', value);    
    }
    catch (error) {
      this.log(`error while changing extended mode to ${value}`);
    }
    finally {
      this.scheduleRead(1);
    }
  }

  scheduleRead(seconds?: number) {
    this._readTimer = setTimeout(this.readState.bind(this), (seconds || 15) * 1000);
  }

  clearReadSchedule() {
    if (this._readTimer) {
      clearTimeout(this._readTimer);
      this._readTimer = undefined;
    }
  }

  async readState() {

    this.clearReadSchedule();

    try {    
      const status = await this._fglair?.getDeviceStatus(this.getData().id);

      await this.setCapabilityValueEx('target_temperature', status?.temperature);
      await this.setCapabilityValueEx('thermostat_mode', status?.operationMode);
      await this.setCapabilityValueEx('custom_extended_mode', status?.extendedModes);
      await this.setCapabilityValueEx('measure_temperature', status?.currentTemperature);
    }
    finally {
      this.scheduleRead();
    }
  }

  async setCapabilityValueEx(capabilityId: string, value: any) : Promise<void> {
    try {
      await this.setCapabilityValue(capabilityId, value);
    } catch (error) {
      this.log(`error while setting ${capabilityId} to ${value} - ${error.message}`);
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded(): Promise<void> {
    this.log('FGLAirDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings(oldSettings: any, newSettings: any, changedKeys: any[]): Promise<string | void> {
    this.log('FGLAirDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: any): Promise<void> {
    this.log('FGLAirDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted(): Promise<void> {
    this.log('FGLAirDevice has been deleted');
  }
}

export default FGLAirDevice;
