import { MasterImeiModel } from '../models/UserImeiModel';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as constants from '../config/constants';
import { SharedFunctions } from "../providers/Shared/Functions";
import { Http, } from '@angular/http';
import { StorageService } from '../providers/Db/StorageFunctions';
import { FactoryHomePage } from '../pages/Factory/FactoryHome/FactoryHome';
import { MandorHomePage } from '../pages/Mandor/MandorHome/MandorHome';
import { SurveyorHomePage } from '../pages/Surveyor/SurveyorHome/SurveyorHome';
import { Device } from '@ionic-native/device';
import { UnAuthorizedUserPage } from '../pages/Shared/UnAuthorizedUser/UnAuthorizedUser'
// Translation Service:
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network';

@Component({
  templateUrl: 'app.html',
  providers: [SharedFunctions, StorageService, Device]
})
export class MyApp {
  rootPage: any;
  UIDFromMobile: string;
  locationListFromDb: any;
  module: number;
  userImei: MasterImeiModel = new MasterImeiModel();
  constructor(public global: SharedFunctions, private network: Network, private device: Device, private myCloud: StorageService, public http: Http, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, translate: TranslateService) {
    translate.setDefaultLang('en');
    platform.ready().then(() => {
      //-----------------------------------------Web Design Purpose------------------------------------
      this.UIDFromMobile =
        // "343434";
        // "f47b4e39376dbe34"; 
        this.device.uuid;
      //-----------------------------------------End Web Design Purpose------------------------------------
      // alert(this.network.type)
      localStorage.setItem('device_UUID', this.UIDFromMobile);
      if (this.network.type == "none") {
        //--------------------------------------------------Device in Offline--------------------------------------------
        // alert('you are in offline');
        var tempModule = localStorage.getItem('selected_module');
        var userGUID = localStorage.getItem('loggedIn_user_GUID');
        var isActive = localStorage.getItem('isActive');

        if (tempModule != null && userGUID != null && isActive != null) {
          if (parseInt(isActive) != 1)
            this.module = 0;
          else
            this.module = parseInt(tempModule);
        }
        switch (this.module) {
          case 1: this.rootPage = SurveyorHomePage; break;
          case 2: this.rootPage = MandorHomePage; break;
          case 3: this.rootPage = FactoryHomePage; break;
          default: this.rootPage = UnAuthorizedUserPage;
        }
        //--------------------------------------------------Device in Offline--------------------------------------------
      }
      else {
        //--------------------------------------------------Device in Online--------------------------------------------
        // alert('you are in online');
        var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=user_IMEI=" + this.UIDFromMobile + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
          var loggedInUserFromDB = data["resource"][0];
          if (loggedInUserFromDB == null) {
            //----------------------First Time App is installed----------------------
            this.userImei.user_IMEI = this.UIDFromMobile;
            this.userImei.active = 2;
            // this.userImei.user_GUID = this.userImei.updated_ts = this.userImei.created_ts = this.global.getStringTimeStamp();
            this.myCloud.saveToCloud(constants.DREAMFACTORY_TABLE_URL + '/master_imei', this.userImei.toJson(true));
            this.module = 0;
            //----------------------First Time App is installed---------------------
          }
          else if (loggedInUserFromDB.active == 2 || loggedInUserFromDB.active == 0) {
            //----------------------User is not activated yet------------------------
            this.module = 0;
          }
          else {
            //-------------------------User is Authorized--------------------------
            // console.table(loggedInUserFromDB)
            localStorage.setItem('isActive', loggedInUserFromDB.active);
            localStorage.setItem('loggedIn_user_GUID', loggedInUserFromDB.user_GUID);
            localStorage.setItem('selected_module', loggedInUserFromDB.module_id);
            this.module = loggedInUserFromDB.module_id == null ? 0 : loggedInUserFromDB.module_id;
            //-------------------------User is Authorized--------------------------  
          }
          // alert(this.module)
          switch (this.module) {
            case 1: this.rootPage = SurveyorHomePage; break;
            case 2:
              this.myCloud.getUserLocationListFromCloud();
              this.myCloud.getVehicleLocationListFromCloud();
              this.myCloud.getDriverLocationListFromCloud();
              this.myCloud.syncHarvestHistoryCloudToSQLite();
              this.myCloud.syncLoadHistoryCloudToSQLite();
              this.rootPage = MandorHomePage;
              break;
            case 3: this.rootPage = FactoryHomePage; break;
            default: this.rootPage = UnAuthorizedUserPage;
            // default: this.rootPage = FactoryHomePage;
            // default: this.rootPage = SurveyorHomePage;
          }
        }, err => {
          if (err.status == 400) {
            alert('400 Error')
          } else if (err.status == 403) {
            alert('403 Error')
          } else if (err.status == 500) {
            alert('Something wrong with server');
          }
          else if (err.status == 404) {
            alert('UUID is not registered')
          }
          this.rootPage = UnAuthorizedUserPage;
        });
        //--------------------------------------------------Device in Online--------------------------------------------
      }

      statusBar.styleDefault(); splashScreen.hide();
    });
  }
}
