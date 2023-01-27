import { Service, PlatformAccessory } from 'homebridge';

import { HomebridgeKiaConnect } from './platform';

export class KiaLockAccessory {
  private service: Service;

  constructor(private readonly platform: HomebridgeKiaConnect, private readonly accessory: PlatformAccessory) {
    // create a new Lock Mechanism service
    this.service = this.accessory.getService(this.platform.Service.LockMechanism) || this.accessory.addService(this.platform.Service.LockMechanism);

    // create handlers for required characteristics
    this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.handleLockCurrentStateGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.handleLockTargetStateGet.bind(this))
      .onSet(this.handleLockTargetStateSet.bind(this));

  }

  /**
   * Handle requests to get the current value of the "Lock Current State" characteristic
   */
  handleLockCurrentStateGet() {
    this.platform.log.debug('Triggered GET LockCurrentState');

    // set this to a valid value for LockCurrentState
    const currentValue = this.platform.Characteristic.LockCurrentState.UNSECURED;

    return currentValue;
  }


  /**
   * Handle requests to get the current value of the "Lock Target State" characteristic
   */
  handleLockTargetStateGet() {
    this.platform.log.debug('Triggered GET LockTargetState');

    // set this to a valid value for LockTargetState
    const currentValue = this.platform.Characteristic.LockTargetState.UNSECURED;

    return currentValue;
  }

  /**
   * Handle requests to set the "Lock Target State" characteristic
   */
  handleLockTargetStateSet(value) {
    this.platform.log.debug('Triggered SET LockTargetState:', value);

    if (value == 1) {
      this.service.setCharacteristic(
        this.platform.Characteristic.LockCurrentState,
        this.platform.Characteristic.LockCurrentState.SECURED,
      );
    } else {
      this.service.setCharacteristic(
        this.platform.Characteristic.LockCurrentState,
        this.platform.Characteristic.LockCurrentState.UNSECURED,
      );
    }
  }

}