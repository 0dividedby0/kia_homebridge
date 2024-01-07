import { Service, PlatformAccessory } from 'homebridge';
import { VehicleManager } from '../kia/vehicleManager';

import { HomebridgeKiaConnect } from '../platform';

export class DoorsAccessory {
  private lockService: Service;
  private fuelService: Service;


  lockCurrentState: number;
  lockTargetState: number;
  fuelLevel: number;
  fuelLow: number;

  constructor(private readonly platform: HomebridgeKiaConnect, private readonly vehicleManager: VehicleManager, private readonly accessory: PlatformAccessory) {
    //LOCK
    this.lockCurrentState = this.platform.Characteristic.LockCurrentState.SECURED;
    this.lockTargetState = this.platform.Characteristic.LockCurrentState.SECURED;

    this.lockService = this.accessory.getService(this.platform.Service.LockMechanism) || this.accessory.addService(this.platform.Service.LockMechanism);

    this.lockService.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.getLockCurrentState.bind(this));

    this.lockService.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.getLockTargetState.bind(this))
      .onSet(this.setLockTargetState.bind(this));

    //FUEL LEVEL
    this.fuelLevel = 100;
    this.fuelLow = this.platform.Characteristic.FilterChangeIndication.FILTER_OK;

    this.fuelService = this.accessory.getService(this.platform.Service.Battery) || this.accessory.addService(this.platform.Service.Battery);
    this.fuelService.setCharacteristic(this.platform.Characteristic.Name, 'Fuel Level');

    this.fuelService.getCharacteristic(this.platform.Characteristic.StatusLowBattery)
      .onGet(this.handleStatusLowBatteryGet.bind(this));

    this.fuelService.getCharacteristic(this.platform.Characteristic.BatteryLevel)
      .onGet(this.handleBatteryLevelGet.bind(this));
  }

  //LOCK
  async getLockCurrentState() {
    this.lockCurrentState = await this.vehicleManager.getLockStatus() ? 1 : 0;
    this.platform.log.info('Get lock current state: ', this.lockCurrentState);
    return this.lockCurrentState;
  }

  getLockTargetState() {
    this.platform.log.info('Get lock target state: ', this.lockTargetState);
    return this.lockTargetState;
  }

  async setLockTargetState(value) {
    this.platform.log.info('Set lock target state: ', value);
    this.lockTargetState = value;

    this.lockCurrentState = await this.vehicleManager.getLockStatus() ? 1 : 0;
    this.lockService.setCharacteristic(this.platform.Characteristic.LockCurrentState, this.lockCurrentState);
    // this.lockAction();
    if (this.lockCurrentState !== this.lockTargetState) {
      this.lockTargetState = this.lockCurrentState;
      return false;
    }
    return true;
  }

  async lockAction() {
    if (this.lockTargetState) {  //Lock
      if (await this.vehicleManager.lockVehicle()) {
        this.lockService.setCharacteristic(this.platform.Characteristic.LockCurrentState, this.lockTargetState);
        this.lockCurrentState = this.lockTargetState;
      }
    } else {  //Unlock
      if (await this.vehicleManager.unlockVehicle()) {
        this.lockService.setCharacteristic(this.platform.Characteristic.LockCurrentState, this.lockTargetState);
        this.lockCurrentState = this.lockTargetState;
      }
    }
  }

  //FUEL LEVEL
  async handleStatusLowBatteryGet() {
    this.fuelLow = await this.vehicleManager.getFuelLow() ? this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW : this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
    this.platform.log.info('Get fuel level low state: ', this.fuelLow);
    return this.fuelLow;
  }

  async handleBatteryLevelGet() {
    this.fuelLevel = await this.vehicleManager.getFuelLevel();
    this.platform.log.info('Get fuel level: ', this.fuelLevel);
    return this.fuelLevel;
  }
}