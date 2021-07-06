import { ManagerSettings } from 'homey/lib/Homey';
import FglairApi from './fglairAPI';
import { DeviceStatus } from './types';

class fglair {
    private _settingsManager: ManagerSettings;
    private _fglairApi: FglairApi;
    
    constructor(settingsManager: ManagerSettings) {
        this._settingsManager = settingsManager;

        this._fglairApi = new FglairApi();

        this._fglairApi.setRegion(this.getRegion());
        this._fglairApi.setCredentials(this.getUsername(), this.getPassword());
    }

    public async setMode(dsn: string, mode: string, extendedMode: string): Promise<void> {

        switch (mode) {
            case 'auto':
                await this._fglairApi.setDeviceProp(dsn, 'operation_mode', 2);
                break;

            case 'heat':
                await this._fglairApi.setDeviceProp(dsn, 'operation_mode', 6);
                break;

            case 'cool':
                await this._fglairApi.setDeviceProp(dsn, 'operation_mode', 3);
                break;

            case 'off':
                switch (extendedMode) {
                    case 'none':
                        await this._fglairApi.setDeviceProp(dsn, 'operation_mode', 0);
                        break;
                    
                    case 'fan':
                        await this._fglairApi.setDeviceProp(dsn, 'operation_mode', 5);
                        break;

                    case 'dry':
                        await this._fglairApi.setDeviceProp(dsn, 'operation_mode', 4);
                        break;
                }

                break;
        }
    }

    public async setTargetTemperature(dsn: string, targetTemperature: number): Promise<void> {
        await this._fglairApi.setDeviceProp(dsn, 'adjust_temperature', Math.round(targetTemperature * 10));
    }

    public async getDeviceStatus(dsn: string): Promise<DeviceStatus> {

        const deviceProps = await this._fglairApi.getDeviceProp(dsn);

        const opMode = deviceProps.find(p => p.property.name === 'operation_mode');
        const minHeat = deviceProps.find(p => p.property.name === 'min_heat');
        const displayTemp = deviceProps.find(p => p.property.name === 'display_temperature');
        const opStatus = deviceProps.find(p => p.property.name === 'op_status');
        const deviceCapabilities = deviceProps.find(p => p.property.name === 'device_capabilities');
        const deviceName = deviceProps.find(p => p.property.name === 'device_name');
        const adjustTemp = deviceProps.find(p => p.property.name === 'adjust_temperature');
        const economyMode = deviceProps.find(p => p.property.name === 'economy_mode');
        const errorCode = deviceProps.find(p => p.property.name === 'error_code');
        const fanSpeedProp = deviceProps.find(p => p.property.name === 'fan_speed');
        const buildingName = deviceProps.find(p => p.property.name === 'building_name');
        const powerfulMode = deviceProps.find(p => p.property.name === 'powerful_mode');
        const indoorFanControl = deviceProps.find(p => p.property.name === 'indoor_fan_control');

        let opModeValue: 'auto' | 'cool' | 'heat' | 'off' = 'off';
        let extendedModes: 'dry' | 'fan' | 'none' = 'none';
        let fanSpeed: 'Quiet' | 'Low' | 'Medium' | 'High' | 'Auto' | undefined = undefined;

        // op_status - 33554432

        let currentTemperature: number | undefined = undefined;

        if (typeof displayTemp?.property.value === 'number')
            currentTemperature = (displayTemp.property.value / 100 - 32) * 5/9;

        switch(opMode?.property.value || -1) {

            case 0:
                extendedModes = 'none';
                opModeValue = 'off';
                break;

            case 2:
                extendedModes = 'none';
                opModeValue = 'auto';
                break;

            case 3:
                extendedModes = 'none';
                opModeValue = 'cool';
                break;

            case 4:
                extendedModes = 'dry';
                opModeValue = 'off';
                break;

            case 5:
                extendedModes = 'fan';
                opModeValue = 'off';
                break;

            case 6:
                extendedModes = 'none';
                opModeValue = 'heat';
                break;    
        }

        switch(fanSpeedProp?.property.value) {
            case 4:
                fanSpeed = 'Auto';
                break;

            case 3:
                fanSpeed = 'High';
                break;

            case 2:
                fanSpeed = 'Medium';
                break;

            case 1:
                fanSpeed = 'Low';
                break;

            case 0:
                fanSpeed = 'Quiet';
                break;
        }

        let temperature: number | undefined = undefined;

        if (typeof adjustTemp?.property.value === 'number')
            temperature = adjustTemp?.property.value / 10;

        var status: DeviceStatus = {
           operationMode: opModeValue,
           extendedModes: extendedModes,
           temperature: temperature,
           currentTemperature: currentTemperature,
           fanSpeed: fanSpeed,
           powerfulMode: powerfulMode?.property.value === 1,
           economyMode: economyMode?.property.value === 1,
           energySavingFan: indoorFanControl?.property.value === 1,
           minHeat: minHeat?.property.value == 1
        };

        return status;
    }

    public async getDevices(): Promise<any[]> {        
        const devices = await this._fglairApi.getDevices();

        const result = devices.map(async d => 
            {
                const properties = await this._fglairApi.getDeviceProp(d.device.dsn);

                const deviceNameProp = properties.find(p => p.property.name === 'device_name');

                const name = deviceNameProp?.property?.value || d.device.dsn;

                return {
                    name: name,
                    data: {
                        id: d.device.dsn,
                    },
                    store: {
                        address: d.device.lan_ip,
                    },
            }
        });

        return Promise.all(result);
    }

    public failOnInvalidConfig(): void {

        let error = '';

        if (!this.hasUsername()) {
            error += 'Username is not configured\n';
        }

        if (!this.hasPassword()) {
            error += 'Password is not configured\n';
        }

        if (!this.hasRegion()) {
            error += 'Region is not configured\n';
        }

        if (error && error.length > 0) {
            throw Error(`Error in configuration:\n ${error}`);
        }
    }

    public hasUsername(): boolean {
        return this.getUsername() !== undefined &&
            this.getUsername() !== null &&
            this.getUsername().length > 0;
    }

    public hasPassword(): boolean {
        return this.getPassword() !== undefined &&
            this.getPassword() !== null &&
            this.getPassword().length > 0;
    }

    public hasRegion(): boolean {
        return this.getRegion() !== undefined &&
            this.getRegion() !== null &&
            this.getRegion().length > 0;
    }

    public getUsername(): string {
        return this._settingsManager ? this._settingsManager.get('username') : undefined;
    }

    public getPassword(): string {
        return this._settingsManager ? this._settingsManager.get('password') : undefined;
    }

    public getRegion(): string {
        return 'eu';
        return (this._settingsManager ? this._settingsManager.get('region') : undefined) || 'eu';
    }

}

export default fglair;