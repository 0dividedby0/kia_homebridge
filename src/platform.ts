import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { LockAccessory } from './accessories/lockAccessory';
import { EngineAccessory } from './accessories/engineAccessory';
import { ClimateAccessory } from './accessories/climateAccessory';
import { VehicleManager } from './kia/vehicleManager';

export class HomebridgeKiaConnect implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  private vehicleManagers: VehicleManager[] = [];

  constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
    this.api.on('didFinishLaunching', async () => {
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
      this.vehicleManagers[vehicle.vehicleID] = new VehicleManager(this, this.config.username, this.config.password, vehicle.vehicleID);

      //Lock
      const uuidLock = this.api.hap.uuid.generate(`${vehicle.vehicleID}_lock`);
      const existingLockAccessory = this.accessories.find(accessory => accessory.UUID === uuidLock);

      if (existingLockAccessory) {
        this.log.info('Restoring existing lock accessory from cache:', existingLockAccessory.displayName);

        new LockAccessory(this, this.vehicleManagers[vehicle.vehicleID], existingLockAccessory);
      } else {
        this.log.info('Adding new lock accessory:', vehicle.vehicleName);
        const accessory = new this.api.platformAccessory(`${vehicle.vehicleName} Doors`, uuidLock);
        accessory.context.device = vehicle;

        new LockAccessory(this, this.vehicleManagers[vehicle.vehicleID], accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      //Engine
      const uuidEngine = this.api.hap.uuid.generate(`${vehicle.vehicleID}_engine`);
      const existingEngineAccessory = this.accessories.find(accessory => accessory.UUID === uuidEngine);

      if (existingEngineAccessory) {
        this.log.info('Restoring existing engine accessory from cache:', existingEngineAccessory.displayName);

        new EngineAccessory(this, this.vehicleManagers[vehicle.vehicleID], existingEngineAccessory);
      } else {
        this.log.info('Adding new engine accessory:', vehicle.vehicleName);
        const accessory = new this.api.platformAccessory(`${vehicle.vehicleName} Engine`, uuidEngine);
        accessory.context.device = vehicle;

        new EngineAccessory(this, this.vehicleManagers[vehicle.vehicleID], accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      //Climate
      const uuidClimate = this.api.hap.uuid.generate(`${vehicle.vehicleID}_climate`);
      const existingClimateAccessory = this.accessories.find(accessory => accessory.UUID === uuidClimate);

      if (existingClimateAccessory) {
        this.log.info('Restoring existing climate accessory from cache:', existingClimateAccessory.displayName);

        new ClimateAccessory(this, this.vehicleManagers[vehicle.vehicleID], existingClimateAccessory);
      } else {
        this.log.info('Adding new climate accessory:', vehicle.vehicleName);
        const accessory = new this.api.platformAccessory(`${vehicle.vehicleName} Climate`, uuidClimate);
        accessory.context.device = vehicle;

        new ClimateAccessory(this, this.vehicleManagers[vehicle.vehicleID], accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
