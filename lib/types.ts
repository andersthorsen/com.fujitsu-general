export interface Device {
    product_name: string,
    model: string,
    dsn: string,
    oem_model: string,
    sw_version: string,
    template_id: number,
    mac: string,
    unique_hardware_id?: string,
    hwsid: string,
    lan_ip: string,
    connected_at: string,
    key: number,
    lan_enabled: boolean,
    product_class: string,
    connection_status: string,
    lat: string,
    lng: string,
    locality: any,
    device_type: string,
    dealer: any
}
  
export interface DeviceInfo {
    device: Device
}
  
export interface Property {
    type: string,
    name: string,
    base_type: string,
    read_only: boolean,
    direction: 'input' | 'output',
    scope: 'user',
    data_updated_at: Date,
    key: number,
    device_key: number,
    product_name: string,
    track_only_changes: boolean,
    display_name: string,
    host_sw_sensor: boolean,
    time_series: boolean,
    derived: boolean,
    app_type: any,
    recipe: any,
    value: number | string,
    denied_roles: any[],
    ack_enabled: boolean,
    retention_days: number
}
  
export interface PropertyInfo {
    property: Property;
}

export interface DeviceStatus {
    operationMode: 'auto' | 'cool' | 'heat' | 'off',
    extendedModes: 'minimum' | 'dry' | 'fan' | 'none',
    temperature: number | undefined,
    currentTemperature: number | undefined,
    fanSpeed: 'Quiet' | 'Low' | 'Medium' | 'High' | 'Auto' | undefined,
    powerfulMode: boolean,
    economyMode: boolean,
    energySavingFan: boolean,
    minHeat: boolean
}