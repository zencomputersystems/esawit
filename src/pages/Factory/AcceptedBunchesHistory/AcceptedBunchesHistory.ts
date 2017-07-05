import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http, Headers, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import * as constants from '../../../config/constants';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { SharedFunctions } from '../../../providers/Shared/Functions';

// import { MainMenu } from "../../../providers/MainMenu";

@Component({
    selector: 'page-history',
    templateUrl: 'AcceptedBunchesHistory.html'
})
export class AcceptedBunchesHistoryPage {
    labelsFromStorage: any; UserGUID: any;
    acceptedBunchesHistoryData: any; ifConnect: Subscription;
    localHistoryData: any;
    //  private mainMenu: MainMenu,
    constructor(public global: SharedFunctions, private myCloud: StorageService, private network: Network, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
    //-----------------------------------------Web Design Purpose------------------------------------
        this.historyDataInitializer();
    //  var url = constants.DREAMFACTORY_TABLE_URL + "/transact_unloading_view?filter=user_GUID=" + this.UserGUID + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
    //         this.http.get(url).map(res => res.json()).subscribe(data => {
    //             this.acceptedBunchesHistoryData = data["resource"];
    //         });
    //-----------------------------------------Web Design Purpose------------------------------------
    }

    //-----------------------Offline Sync---------------------------
    historyDataInitializer() {
        if (this.network.type == "none") {
            alert('No Network. Getting data from SQLite');
            this.acceptedBunchesHistoryData = this.myCloud.getUnloadHistoryFromSQLite();
            this.localHistoryData = this.myCloud.getUnloadFromSQLite();
        }
        else {
            alert('Network exists. Getting data from Cloud');
            this.myCloud.syncUnloadHistoryCloudToSQLite();

            var url = constants.DREAMFACTORY_TABLE_URL + "/transact_unloading_view?filter=user_GUID=" + this.UserGUID + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                this.acceptedBunchesHistoryData = data["resource"];
            });
        }
    }
    ionViewDidEnter() {
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.myCloud.syncUnloadHistoryCloudToSQLite();
        }, error => alert('Error In SurveyorHistory :' + error));
    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------


}


