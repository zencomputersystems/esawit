import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { CountBunchesPage } from '../CountBunches/CountBunches';
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'page-home',
    templateUrl: 'SurveyorHome.html'
})
export class SurveyorHomePage {
    ifConnect: Subscription;

    constructor(private network: Network, private myCloud: StorageService, public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
        //   alert('Modified');
        //-----------------------Offline Sync---------------------------
        this.myCloud.getUserLocationListFromCloud();
        this.myCloud.syncHistoryCloudToSQLite();
        //-----------------------End Offline Sync---------------------------

    }

    //-----------------------Offline Sync---------------------------
    ionViewDidEnter() {
        this.ifConnect = this.network.onConnect().subscribe(data => {
            // this.myCloud.getUserLocationListFromCloud();
            //Sync the Count Bunches Page
            this.myCloud.saveSurveyToCloudFromSQLite();
            //Sync the History Page
            this.myCloud.syncHistoryCloudToSQLite();
        }, error => alert('Error In SurveyorHistory :' + error));
    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------

    onLink(url: string) {
        window.open(url);
    }

    public NewCount() {
        this.navCtrl.push(CountBunchesPage, {});

    }
    public GetCountHistory() {
        this.navCtrl.push(CountBunchesHistoryPage, {});

    }
}
