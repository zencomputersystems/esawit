import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { SurveyHistoryModel } from '../../../models/SurveyHistoryModel'
import * as constants from '../../../config/constants';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'page-history',
    templateUrl: 'CountBunchesHistory.html'
})
export class CountBunchesHistoryPage {
    labelsFromStorage: any;
    countHistoryData: any; surveyHistoryList: SurveyHistoryModel[] = [];
    ifConnect: Subscription;
    ifDisconnect: Subscription;

    constructor(public global: SharedFunctions, private myCloud: StorageService, private network: Network, public sqlite: StorageService, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController) {


        if (this.network.type == "none") {
            alert('No Network. Getting data from SQLite');
            this.countHistoryData = this.sqlite.getSurveyHistoryFromSQLite();
        }
        else {
            alert('Network exists. Getting data from Cloud');
            var url = constants.DREAMFACTORY_TABLE_URL + "/transact_survey_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                this.countHistoryData = data["resource"];
            });
        }
    }

    ionViewDidEnter() {
        this.ifConnect = this.network.onConnect().subscribe(data => {
            alert('Network exists. Saving data to SQLite');
            var url = constants.DREAMFACTORY_TABLE_URL + "/transact_survey_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                var modelFromCloud = data["resource"];
                modelFromCloud.forEach(cloudItem => {
                    var surveyHistory: SurveyHistoryModel = new SurveyHistoryModel();
                    surveyHistory.location_name = cloudItem.location_name;
                    surveyHistory.bunch_count = cloudItem.bunch_count;
                    surveyHistory.month = cloudItem.month;
                    this.surveyHistoryList.push(surveyHistory);
                });
                this.sqlite.syncSurveyHistory(this.surveyHistoryList);
            });

            // alert(data.type);
        }, error => console.error(error));

        // this.ifDisconnect = this.network.onDisconnect().subscribe(data => {
        //     // alert(data.type);
        // }, error => console.error(error));
    }

    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
        this.ifDisconnect.unsubscribe();
    }

    itemSelected(item: string) {
        console.log("Selected Item", item);
    }
}


