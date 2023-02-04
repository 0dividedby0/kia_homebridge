import { Service, PlatformAccessory } from 'homebridge';
import { VehicleManager } from '../kia/vehicleManager';

import { HomebridgeKiaConnect } from '../platform';

export class EngineAccessory {
  private engineService: Service;

  engineOnState: boolean;

  constructor(private readonly platform: HomebridgeKiaConnect, private readonly vehicleManager: VehicleManager, private readonly accessory: PlatformAccessory) {
    this.engineOnState = false;

    this.engineService = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.engineService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getEngineOn.bind(this))
      .onSet(this.setEngineOn.bind(this));
  }

  //ENGINE
  getEngineOn() {
    this.platform.log.info('Get engine on state: ', this.engineOnState);

    return this.engineOnState;
  }

  setEngineOn(value) {
    this.platform.log.info('Set engine on state: ', value);

    this.engineOnState = value;
  }

}