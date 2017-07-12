import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as constants from '../config/constants';
import { SharedFunctions } from "../providers/Shared/Functions";
import { LoginPage } from '../pages/Shared/Login/Login';
import { Http, Headers, RequestOptions } from '@angular/http';
import { StorageService } from '../providers/Db/StorageFunctions';
import { SurveyHistoryModel } from '../models/SurveyHistoryModel'
import { HarvestBunchesPage } from '../pages/Mandor/HarvestBunches/HarvestBunches';
import { FactoryHomePage } from '../pages/Factory/FactoryHome/FactoryHome';
import { MandorHomePage } from '../pages/Mandor/MandorHome/MandorHome';
import { SurveyorHomePage } from '../pages/Surveyor/SurveyorHome/SurveyorHome';
import { Device } from '@ionic-native/device';
import { UnAuthorizedUserPage } from '../pages/Shared/UnAuthorizedUser/UnAuthorizedUser'
// Translation Service:
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'app.html',
  providers: [SharedFunctions, StorageService, Device]
})
export class MyApp {
  rootPage: any;
  UIDFromMobile: string;
  locationListFromDb: any;
  module: number;
  constructor(private device: Device, private myCloud: StorageService, public http: Http, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, translate: TranslateService) {
    translate.setDefaultLang('en');
    platform.ready().then(() => {
    //-----------------------------------------Web Design Purpose------------------------------------
      this.UIDFromMobile = 
      "6bce1120083b20b7";
      // this.device.uuid;
    //-----------------------------------------End Web Design Purpose------------------------------------
              localStorage.setItem('device_UUID', this.UIDFromMobile);

           var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=(user_IMEI=" + this.UIDFromMobile + ")AND(active=1)&api_key=" + constants.DREAMFACTORY_API_KEY;

      this.http.get(url).map(res => res.json()).subscribe(data => {
        var loggedInUserFromDB = data["resource"][0];
        if(loggedInUserFromDB==null){
          this.module = 0;
        }
        else{
        // console.table(loggedInUserFromDB)
        localStorage.setItem('loggedIn_user_GUID', loggedInUserFromDB.user_GUID);
        localStorage.setItem('selected_module', loggedInUserFromDB.module_id);
        this.module = loggedInUserFromDB.module_id==null?0: loggedInUserFromDB.module_id;
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
            this.rootPage = HarvestBunchesPage;          
            break;
          case 3: this.rootPage = FactoryHomePage; break;
         default:         this.rootPage = SurveyorHomePage;

        }
      },err=>{
         if(err.status == 400){
      alert('400 Error')
   }else if(err.status == 403){
    alert('403 Error')
   }else if(err.status == 500){
      alert('Something wrong with server');
   }
   else if(err.status==404){
     //alert('UUID is not registered');
     //This is for Theme Development
        localStorage.setItem('device_UUID', "ada434add3a71754");
        localStorage.setItem('loggedIn_user_GUID', "b935ee1c-5fa1-11e7-91cd-00155de7e742");
        localStorage.setItem('selected_module', "2");
       this.rootPage = HarvestBunchesPage;
   }
        //this.rootPage = UnAuthorizedUserPage;
      });
      statusBar.styleDefault(); splashScreen.hide();
    });
  }
}

