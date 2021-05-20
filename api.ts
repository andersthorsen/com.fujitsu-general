//import * as Homey from 'homey';

import FglairApi from "./lib/fglairAPI";

const testCredentials = async ( { homey, params, query, body }) => {

    //console.log(homey);
    //console.log(params);
    //console.log(query);
    
    console.log(body);

    const username = body.username || "";
    const password = body.password || "";
    const region = body.region || "eu";

    const fglairApi = new FglairApi();

    fglairApi.setRegion(region);
    fglairApi.setCredentials(username, password);

    try {        
        const token = await fglairApi.getAuth();

        return "Success";
    }
    catch (error) {
        console.log(error);
        return error.message || 'Failed';
    }
};

export default { testCredentials };