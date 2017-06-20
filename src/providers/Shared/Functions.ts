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
import {StorageService} from '../Db/StorageFunctions'

// Translation Service:
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@Injectable()
export class SharedFunctions {
  navCtrl: any;
  successToast = this.translate.get("_SUCCESS_TOAST_LBL")["value"];
  failedToast = this.translate.get("_FAILED_TOAST_LBL")["value"];

  constructor(public storageSurvice:StorageService,public toastCtrl: ToastController, public alertCtrl: AlertController, public app: App, public http: Http, public actionsheetCtrl: ActionSheetController, public translate: TranslateService) {
    //    translate.setDefaultLang('en');
    this.navCtrl = this.app.getActiveNav();
    console.log('Hello ActionSheet Provider');
  }

  getStringTimeStamp() {
    var myDate = new Date();
    //    return new Date(myDate.getUTCFullYear(), myDate.getUTCMonth(), myDate.getUTCDate(), myDate.getUTCHours(), myDate.getUTCMinutes(), myDate.getSeconds());
    // return new Date(myDate.getTime());
    return        ( myDate.getDate()+"-"+(myDate.getMonth()+1)+"-"+myDate.getFullYear()+" "+myDate.getHours()+":"+myDate.getMinutes()+":"+myDate.getSeconds());

  }

  getStringDate() {
    var myDate = new Date();
    var day:string=null;
    var month:string=null;
 var temp = myDate.getDate();
 if(temp<10){day="0"+temp;}else{day=temp+"";}
 temp = (myDate.getMonth()+1);
 if(temp<10){month = "0"+temp;}else{month=temp+"";}
    return        ( myDate.getFullYear()+"-"+month+"-"+day);

  }
    getTimeStamp() {
    var myDate = new Date();
       return new Date(myDate.getUTCFullYear(), myDate.getUTCMonth(), myDate.getUTCDate(), myDate.getUTCHours(), myDate.getUTCMinutes(), myDate.getSeconds());
    // return new Date(myDate.getTime());
    // return        ( myDate.getDate()+"-"+myDate.getMonth()+"-"+myDate.getFullYear()+" "+myDate.getHours()+":"+myDate.getMinutes()+":"+myDate.getSeconds());

  }

  showConfirm(saveType: string, saveInstruction: string, myModel: any) {
    let confirmTitle = this.translate.get("_CONFIRMATION_TITLE")["value"];
    let confirmMessage = this.translate.get("_CONFIRMATION_MESSAGE_LBL")["value"];
    let cancelButton = this.translate.get("_CANCEL_BTN")["value"];
    let acceptButton = this.translate.get("_ACCEPT_BTN")["value"];

    let confirm = this.alertCtrl.create({
      title: confirmTitle,
      message: confirmMessage,
      buttons: [
        {
          text: cancelButton,
          handler: () => {
          }
        },
        {
          text: acceptButton,
          handler: () => {

            if (saveType == 'cloud') {
              this.storageSurvice.saveToCloud(saveInstruction, myModel);
            } else if (saveType == 'sqlite') {
              this.storageSurvice.saveToSQLite(saveInstruction, myModel);
            }

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
