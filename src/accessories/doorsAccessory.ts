import { Service, PlatformAccessory } from 'homebridge';
import { VehicleManager } from '../kia/vehicleManager';

import { HomebridgeKiaConnect } from '../platform';

export class DoorsAccessory {
  private lockService: Service;

  lockCurrentState: number;
  lockTargetState: number;

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

  }

  //LOCK
  getLockCurrentState() {
    this.platform.log.info('Get lock current state: ', this.lockCurrentState);
    return this.lockCurrentState;
  }

  getLockTargetState() {
    this.platform.log.info('Get lock target state: ', this.lockTargetState);

    return this.lockTargetState;
  }

  setLockTargetState(value) {
    this.platform.log.info('Set lock target state: ', value);

    this.lockTargetState = value;
    this.lockAction();
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
}