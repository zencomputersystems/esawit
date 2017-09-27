import { Component } from '@angular/core';
import { App, NavController, Platform, ActionSheetController } from 'ionic-angular';
import { CountBunchesPage } from '../CountBunches/CountBunches';
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { UnAuthorizedUserPage } from '../../Shared/UnAuthorizedUser/UnAuthorizedUser'
import { Http } from '@angular/http';
import * as constants from '../../../config/constants';

@Component({
    selector: 'page-home',
    templateUrl: 'SurveyorHome.html'
})
export class SurveyorHomePage {
    ifConnect: Subscription;
    UIDFromMobile: any;
    constructor(private http: Http, public appCtrl: App, private network: Network, private myCloud: StorageService, public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {
    }
    refreshData(refresher) {
      if (this.network.type != "none") {
        this.SyncAndRefresh();
      }
      setTimeout(() => {
        refresher.complete();
      }, 3000);
    }
    SyncAndRefresh() {
        var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=user_IMEI=" + this.UIDFromMobile + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            var loggedInUserFromDB = data["resource"][0];
            if (loggedInUserFromDB == null || loggedInUserFromDB.active == 2 || loggedInUserFromDB.active == 0) {
                localStorage.setItem('isActive', null);
                this.appCtrl.getRootNav().setRoot(UnAuthorizedUserPage);
            }
            else {
                this.myCloud.getUserLocationListFromCloud();

                this.myCloud.saveSurveyToCloudFromSQLite();
                this.myCloud.syncHistoryCloudToSQLite();
            }
        });
    }

    ionViewWillEnter() {
        this.UIDFromMobile = localStorage.getItem("device_UUID");
        if (this.network.type != "none") {
            this.SyncAndRefresh();
        }
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.SyncAndRefresh();
        }, error => console.error(error));

        //-----------------------Offline Sync---------------------------
        // this.myCloud.getUserLocationListFromCloud();
        // this.myCloud.syncHistoryCloudToSQLite();
        //-----------------------End Offline Sync---------------------------
    }

    //-----------------------Offline Sync---------------------------

    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------

    public NewCount() {
        // this.navCtrl.setRoot(CountBunchesPage, {});
        this.appCtrl.getRootNav().setRoot(CountBunchesPage);

    }
    public GetCountHistory() {
        // this.navCtrl.setRoot(CountBunchesHistoryPage, {});
        this.appCtrl.getRootNav().setRoot(CountBunchesHistoryPage);

    }

   }
