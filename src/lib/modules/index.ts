import { DataModule } from '../../types';
import { weatherModule } from './weather';
import { airModule } from './air';
import { uvModule } from './uv';
import { marineModule } from './marine';
import { earthquakeModule } from './earthquake';
import { fireModule } from './fire';
import { pollenModule } from './pollen';
import { pressureModule } from './pressure';
import { geomagneticModule } from './geomagnetic';
import { moonModule } from './moon';
import { daylightModule } from './daylight';

export const allModules: DataModule[] = [
  weatherModule,
  airModule,
  uvModule,
  marineModule,
  earthquakeModule,
  fireModule,
  pollenModule,
  pressureModule,
  geomagneticModule,
  moonModule,
  daylightModule,
];

export {
  weatherModule,
  airModule,
  uvModule,
  marineModule,
  earthquakeModule,
  fireModule,
  pollenModule,
  pressureModule,
  geomagneticModule,
  moonModule,
  daylightModule,
};
