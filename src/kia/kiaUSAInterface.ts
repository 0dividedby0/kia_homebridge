import { Token } from './token';
import { randomBytes } from 'crypto';
import axios from 'axios';
import { HomebridgeKiaConnect } from '../platform';

export class KiaUSAInterface {
  private baseURL = 'api.owners.kia.com';
  private apiURL = `https://${this.baseURL}/apigw/v1`;
  private data = {};
  private device_id = '';

  constructor(private readonly platform: HomebridgeKiaConnect, private readonly username: string, private readonly password: string) {
    this.data = {
      deviceKey: '',
      deviceType: 2,
      userCredential: {userId: username, password: password},
    };
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 22; i > 0; --i) {
      this.device_id += chars[Math.floor(Math.random() * chars.length)];
    }
    this.device_id = `${this.device_id}:${randomBytes(105).toString('hex')}`;
  }

  apiHeaders() {
    const offset = new Date().getTimezoneOffset()/60;
    const headers = {
      'content-type': 'application/json;charset=UTF-8',
      'accept': 'application/json, text/plain, */*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'apptype': 'L',
      'appversion': '4.10.0',
      'clientid': 'MWAMOBILE',
      'from': 'SPA',
      'host': this.baseURL,
      'language': '0',
      'offset': offset.toString(),
      'ostype': 'Android',
      'osversion': '11',
      'secretkey': '98er-w34rf-ibf3-3f6h',
      'to': 'APIGW',
      'tokentype': 'G',
      'user-agent': 'okhttp/3.12.1',
      'date': new Date().toUTCString(),
      'deviceid': this.device_id,
    };
    return headers;
  }

  async login(): Promise<Token> {
    const token = new Token();
    token.username = this.username;
    token.password = this.password;

    const loginURL = `${this.apiURL}/prof/authUser`;
    const headers = this.apiHeaders();

    const response = await axios.post(loginURL, this.data, {headers: headers});
    token.access_token = response.headers.sid;
    this.platform.log.info(`Session ID: ${token.access_token}`);
    token.valid_until = Date.now() + (1000*60*60);

    return token;
  }

  async getVehicles(token: Token): Promise<Array<unknown>> {
    const vehiclesURL = `${this.apiURL}/ownr/gvl`;
    const headers = this.apiHeaders();
    headers['sid'] = token.access_token;
    const response = await axios.get(vehiclesURL, {headers: headers});
    return response.data.payload.vehicleSummary;
  }

  async forceSyncVehicle(token: Token, vehicleKey: string): Promise<object> {
    const forceSyncURL = `${this.apiURL}/rems/rvs`;
    const headers = this.apiHeaders();
    headers['sid'] = token.access_token;
    headers['vinkey'] = vehicleKey;

    const body = {
      'requestType': 0,
    };

    const response = await axios.post(forceSyncURL, body, {headers: headers});

    return response.data;
  }

  async getVehicleDetails(token: Token, vehicleKey: string): Promise<object> {
    const vehicleDetailsURL = `${this.apiURL}/cmm/gvi`;
    const headers = this.apiHeaders();
    headers['sid'] = token.access_token;
    headers['vinkey'] = vehicleKey;

    const body = {
      'vehicleConfigReq': {
        'airTempRange': '0',
        'maintenance': '0',
        'seatHeatCoolOption': '0',
        'vehicle': '0',
        'vehicleFeature': '0',
      },
      'vehicleInfoReq': {
        'drivingActivty': '0',
        'dtc': '0',
        'enrollment': '0',
        'functionalCards': '0',
        'location': '0',
        'vehicleStatus': '1',
        'weather': '0',
      },
      'vinKey': [vehicleKey],
    };

    const response = await axios.post(vehicleDetailsURL, body, {headers: headers});

    return response.data;
  }

  async lockVehicle(token: Token, vehicleKey: string): Promise<object> {
    const lockVehicleURL = `${this.apiURL}/rems/door/lock`;
    const headers = this.apiHeaders();
    headers['sid'] = token.access_token;
    headers['vinkey'] = vehicleKey;

    const response = await axios.get(lockVehicleURL, {headers: headers});

    return response;
  }

  async unlockVehicle(token: Token, vehicleKey: string): Promise<object> {
    const unlockVehicleURL = `${this.apiURL}/rems/door/unlock`;
    const headers = this.apiHeaders();
    headers['sid'] = token.access_token;
    headers['vinkey'] = vehicleKey;

    const response = await axios.get(unlockVehicleURL, {headers: headers});

    return response;
  }
}