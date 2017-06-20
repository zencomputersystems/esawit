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
import { MandorHomePage } from '../pages/Mandor/MandorHome/MandorHome';
import { FactoryHomePage } from '../pages/Factory/FactoryHome/FactoryHome';
import { SurveyorHomePage } from '../pages/Surveyor/SurveyorHome/SurveyorHome';

// Translation Service:
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'app.html',
  providers: [SharedFunctions, StorageService]
})
export class MyApp {
  rootPage: any;
  UIDFromMobile: string;
  locationListFromDb: any;
  constructor(public http: Http, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, translate: TranslateService) {
    translate.setDefaultLang('en');
    platform.ready().then(() => { statusBar.styleDefault(); splashScreen.hide(); });

    //Manually Set the UserGUID. Need to set dynamically.
    this.UIDFromMobile = "1";
    var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei/" + this.UIDFromMobile + "?id_field=user_IMEI&api_key=" + constants.DREAMFACTORY_API_KEY;
    this.http.get(url).map(res => res.json()).subscribe(data => {
      var loggedInUserFromDB = data;
      
      localStorage.setItem('loggedIn_user_GUID', loggedInUserFromDB.user_GUID);
      localStorage.setItem('selected_module', loggedInUserFromDB.module_id);
  var    module = loggedInUserFromDB.module_id;
      switch (module) {
        case 1: this.rootPage = SurveyorHomePage; break;
        case 2: this.rootPage = MandorHomePage; break;
        case 3: this.rootPage = FactoryHomePage; break;
      }
    });
  }
}

