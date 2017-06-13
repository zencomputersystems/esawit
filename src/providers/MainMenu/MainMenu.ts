import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { App, Platform, ActionSheetController } from 'ionic-angular';
// import { HarvestedHistoryPage } from '../pages/Mandor/HarvestedHistory/HarvestedHistory';
// import { HarvestBunchesPage } from '../pages/Mandor/HarvestBunches/HarvestBunches';
// import { SettingsPage } from '../pages/Shared/Settings/Settings';
// import { MandorHomePage } from '../pages/Mandor/MandorHome/MandorHome';
// import { CountBunchesPage } from '../pages/Surveyor/CountBunches/CountBunches';
// import { CountBunchesHistoryPage } from '../pages/Surveyor/CountBunchesHistory/CountBunchesHistory';
// import { SurveyorHomePage } from '../pages/Surveyor/SurveyorHome/SurveyorHome';

import 'rxjs/add/operator/map';

// Translation Service:
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@Injectable()
export class MainMenu {
  navCtrl: any;
  constructor(public app: App, public http: Http, public actionsheetCtrl: ActionSheetController, public translate: TranslateService) {
    //    translate.setDefaultLang('en');
    this.navCtrl = this.app.getActiveNav();
    console.log('Hello ActionSheet Provider');
  }
  public testMe() {
    console.log('Hello Test Provider');

  }
  openMenu() {
    let home_btn = this.translate.get("_HOME")["value"];
    let harvest_btn = this.translate.get("_HARVEST_BTN")["value"];
    let harvest_history_btn = this.translate.get("_HARVEST_HISTORY_BTN")["value"];
    let settings_btn = this.translate.get("_SETTINGS_BTN")["value"];



    let actionSheet = this.actionsheetCtrl.create({
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: home_btn,
          icon: 'home',
          handler: () => {
            // this.navCtrl.setRoot(MandorHomePage);
          }
        },
        {
          text: harvest_btn,
          icon: 'cut',
          handler: () => {
            // this.navCtrl.setRoot(HarvestBunchesPage);
          }
        },
        {
          text: harvest_history_btn,
          icon: 'bus',
          handler: () => {
            // this.navCtrl.setRoot(HarvestedHistoryPage);
          }
        },
        {
          text: settings_btn,
          icon: 'settings',
          handler: () => {
            // this.navCtrl.setRoot(SettingsPage);
          }
        }]
    });
    actionSheet.present();
  }

}
