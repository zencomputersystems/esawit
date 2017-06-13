import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';
 
declare var Connection;
 
@Injectable()
export class ConnectivityService {
 
  onDevice: boolean;
 
  constructor(public platform: Platform)
  {
    this.onDevice = this.platform.is('cordova');
  }

  isOffline() 
  {
        return navigator.onLine;
  }
}