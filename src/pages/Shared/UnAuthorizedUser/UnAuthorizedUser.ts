import { Component } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { MandorHomePage } from '../../Mandor/MandorHome/MandorHome';
import { SurveyorHomePage } from '../../Surveyor/SurveyorHome/SurveyorHome';
import { FactoryHomePage } from '../../Factory/FactoryHome/FactoryHome';
import * as constants from '../../../config/constants';
import { Http, } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { UserImeiModel } from '../../../models/UserImeiModel';
import { SharedFunctions } from "../../../providers/Shared/Functions";
import { StorageService } from '../../../providers/Db/StorageFunctions';

@Component({
  selector: 'page-UnAuthorizedUser',
  templateUrl: 'UnAuthorizedUser.html',
})
export class UnAuthorizedUserPage {
  device_UUID: string;
  module: number;
  userImei: UserImeiModel = new UserImeiModel();

  constructor(private myCloud: StorageService,private http:Http, public global: SharedFunctions,private network: Network,public appCtrl: App, public navCtrl: NavController, public navParams: NavParams) {
    this.device_UUID = localStorage.getItem('device_UUID');
  }

  ionViewDidLoad() {
  }

  refreshData(refresher) {
    if (this.network.type != "none") {
      this.syncAndRefresh();
    }
    setTimeout(() => {
      refresher.complete();
    }, 3000);
  }


  syncAndRefresh() {
    if (this.network.type == "none") {
      //--------------------------------------------------Device in Offline--------------------------------------------
      // console.log('you are in offline');
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
        case 1: this.appCtrl.getRootNav().setRoot(SurveyorHomePage);         break;
        case 2: this.appCtrl.getRootNav().setRoot(MandorHomePage);   break;
        case 3:this.appCtrl.getRootNav().setRoot(FactoryHomePage);   break;
        default:this.appCtrl.getRootNav().setRoot(UnAuthorizedUserPage);
      }
      //--------------------------------------------------Device in Offline--------------------------------------------
    }
    else {
      //--------------------------------------------------Device in Online--------------------------------------------
      // console.log('you are in online');
      var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=user_IMEI=" + this.device_UUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;
      this.http.get(url).map(res => res.json()).subscribe(data => {
        var loggedInUserFromDB = data["resource"][0];
        if (loggedInUserFromDB == null) {
          //----------------------First Time App is installed----------------------
          this.userImei.Imei_GUID = UUID.UUID();
          this.userImei.user_IMEI = this.device_UUID;
          this.userImei.active = 2;
          this.userImei.updated_ts = this.userImei.created_ts = this.global.getStringTimeStamp();
          console.log(JSON.stringify(this.userImei))
          this.myCloud.saveToCloud(constants.DREAMFACTORY_TABLE_URL + '/user_imei', this.userImei.toJson(true));
          this.module = 0;
          //----------------------First Time App is installed---------------------
        }
        else if (loggedInUserFromDB.active != 1) {
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
        // console.log(this.module)
        switch (this.module) {
          case 1: this.appCtrl.getRootNav().setRoot(SurveyorHomePage); break;
          case 2:
            this.myCloud.getUserLocationListFromCloud();
            this.myCloud.getVehicleLocationListFromCloud();
            this.myCloud.getDriverLocationListFromCloud();
            this.myCloud.syncHarvestHistoryCloudToSQLite();
            this.myCloud.syncLoadHistoryCloudToSQLite();
            this.appCtrl.getRootNav().setRoot(MandorHomePage);
            break;
          case 3: this.appCtrl.getRootNav().setRoot(FactoryHomePage); break;
          default: this.appCtrl.getRootNav().setRoot(UnAuthorizedUserPage);
        }
      }, err => {
        if (err.status == 400) {
          console.log('400 Error')
        } else if (err.status == 403) {
          console.log('403 Error')
        } else if (err.status == 500) {
          console.log('Something wrong with server');
        }
        else if (err.status == 404) {
          console.log('UUID is not registered')
        }
        this.appCtrl.getRootNav().setRoot(UnAuthorizedUserPage);
      });
      //--------------------------------------------------Device in Online--------------------------------------------
    }
  }

}
