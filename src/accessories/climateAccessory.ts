import { Service, PlatformAccessory } from 'homebridge';
import { VehicleManager } from '../kia/vehicleManager';

import { HomebridgeKiaConnect } from '../platform';

export class ClimateAccessory {
  private thermostatService: Service;

  climateCurrentState: number;
  climateTargetState: number;
  currentTemperature: number;
  targetTemperature: number;
  temperatureUnits: number;

  driverHeatOnState: boolean;
  passengerHeatOnState: boolean;

  constructor(private readonly platform: HomebridgeKiaConnect, private readonly vehicleManager: VehicleManager, private readonly accessory: PlatformAccessory) {
    this.climateCurrentState = this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
    this.climateTargetState = this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
    this.currentTemperature = -270;
    this.targetTemperature = 10;
    this.temperatureUnits = this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;

    this.driverHeatOnState = false;
    this.passengerHeatOnState = false;

    this.thermostatService = this.accessory.getService(this.platform.Service.Thermostat) || this.accessory.addService(this.platform.Service.Thermostat);

    this.thermostatService.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.getCurrentHeatingCoolingState.bind(this));

    this.thermostatService.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onGet(this.getTargetHeatingCoolingState.bind(this))
      .onSet(this.setTargetHeatingCoolingState.bind(this));

    this.thermostatService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));

    this.thermostatService.getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .onGet(this.getTargetTemperature.bind(this))
      .onSet(this.setTargetTemperature.bind(this));

    this.thermostatService.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(this.getTemperatureDisplayUnits.bind(this))
      .onSet(this.setTemperatureDisplayUnits.bind(this));

    setInterval(() => {
      // this.platform.log.info('Apply climate targets!');
      this.climateCurrentState = this.climateTargetState === 3 ? this.targetTemperature < 65 ? 1 : 2 : this.climateTargetState;
      this.thermostatService.setCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState, this.climateCurrentState);
      this.currentTemperature = this.targetTemperature;
      this.thermostatService.setCharacteristic(this.platform.Characteristic.CurrentTemperature, this.targetTemperature);
    }, 5000);
  }

  //CLIMATE
  getCurrentHeatingCoolingState() {
    this.platform.log.info('Get climate current state: ', this.climateCurrentState);

    return this.climateCurrentState;
  }

  getTargetHeatingCoolingState() {
    this.platform.log.info('Get climate target state: ', this.climateTargetState);

    return this.climateTargetState;
  }

  setTargetHeatingCoolingState(value) {
    this.platform.log.info('Set climate target state: ', value);

    this.climateTargetState = value;
  }

  getCurrentTemperature() {
    this.platform.log.info('Get current temperature: ', this.currentTemperature);

    return this.currentTemperature;
  }

  getTargetTemperature() {
    this.platform.log.info('Get target temperature: ', this.targetTemperature);

    return this.targetTemperature;
  }

  setTargetTemperature(value) {
    this.platform.log.info('Set target temperature: ', value);

    this.targetTemperature = value;
  }

  getTemperatureDisplayUnits() {
    this.platform.log.info('Get temperature units: ', this.temperatureUnits);

    return this.temperatureUnits;
  }

  setTemperatureDisplayUnits(value) {
    this.platform.log.info('Set temperature units: ', value);

    this.thermostatService.setCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits, value);
    this.temperatureUnits = value;
  }
}