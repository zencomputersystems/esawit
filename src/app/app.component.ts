import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as constants from '../config/constants';
import { SharedFunctions } from "../providers/Shared/Functions";
import { LoginPage } from '../pages/Shared/Login/Login';
import { Http, Headers, RequestOptions } from '@angular/http';
import { StorageService } from '../providers/Db/StorageFunctions';

// Translation Service:
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'app.html',
  providers: [SharedFunctions, StorageService]
})
export class MyApp {
  rootPage: any = LoginPage;
  UIDFromMobile: string;
  UserGUID: string;
  locationListFromDb: any;

  constructor(private myCloud: StorageService, public http: Http, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, translate: TranslateService) {
    translate.setDefaultLang('en');
    platform.ready().then(() => { statusBar.styleDefault(); splashScreen.hide(); });

      this.UIDFromMobile = "2";
      var locationListFromCloud = this.myCloud.getLocationListFromCloud(this.UIDFromMobile);
    //  console.log('in app. Before table');
    //   console.table(locationListFromCloud);
      this.myCloud.syncMasterLocation(locationListFromCloud);

  }
}

