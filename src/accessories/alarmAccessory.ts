import { Service, PlatformAccessory } from 'homebridge';
import { VehicleManager } from '../kia/vehicleManager';

import { HomebridgeKiaConnect } from '../platform';

export class AlarmAccessory {
  private alarmService: Service;

  alarmOnState: boolean;

  constructor(private readonly platform: HomebridgeKiaConnect, private readonly vehicleManager: VehicleManager, private readonly accessory: PlatformAccessory) {
    this.alarmOnState = false;

    this.alarmService = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.alarmService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getAlarmOn.bind(this))
      .onSet(this.setAlarmOn.bind(this));
  }

  //ENGINE
  getAlarmOn() {
    this.platform.log.info('Get alarm on state: ', this.alarmOnState);

    return this.alarmOnState;
  }

  setAlarmOn(value) {
    this.platform.log.info('Set alarm on state: ', value);

    this.alarmOnState = value;
  }

}