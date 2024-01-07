import { HomebridgeKiaConnect } from '../platform';
import { KiaUSAInterface } from './kiaUSAInterface';
import { Token } from './token';

export class VehicleManager {
  private kiaUSAInterface?: KiaUSAInterface;
  private token?: Token;
  private vehicles = {};
  private vehicleDetails = {};
  private forcing = false;

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

  async checkAndForceUpdate() {
    let lastUpdated = 0;
    if (this.vehicleDetails[this.vehicleID]) {
      const dateString = this.vehicleDetails[this.vehicleID].payload.vehicleInfoList[0].lastVehicleInfo.vehicleStatusRpt.vehicleStatus.syncDate.utc;
      const formattedDateString = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}T${dateString.slice(8, 10)}:${dateString.slice(10, 12)}:${dateString.slice(12, 14)}`;
      lastUpdated = new Date(formattedDateString).getTime();
      this.platform.log.info('Checking time: ', lastUpdated + 60000, new Date().getTime());
    }
    if (lastUpdated + 60000 < new Date().getTime()) {
      this.platform.log.info('Forcing Vehicle Update!');
      const response = await this.kiaUSAInterface!.forceSyncVehicle(this.token!, this.vehicles[this.vehicleID].vehicleKey);
      this.platform.log.debug('Vehicle Force Update Response: ', response);
      this.forcing = false;
      return true;
    } else {
      this.forcing = false;
      this.platform.log.info('Using cache');
      return true;
    }
  }

  async updateVehicle() {
    if (await this.checkAndForceUpdate()) {
      this.checkAndRefreshToken();
      this.vehicleDetails[this.vehicleID] = await this.kiaUSAInterface!.getVehicleDetails(this.token!, this.vehicles[this.vehicleID].vehicleKey) as {payload: {vehicleInfoList: Array<object>}};
      this.platform.log.debug('Vehicle Details Response:', JSON.stringify(this.vehicleDetails[this.vehicleID]));
      return this.vehicleDetails[this.vehicleID].payload.vehicleInfoList[0];
    }
  }

  async lockVehicle() {
    this.checkAndRefreshToken();
    const response = await this.kiaUSAInterface!.lockVehicle(this.token!, this.vehicles[this.vehicleID].vehicleKey);
    this.platform.log.debug('Vehicle Lock Response: ', response);
    return true;
  }

  async unlockVehicle() {
    this.checkAndRefreshToken();
    const response = await this.kiaUSAInterface!.unlockVehicle(this.token!, this.vehicles[this.vehicleID].vehicleKey);
    this.platform.log.debug('Vehicle Unlock Response: ', response);
    return true;
  }

  async getLockStatus() {
    const vehicleDetails = await this.updateVehicle() as any;
    return vehicleDetails.lastVehicleInfo.vehicleStatusRpt.vehicleStatus.doorLock as boolean;
  }

  async getFuelLevel() {
    const vehicleDetails = await this.updateVehicle() as any;
    return vehicleDetails.lastVehicleInfo.vehicleStatusRpt.vehicleStatus.fuelLevel as number;
  }

  async getFuelLow() {
    const vehicleDetails = await this.updateVehicle() as any;
    return vehicleDetails.lastVehicleInfo.vehicleStatusRpt.vehicleStatus.lowFuelLight as boolean;
  }
}