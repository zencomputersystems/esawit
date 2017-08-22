import { UserImeiModel } from '../models/UserImeiModel';
import { Component } from '@angular/core';
import { App, Platform, ActionSheetController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as constants from '../config/constants';
import { SharedFunctions } from "../providers/Shared/Functions";
import { Http, } from '@angular/http';
import { StorageService } from '../providers/Db/StorageFunctions';
import { FactoryHomePage } from '../pages/Factory/FactoryHome/FactoryHome';
import { AcceptBunchesPage } from '../pages/Factory/AcceptBunches/AcceptBunches';
import { AcceptedBunchesHistoryPage } from '../pages/Factory/AcceptedBunchesHistory/AcceptedBunchesHistory';
import { MandorHomePage } from '../pages/Mandor/MandorHome/MandorHome';
import { HarvestBunchesPage } from '../pages/Mandor/HarvestBunches/HarvestBunches';
import { SurveyorHomePage } from '../pages/Surveyor/SurveyorHome/SurveyorHome';
import { CountBunchesPage } from '../pages/Surveyor/CountBunches/CountBunches';
import { CountBunchesHistoryPage } from '../pages/Surveyor/CountBunchesHistory/CountBunchesHistory';
import { Device } from '@ionic-native/device';
import { UnAuthorizedUserPage } from '../pages/Shared/UnAuthorizedUser/UnAuthorizedUser'
// Translation Service:
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network';
import { UUID } from 'angular2-uuid';

@Component({
  templateUrl: 'app.html',
  providers: [SharedFunctions, StorageService, Device]
})
export class MyApp {
  rootPage: any; public headerButtonClicked: boolean = true;
  UIDFromMobile: string;
  locationListFromDb: any;
  module: number;
  userImei: UserImeiModel = new UserImeiModel();
  constructor(public app: App, public global: SharedFunctions, public actionsheetCtrl: ActionSheetController, private network: Network, private device: Device, private myCloud: StorageService, public http: Http, public platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public translate: TranslateService) {
    this.translateToMalay();
    this.translate.setDefaultLang('en'); //Fallback language
    platform.ready().then(() => {

      //-----------------------------------------Web Design Purpose------------------------------------
      this.UIDFromMobile =
        // "343434";
        "f47b4e39376dbe34";
      // this.device.uuid;
      //-----------------------------------------End Web Design Purpose------------------------------------
      // console.log(this.network.type)
      localStorage.setItem('device_UUID', this.UIDFromMobile);
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
          case 1: this.rootPage = SurveyorHomePage; break;
          case 2: this.rootPage = MandorHomePage; break;
          case 3: this.rootPage = FactoryHomePage; break;
          default: this.rootPage = UnAuthorizedUserPage;
        }
        //--------------------------------------------------Device in Offline--------------------------------------------
      }
      else {
        //--------------------------------------------------Device in Online--------------------------------------------
        // console.log('you are in online');
        var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=user_IMEI=" + this.UIDFromMobile + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
          var loggedInUserFromDB = data["resource"][0];
          if (loggedInUserFromDB == null) {
            //----------------------First Time App is installed----------------------
            this.userImei.Imei_GUID = UUID.UUID();
            this.userImei.user_IMEI = this.UIDFromMobile;
            this.userImei.active = 2;
            this.userImei.updated_ts = this.userImei.created_ts = this.global.getStringTimeStamp();
            console.log(JSON.stringify(this.userImei))
            this.myCloud.saveToCloud(constants.DREAMFACTORY_TABLE_URL + '/user_imei', this.userImei.toJson(true));
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
          // console.log(this.module)
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
            console.log('400 Error')
          } else if (err.status == 403) {
            console.log('403 Error')
          } else if (err.status == 500) {
            console.log('Something wrong with server');
          }
          else if (err.status == 404) {
            console.log('UUID is not registered')
          }
          this.rootPage = UnAuthorizedUserPage;
        });
        //--------------------------------------------------Device in Online--------------------------------------------
      }

      statusBar.styleDefault(); splashScreen.hide();
    });
  }

  presentMenu() {
    let surveyMenu = this.translate.get("_SURVEYOR_MENU")["value"];
    let home = this.translate.get("_HOME_MENU")["value"];
    let countBunches = this.translate.get("_COUNT_BUNCHES_BTN")["value"];
    let bunchesHistory = this.translate.get("_COUNT_HISTORY_BTN")["value"];
    let supervisorMenu = this.translate.get("_SUPERVISOR_MENU")["value"];
    let harvestBunches = this.translate.get("_HARVEST_BTN")["value"];
    let factoryMenu = this.translate.get("_FACTORY_MENU")["value"];
    let acceptBunches = this.translate.get("_ACCEPT_BUNCHES_BTN")["value"];
    let acceptBunchesHistory = this.translate.get("_ACCEPTED_BUNCHES_HISTORY_BTN")["value"];
    if (this.module == 1) {
      let actionSheet = this.actionsheetCtrl.create({
        title: surveyMenu,
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: home,
            icon: !this.platform.is('ios') ? 'home' : null,
            handler: () => {
              this.app.getRootNav().setRoot(SurveyorHomePage);

            }
          },
          {
            text: countBunches,
            icon: !this.platform.is('ios') ? 'logo-buffer' : null,
            handler: () => {
              this.app.getRootNav().setRoot(CountBunchesPage);

            }
          },
          {
            text: bunchesHistory,
            icon: !this.platform.is('ios') ? 'md-filing' : null,
            handler: () => {
              this.app.getRootNav().setRoot(CountBunchesHistoryPage);

            }
          }
        ]
      });
      actionSheet.present();
    }

    else if (this.module == 2) {
      let actionSheet = this.actionsheetCtrl.create({
        title: supervisorMenu,
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: home,
            icon: !this.platform.is('ios') ? 'home' : null,
            handler: () => {
              this.app.getRootNav().setRoot(MandorHomePage);

            }
          },
          {
            text: harvestBunches,
            icon: !this.platform.is('ios') ? 'leaf' : null,
            handler: () => {
              this.app.getRootNav().setRoot(HarvestBunchesPage);

            }
          }
        ]
      });
      actionSheet.present();
    }

    else if (this.module == 3) {
      let actionSheet = this.actionsheetCtrl.create({
        title: factoryMenu,
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: home,
            icon: !this.platform.is('ios') ? 'home' : null,
            handler: () => {
              this.app.getRootNav().setRoot(FactoryHomePage);
            }
          },
          {
            text: acceptBunches,
            icon: !this.platform.is('ios') ? 'cut' : null,
            handler: () => {
              this.app.getRootNav().setRoot(AcceptBunchesPage);

            }
          },
          {
            text: acceptBunchesHistory,
            icon: !this.platform.is('ios') ? 'bus' : null,
            handler: () => {
              this.app.getRootNav().setRoot(AcceptedBunchesHistoryPage);
            }
          }
        ]
      });
      actionSheet.present();
    }
  }


  //---------------------Language module start---------------------//
  public translateToMalayClicked: boolean = false;
  public translateToEnglishClicked: boolean = true;
  
  public translateToEnglish() {
    this.translate.use('en');
    this.translateToMalayClicked = !this.translateToMalayClicked;
    this.translateToEnglishClicked = !this.translateToEnglishClicked;
  }

  public translateToMalay() {
    this.translate.use('ms');
    this.translateToEnglishClicked = !this.translateToEnglishClicked;
    this.translateToMalayClicked = !this.translateToMalayClicked;
  }
  //---------------------Language module end---------------------//

}
