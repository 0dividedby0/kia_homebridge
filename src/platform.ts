import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { LockAccessory } from './lockAccessory';
import { EngineAccessory } from './engineAccessory';
import { ClimateAccessory } from './cliimateAccessory';

export class HomebridgeKiaConnect implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
    this.api.on('didFinishLaunching', () => {
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {
    this.log.debug('CONFIG: ', this.config.vehicles);

    for (const vehicle of this.config.vehicles) {
      //Lock
      const uuidLock = this.api.hap.uuid.generate(`${vehicle.vehicleID}_lock`);
      const existingLockAccessory = this.accessories.find(accessory => accessory.UUID === uuidLock);

      if (existingLockAccessory) {
        this.log.info('Restoring existing lock accessory from cache:', existingLockAccessory.displayName);

        new LockAccessory(this, existingLockAccessory);
      } else {
        this.log.info('Adding new lock accessory:', vehicle.vehicleName);
        const accessory = new this.api.platformAccessory(vehicle.vehicleName, uuidLock);
        accessory.context.device = vehicle;

        new LockAccessory(this, accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      //Engine
      const uuidEngine = this.api.hap.uuid.generate(`${vehicle.vehicleID}_engine`);
      const existingEngineAccessory = this.accessories.find(accessory => accessory.UUID === uuidEngine);

      if (existingEngineAccessory) {
        this.log.info('Restoring existing engine accessory from cache:', existingEngineAccessory.displayName);

        new EngineAccessory(this, existingEngineAccessory);
      } else {
        this.log.info('Adding new engine accessory:', vehicle.vehicleName);
        const accessory = new this.api.platformAccessory(vehicle.vehicleName, uuidEngine);
        accessory.context.device = vehicle;

        new EngineAccessory(this, accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      //Climate
      const uuidClimate = this.api.hap.uuid.generate(`${vehicle.vehicleID}_climate`);
      const existingClimateAccessory = this.accessories.find(accessory => accessory.UUID === uuidClimate);

      if (existingClimateAccessory) {
        this.log.info('Restoring existing climate accessory from cache:', existingClimateAccessory.displayName);

        new ClimateAccessory(this, existingClimateAccessory);
      } else {
        this.log.info('Adding new climate accessory:', vehicle.vehicleName);
        const accessory = new this.api.platformAccessory(vehicle.vehicleName, uuidClimate);
        accessory.context.device = vehicle;

        new ClimateAccessory(this, accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
