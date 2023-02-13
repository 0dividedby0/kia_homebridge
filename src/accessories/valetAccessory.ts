import { Service, PlatformAccessory } from 'homebridge';
import { VehicleManager } from '../kia/vehicleManager';

import { HomebridgeKiaConnect } from '../platform';

export class ValetAccessory {
  private valetService: Service;

  valetOnState: boolean;

  constructor(private readonly platform: HomebridgeKiaConnect, private readonly vehicleManager: VehicleManager, private readonly accessory: PlatformAccessory) {
    this.valetOnState = false;

    this.valetService = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.valetService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getValetOn.bind(this))
      .onSet(this.setValetOn.bind(this));
  }

  //ENGINE
  getValetOn() {
    this.platform.log.info('Get valet on state: ', this.valetOnState);

    return this.valetOnState;
  }

  setValetOn(value) {
    this.platform.log.info('Set valet on state: ', value);

    this.valetOnState = value;
  }

}