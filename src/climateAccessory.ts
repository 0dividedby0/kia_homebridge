import { Service, PlatformAccessory } from 'homebridge';

import { HomebridgeKiaConnect } from './platform';

export class ClimateAccessory {
  private thermostatService: Service;
  private driverHeatService: Service;
  private passengerHeatService: Service;

  climateCurrentState: number;
  climateTargetState: number;
  currentTemperature: number;
  targetTemperature: number;
  temperatureUnits: number;

  driverHeatOnState: boolean;
  passengerHeatOnState: boolean;

  constructor(private readonly platform: HomebridgeKiaConnect, private readonly accessory: PlatformAccessory) {
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

    this.driverHeatService = this.accessory.getService('Driver Seat') || this.accessory.addService(this.platform.Service.Switch, 'Driver Seat', 'driver_seat_heat_switch');

    this.driverHeatService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getDriverHeatOn.bind(this))
      .onSet(this.setDriverHeatOn.bind(this));

    this.passengerHeatService = this.accessory.getService('Passenger Seat') || this.accessory.addService(this.platform.Service.Switch, 'Passenger Seat', 'passenger_seat_heat_switch');

    this.passengerHeatService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getPassengerHeatOn.bind(this))
      .onSet(this.setPassengerHeatOn.bind(this));

    setInterval(() => {
      this.platform.log.info('Apply climate targets!');
      this.thermostatService.setCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState, this.climateTargetState);
      this.climateCurrentState = this.climateTargetState;
      this.thermostatService.setCharacteristic(this.platform.Characteristic.CurrentTemperature, this.targetTemperature);
      this.currentTemperature = this.targetTemperature;
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

  getDriverHeatOn() {
    this.platform.log.info('Get driver heat on state: ', this.driverHeatOnState);

    return this.driverHeatOnState;
  }

  setDriverHeatOn(value) {
    this.platform.log.info('Set driver heat on state: ', value);

    this.driverHeatOnState = value;
  }

  getPassengerHeatOn() {
    this.platform.log.info('Get passenger heat on state: ', this.passengerHeatOnState);

    return this.passengerHeatOnState;
  }

  setPassengerHeatOn(value) {
    this.platform.log.info('Set passenger heat on state: ', value);

    this.passengerHeatOnState = value;
  }
}