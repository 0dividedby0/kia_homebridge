import { HomebridgeKiaConnect } from '../platform';
import { KiaUSAInterface } from './kiaUSAInterface';
import { Token } from './token';

export class VehicleManager {
  private kiaUSAInterface?: KiaUSAInterface;
  private token?: Token;
  private vehicles = {};
  private vehicleDetails = {};

  constructor (private readonly platform: HomebridgeKiaConnect, private readonly username: string, private readonly password: string, private readonly vehicleID: string) {
    this.kiaUSAInterface = new KiaUSAInterface(platform, username, password);
    this.init();
  }

  async init() {
    this.token = await this.kiaUSAInterface!.login();
    const vehiclesArray = await this.kiaUSAInterface!.getVehicles(this.token);
    vehiclesArray.forEach(vehicle => {
      this.vehicles[(vehicle as {vehicleIdentifier: string}).vehicleIdentifier] = vehicle;
    });
    if (this.vehicleID === '') {
      this.platform.log.info('Vehicles:', this.vehicles);
    } else {
      this.updateVehicle();
    }
  }

  checkAndRefreshToken() {
    if (this.token === undefined || this.token.valid_until === undefined || this.token.valid_until < new Date().getTime()) {
      this.init();
    }
  }

  async updateVehicle() {
    this.checkAndRefreshToken();
    this.vehicleDetails[this.vehicleID] = await this.kiaUSAInterface!.getVehicleDetails(this.token!, this.vehicles[this.vehicleID].vehicleKey);
    this.platform.log.info('Vehicle Details:', JSON.stringify(this.vehicleDetails[this.vehicleID]));
    return this.vehicleDetails[this.vehicleID];
  }

  async lockVehicle() {
    this.checkAndRefreshToken();
    const response = await this.kiaUSAInterface!.lockVehicle(this.token!, this.vehicles[this.vehicleID].vehicleKey);
    this.platform.log.info('Vehicle Lock Response: ', response);
    return true;
  }

  async unlockVehicle() {
    this.checkAndRefreshToken();
    const response = await this.kiaUSAInterface!.unlockVehicle(this.token!, this.vehicles[this.vehicleID].vehicleKey);
    this.platform.log.info('Vehicle Unlock Response: ', response);
    return true;
  }
}