import { Component } from '@angular/core';
import { App,NavController, NavParams, ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import * as constants from '../../../config/constants';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { TranslateService } from '@ngx-translate/core';
import { UnAuthorizedUserPage } from '../../Shared/UnAuthorizedUser/UnAuthorizedUser'

@Component({
    selector: 'page-history',
    templateUrl: 'AcceptedBunchesHistory.html'
})
export class AcceptedBunchesHistoryPage {
    labelsFromStorage: any; UserGUID: any;
    acceptedBunchesHistoryData: any; ifConnect: Subscription;
    localHistoryData: any;    UIDFromMobile: string;
    
    constructor(private appCntrl:App,public global: SharedFunctions, private myCloud: StorageService, private network: Network, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {
    }

    //-----------------------Offline Sync---------------------------
    historyDataInitializer() {
        if (this.network.type == "none") {
            this.acceptedBunchesHistoryData = this.myCloud.getUnloadHistoryFromSQLite();
            this.localHistoryData = this.myCloud.getUnloadFromSQLite();
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
                    this.myCloud.saveUnloadToCloudFromSQLite();
                    this.myCloud.syncUnloadHistoryCloudToSQLite();
                    var url = constants.DREAMFACTORY_TABLE_URL + "/transact_unloading_view?filter=user_GUID=" + this.UserGUID + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
                    this.http.get(url).map(res => res.json()).subscribe(data => {
                        this.acceptedBunchesHistoryData = data["resource"];
                    });
                }
            });

           
        }
    }
    ionViewWillEnter() {
        this.UIDFromMobile = localStorage.getItem("device_UUID");                
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.historyDataInitializer();
            // this.myCloud.saveUnloadToCloudFromSQLite();
            // this.myCloud.syncUnloadHistoryCloudToSQLite();
        }, error => console.log('Error In SurveyorHistory :' + error));

        //-----------------------------------------Web Design Purpose------------------------------------
        this.historyDataInitializer();
        //  var url = constants.DREAMFACTORY_TABLE_URL + "/transact_unloading_view?filter=user_GUID=" + this.UserGUID + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
        //         this.http.get(url).map(res => res.json()).subscribe(data => {
        //             this.acceptedBunchesHistoryData = data["resource"];
        //         });
        //-----------------------------------------Web Design Purpose------------------------------------

    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------

}


