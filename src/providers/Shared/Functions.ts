import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { App, Platform, ActionSheetController, ToastController, AlertController } from 'ionic-angular';
// import { HarvestedHistoryPage } from '../pages/Mandor/HarvestedHistory/HarvestedHistory';
// import { HarvestBunchesPage } from '../pages/Mandor/HarvestBunches/HarvestBunches';
// import { SettingsPage } from '../pages/Shared/Settings/Settings';
// import { MandorHomePage } from '../pages/Mandor/MandorHome/MandorHome';
// import { CountBunchesPage } from '../pages/Surveyor/CountBunches/CountBunches';
// import { CountBunchesHistoryPage } from '../pages/Surveyor/CountBunchesHistory/CountBunchesHistory';
// import { SurveyorHomePage } from '../pages/Surveyor/SurveyorHome/SurveyorHome';
import * as constants from '../../config/constants';
import 'rxjs/add/operator/map';

// Translation Service:
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@Injectable()
export class SharedFunctions {
  navCtrl: any;
  constructor(public toastCtrl: ToastController, public alertCtrl: AlertController, public app: App, public http: Http, public actionsheetCtrl: ActionSheetController, public translate: TranslateService) {
    //    translate.setDefaultLang('en');
    this.navCtrl = this.app.getActiveNav();
    console.log('Hello ActionSheet Provider');
  }

  getTimeStamp() {
    var myDate = new Date();
//    return new Date(myDate.getUTCFullYear(), myDate.getUTCMonth(), myDate.getUTCDate(), myDate.getUTCHours(), myDate.getUTCMinutes(), myDate.getSeconds());
      return new Date(myDate.getTime());
  }

  showConfirm(url: string, myModel: any) {
    let confirm = this.alertCtrl.create({
      title: 'Create New Count?',
      message: 'Do you really want to add new count with given values?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {

            var queryHeaders = new Headers();
            queryHeaders.append('Content-Type', 'application/json');
            queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);

            let options = new RequestOptions({ headers: queryHeaders });

            this.http
              .post(url, myModel, options)
              .subscribe((response) => {
                console.log(response);
                this.showToast('bottom', 'New Record Successfully Added');
                // this.navCtrl.push(HarvestedHistoryPage);

              }, (error) => {
                this.showToast('bottom', 'Failed to Submit');
              });
          }
        }
      ]
    });
    confirm.present();
  }

  showToast(position: string, tostMessage: string) {
    let toast = this.toastCtrl.create({
      message: tostMessage,
      duration: 2000,
      position: position
    });

    toast.present(toast);
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
