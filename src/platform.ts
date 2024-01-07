import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { VehicleManager } from './kia/vehicleManager';
import { DoorsAccessory } from './accessories/doorsAccessory';
// import { EngineAccessory } from './accessories/engineAccessory';
// import { ClimateAccessory } from './accessories/climateAccessory';
// import { ValetAccessory } from './accessories/valetAccessory';
// import { AlarmAccessory } from './accessories/alarmAccessory';

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
    this.log.debug('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {
    this.log.debug('CONFIG: ', this.config.vehicles);

    for (const vehicle of this.config.vehicles) {
      this.vehicleManagers[vehicle.vehicleID] = new VehicleManager(this, this.config.username, this.config.password, vehicle.vehicleID);

      //Doors
      const uuidDoors = this.api.hap.uuid.generate(`${vehicle.vehicleID}_doors`);
      const existingDoorsAccessory = this.accessories.find(accessory => accessory.UUID === uuidDoors);

      if (existingDoorsAccessory) {
        this.log.debug('Restoring existing doors accessory from cache:', existingDoorsAccessory.displayName);

        new DoorsAccessory(this, this.vehicleManagers[vehicle.vehicleID], existingDoorsAccessory);
      } else {
        this.log.debug('Adding new doors accessory:', vehicle.vehicleName);
        const accessory = new this.api.platformAccessory(`${vehicle.vehicleName}`, uuidDoors);
        accessory.context.device = vehicle;

        new DoorsAccessory(this, this.vehicleManagers[vehicle.vehicleID], accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      // //Engine
      // const uuidEngine = this.api.hap.uuid.generate(`${vehicle.vehicleID}_engine`);
      // const existingEngineAccessory = this.accessories.find(accessory => accessory.UUID === uuidEngine);

      // if (existingEngineAccessory) {
      //   this.log.debug('Restoring existing engine accessory from cache:', existingEngineAccessory.displayName);

      //   new EngineAccessory(this, this.vehicleManagers[vehicle.vehicleID], existingEngineAccessory);
      // } else {
      //   this.log.debug('Adding new engine accessory:', vehicle.vehicleName);
      //   const accessory = new this.api.platformAccessory(`${vehicle.vehicleName} Engine`, uuidEngine);
      //   accessory.context.device = vehicle;

      //   new EngineAccessory(this, this.vehicleManagers[vehicle.vehicleID], accessory);

      //   this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      // }

      // //Climate
      // const uuidClimate = this.api.hap.uuid.generate(`${vehicle.vehicleID}_climate`);
      // const existingClimateAccessory = this.accessories.find(accessory => accessory.UUID === uuidClimate);

      // if (existingClimateAccessory) {
      //   this.log.debug('Restoring existing climate accessory from cache:', existingClimateAccessory.displayName);

      //   new ClimateAccessory(this, this.vehicleManagers[vehicle.vehicleID], existingClimateAccessory);
      // } else {
      //   this.log.debug('Adding new climate accessory:', vehicle.vehicleName);
      //   const accessory = new this.api.platformAccessory(`${vehicle.vehicleName} Climate`, uuidClimate);
      //   accessory.context.device = vehicle;

      //   new ClimateAccessory(this, this.vehicleManagers[vehicle.vehicleID], accessory);

      //   this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      // }

      // //Valet
      // const uuidValet = this.api.hap.uuid.generate(`${vehicle.vehicleID}_valet`);
      // const existingValetAccessory = this.accessories.find(accessory => accessory.UUID === uuidValet);

      // if (existingValetAccessory) {
      //   this.log.debug('Restoring existing valet accessory from cache:', existingValetAccessory.displayName);

      //   new ValetAccessory(this, this.vehicleManagers[vehicle.vehicleID], existingValetAccessory);
      // } else {
      //   this.log.debug('Adding new valet accessory:', vehicle.vehicleName);
      //   const accessory = new this.api.platformAccessory(`${vehicle.vehicleName} Valet`, uuidValet);
      //   accessory.context.device = vehicle;

      //   new ValetAccessory(this, this.vehicleManagers[vehicle.vehicleID], accessory);

      //   this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      // }

      // //Alarm
      // const uuidAlarm = this.api.hap.uuid.generate(`${vehicle.vehicleID}_alarm`);
      // const existingAlarmAccessory = this.accessories.find(accessory => accessory.UUID === uuidAlarm);

      // if (existingAlarmAccessory) {
      //   this.log.debug('Restoring existing alarm accessory from cache:', existingAlarmAccessory.displayName);

      //   new AlarmAccessory(this, this.vehicleManagers[vehicle.vehicleID], existingAlarmAccessory);
      // } else {
      //   this.log.debug('Adding new alarm accessory:', vehicle.vehicleName);
      //   const accessory = new this.api.platformAccessory(`${vehicle.vehicleName} Alarm`, uuidAlarm);
      //   accessory.context.device = vehicle;

      //   new AlarmAccessory(this, this.vehicleManagers[vehicle.vehicleID], accessory);

      //   this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      // }
    }
  }
}
