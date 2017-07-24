import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { AcceptBunchesPage } from '../AcceptBunches/AcceptBunches';
import { AcceptedBunchesHistoryPage } from '../AcceptedBunchesHistory/AcceptedBunchesHistory';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'page-home',
    templateUrl: 'FactoryHome.html'
})
export class FactoryHomePage {
    ifConnect: Subscription;
    constructor(private network: Network, private myCloud: StorageService, public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {
        this.translateToEnglish();

        if (this.network.type != "none") {
            this.myCloud.saveUnloadToCloudFromSQLite();
            this.myCloud.syncUnloadHistoryCloudToSQLite();
        }
        //-----------------------Offline Sync---------------------------
        this.myCloud.getCloudMasterLocations();
        this.myCloud.getVehicleLocationListFromCloud();
        this.myCloud.getDriverLocationListFromCloud();
        this.myCloud.getMasterVehiclesListFromCloud();
        this.myCloud.getMasterVehiclesFromSQLite();
        this.myCloud.syncUnloadHistoryCloudToSQLite();
        //-----------------------End Offline Sync---------------------------

        //----------------------Driver Vehicle----------------------
        this.myCloud.getVehicleDriverListFromCloud();

        //----------------------Driver Vehicle----------------------

    }

    //-----------------------Offline Sync---------------------------
    ionViewDidEnter() {
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.myCloud.saveUnloadToCloudFromSQLite();
            this.myCloud.syncUnloadHistoryCloudToSQLite();
        }, error => alert('Error In SurveyorHistory :' + error));
    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------

    public NewAcceptance() {
        this.navCtrl.push(AcceptBunchesPage, {});
    }
    public GetHistory() {
        this.navCtrl.push(AcceptedBunchesHistoryPage, {});
    }

    //---------------------Language module start---------------------//
    public translateToEnglishClicked: boolean = false;
    public translateToMalayClicked: boolean = true;

    public translateToEnglish() {
        this.translateService.use('en');
        this.translateToMalayClicked = !this.translateToMalayClicked;
        this.translateToEnglishClicked = !this.translateToEnglishClicked;
    }

    public translateToMalay() {
        this.translateService.use('ms');
        this.translateToEnglishClicked = !this.translateToEnglishClicked;
        this.translateToMalayClicked = !this.translateToMalayClicked;
    }
    //---------------------Language module end---------------------//
}
