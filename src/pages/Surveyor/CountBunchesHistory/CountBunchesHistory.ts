﻿import { Component } from '@angular/core';
import { App, NavController, NavParams, ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import * as constants from '../../../config/constants';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { UnAuthorizedUserPage } from '../../Shared/UnAuthorizedUser/UnAuthorizedUser'

@Component({
    selector: 'page-history',
    templateUrl: 'CountBunchesHistory.html'
})
export class CountBunchesHistoryPage {
    countHistoryData: any;
    localHistoryData: any;
    ifConnect: Subscription;
    UIDFromMobile: any;
    constructor(public appCntrl: App, public global: SharedFunctions, private myCloud: StorageService, private network: Network, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {

    }

    refreshData(refresher) {
      if (this.network.type != "none") {
        this.historyDataInitializer();
      }
      setTimeout(() => {
        refresher.complete();
      }, 3000);
    }

    //-----------------------Offline Sync---------------------------
    historyDataInitializer() {
        if (this.network.type == "none") {
            this.countHistoryData = this.myCloud.getSurveyHistoryFromSQLite();
            this.localHistoryData = this.myCloud.getSurveyFromSQLite();
        }
        else {
            var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=user_IMEI=" + this.UIDFromMobile + "&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                var loggedInUserFromDB = data["resource"][0];
                if (loggedInUserFromDB == null || loggedInUserFromDB.active == 2 || loggedInUserFromDB.active == 0) {
                    localStorage.setItem('isActive', null);
                    this.appCntrl.getRootNav().setRoot(UnAuthorizedUserPage);
                }
                else {
                    this.myCloud.saveSurveyToCloudFromSQLite();
                    this.myCloud.syncHistoryCloudToSQLite();

                    var url = constants.DREAMFACTORY_TABLE_URL + "/transact_survey_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
                    this.http.get(url).map(res => res.json()).subscribe(data => {
                        this.countHistoryData = data["resource"];
                    });
                }
            });
        }
    }

    ionViewWillEnter() {
        this.UIDFromMobile = localStorage.getItem("device_UUID");
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.historyDataInitializer();
        }, error => console.log('Error In SurveyorHistory :' + error));

        //-----------------------------------------Web Design Purpose------------------------------------
        this.historyDataInitializer();
        //  var url = constants.DREAMFACTORY_TABLE_URL + "/transact_survey_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
        //     this.http.get(url).map(res => res.json()).subscribe(data => {
        //         this.countHistoryData = data["resource"];
        //     });
        //-----------------------------------------Web Design Purpose------------------------------------

    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------

}


