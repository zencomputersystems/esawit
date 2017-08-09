import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import * as constants from '../../../config/constants';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'page-history',
    templateUrl: 'CountBunchesHistory.html'
})
export class CountBunchesHistoryPage {
    countHistoryData: any;
    localHistoryData: any;
    ifConnect: Subscription;

    constructor(public global: SharedFunctions, private myCloud: StorageService, private network: Network, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {
        // this.translateToEnglish();

        //-----------------------------------------Web Design Purpose------------------------------------
        this.historyDataInitializer();
        //  var url = constants.DREAMFACTORY_TABLE_URL + "/transact_survey_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
        //     this.http.get(url).map(res => res.json()).subscribe(data => {
        //         this.countHistoryData = data["resource"];
        //     });
        //-----------------------------------------Web Design Purpose------------------------------------
    }

    //-----------------------Offline Sync---------------------------
    historyDataInitializer() {
        if (this.network.type == "none") {
            this.countHistoryData = this.myCloud.getSurveyHistoryFromSQLite();
            this.localHistoryData = this.myCloud.getSurveyFromSQLite();
        }
        else {
            this.myCloud.saveSurveyToCloudFromSQLite();
            this.myCloud.syncHistoryCloudToSQLite();

            var url = constants.DREAMFACTORY_TABLE_URL + "/transact_survey_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                this.countHistoryData = data["resource"];
            });
        }
    }

    ionViewDidEnter() {
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.myCloud.saveSurveyToCloudFromSQLite();
            this.myCloud.syncHistoryCloudToSQLite();
        }, error => console.log('Error In SurveyorHistory :' + error));
    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------

    //---------------------Language module start---------------------//
    // public translateToEnglishClicked: boolean = false;
    // public translateToMalayClicked: boolean = true;

    // public translateToEnglish() {
    //     this.translateService.use('en');
    //     this.translateToMalayClicked = !this.translateToMalayClicked;
    //     this.translateToEnglishClicked = !this.translateToEnglishClicked;
    // }

    // public translateToMalay() {
    //     this.translateService.use('ms');
    //     this.translateToEnglishClicked = !this.translateToEnglishClicked;
    //     this.translateToMalayClicked = !this.translateToMalayClicked;
    // }
    //---------------------Language module end---------------------//
}


