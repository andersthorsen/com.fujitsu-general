// FGLair API, (c) 2020 Ryan Beggs, MIT License (see below)

// Reworked by Anders Thorsen for async Typescript using fetch. Improved re-authorization if token fails

// Portions of this software adapted from the pyfujitsu project
// Copyright (c) 2018 Mmodarre https://github.com/Mmodarre/pyfujitsu


/*
MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { DeviceInfo, PropertyInfo } from './types';

class FglairApi {
  
  DISABLE_SET = false; // True to disable updating hardware (for debugging)

  log = {
    debug: console.log,
    error: console.error
  };

  q = [];

  options_auth = {
    hostname: "user-field.aylanetworks.com",
    port: 443,
    path: "/users/sign_in.json",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  options = {
    hostname: "ads-field.aylanetworks.com",
    port: 443,
    path: "/apiv1/",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  appID = {
    app_id: "CJIOSP-id",
    app_secret: "CJIOSP-Vb8MQL_lFiYQ7DKjN0eCFXznKZE"
  }

  private set_region(region: string) {
    if (region == 'eu') {
      this.options_auth['hostname'] = "user-field-eu.aylanetworks.com";
      this.options['hostname'] = "ads-field-eu.aylanetworks.com";
      this.appID['app_id'] = "FGLair-eu-id";
      this.appID['app_secret'] = "FGLair-eu-gpFbVBRoiJ8E3QWJ-QRULLL3j3U"
    }
    else if (region == 'cn') {
      this.options_auth['hostname'] = "user-field.ayla.com.cn";
      this.options['hostname'] = "ads-field.ayla.com.cn";
      this.appID['app_id'] = "FGLairField-cn-id";
      this.appID['app_secret'] = "FGLairField-cn-zezg7Y60YpAvy3HPwxvWLnd4Oh4"
    }
    else {
      //use the defaults
    }
  }
  
  access_token = '';
  username = '';
  user_pwd = '';

  private getBaseRequestUrl() : string {
    let port = "";
    if (this.options.port !== 443)
      port = `:${this.options.port}`;

    const baseUrl = `https://${this.options.hostname}${port}${this.options.path}`;

    return baseUrl
  }

  public async getDevices(): Promise<DeviceInfo[]> {
    
    const baseUrl = this.getBaseRequestUrl();

    const url = `${baseUrl}}devices.json`;

    const response = await this.fetchAuthenticated(url, { method: 'GET', headers: this.options.headers });

    if (response.status >= 200 && response.status <= 299) {
      const data = await response.json();

      return data as DeviceInfo[];
    }

    throw Error(`Request failed with ${response.status} ${response.statusText} - ${response.text()}`);
  }

  public async getDeviceProp (dsn: string): Promise<PropertyInfo[]> {

    const baseUrl = this.getBaseRequestUrl();
    const url = `${baseUrl}dsns/${dsn}/properties.json`;

    const response = await this.fetchAuthenticated(url, { method: 'GET', headers: this.options.headers});

    if (response.status >= 200 && response.status <= 299) {
      const data = await response.json();

      return data as PropertyInfo[];
    }

    const text = await response.text();

    throw Error(`Request failed with ${response.status} ${response.statusText} - ${text}`);
  }

  public async setDeviceProp (dsn: string, property_name: string, val: any): Promise<void> {
    if (this.DISABLE_SET) {
      return;
    }

    const baseUrl = this.getBaseRequestUrl();
    const url = `${baseUrl}dsns/${dsn}/properties/${property_name}/datapoints.json`;

    const body = {
      datapoint: { value: val }
    };

    const response = await this.fetchAuthenticated(url, { method: 'POST', body: JSON.stringify(body), headers: this.options.headers } );

    const text = await response.text();

    if (response.status >= 200 && response.status <= 299) {
      //console.log(`${response.status} ${response.statusText} ${text}`)
      return;
    }

    throw Error(`Request failed with ${response.status} ${response.statusText} - ${text}`);
  }

  public async getAuth (): Promise<string>  {
    if (!this.access_token) {

      var body = { user: { email: this.username, application: { app_id: this.appID.app_id, app_secret: this.appID.app_secret }, password: this.user_pwd } };

      let port = "";
      if (this.options_auth.port !== 443)
        port = `:${this.options_auth.port}`;

      const url = `https://${this.options_auth.hostname}${port}${this.options_auth.path}`;

      const response = await fetch(url, { method: 'POST', headers: this.options_auth.headers, body: JSON.stringify(body) } );
      const data = (await response.json()) as Record<string, string>;

      if (response.status >= 200 && response.status <= 299) {
        this.access_token = data['access_token'];

        return this.access_token;
      } else {
        throw Error(`Authentication failed with status ${response.status} ${response.statusText} ${JSON.stringify(data)}`);
      }

    }
    else {
      this.log.debug("API Using Access Token: " + this.access_token);
      return this.access_token;
    }
  }

  public async fetchAuthenticated (url: RequestInfo, init: RequestInit): Promise<Response> {

    let token = await this.getAuth();
    
    const response = await fetch(url, {...init, headers: { ...init.headers, 'Authorization': 'auth_token ' + token} });

    if (response.status >= 400 && response.status <= 499) {
      this.setToken('');

      let token = await this.getAuth();

      return await fetch(url, {...init, headers: { ...init.headers, 'Authorization': 'auth_token ' + token} });
    }

    return response;    
  }

  public setLog (logfile: any): void {
    this.log = logfile;
  }

  public setToken (token: string): void {
    this.access_token = token;
  }

  public setRegion (region: string): void {
    this.set_region(region);
  }

  public setCredentials (username: string, password: string): void {
    this.username = username;
    this.user_pwd = password;
  }
}

export default FglairApi;