import FglairApi from './lib/fglairAPI';

const testIt = async () => {

    try {
    
        const args = process.argv.slice(2);

        const fglairApi = new FglairApi();

        fglairApi.setRegion('eu');    
        fglairApi.setCredentials(args[0], args[1]);

        const token = await fglairApi.getAuth();
        console.log('token');
        console.log(token);

        const devices = await fglairApi.getDevices();

        console.log(devices);            

        if (!devices)
            return;

        devices.forEach( d => { 
            fglairApi.getDeviceProp(d.device.dsn).then(data => {

                if (!data)
                    return;

                const deviceNameProp = data.find(x => x.property.name === 'device_name');                       
                const deviceName = deviceNameProp?.property?.value || 'Unknown';

                if (deviceName !== 'Nede')
                    return;
                
                fglairApi.setDeviceProp(d.device.dsn, 'outdoor_low_noise', '1');
                                
                /*
                    Operation Mode 2 = Auto?
                    Operation Mode 3 = Cool?
                    Operation Mode 6 = Heat?
                */
        
                data.forEach(p => {
                    console.log(`${deviceName} ${p.property.name} - ${p.property.value}`);
                })
                //console.log(data);        
            });
        
        }
    );

    } catch (error) {
        console.log('error: ');
        console.log(error);
    
    }

}

testIt();