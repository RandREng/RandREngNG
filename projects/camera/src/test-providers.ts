import { provideZoneChangeDetection } from '@angular/core';
import 'zone.js';
import 'zone.js/testing';

export default [
  provideZoneChangeDetection()
];
