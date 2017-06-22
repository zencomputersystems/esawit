import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { HarvestedHistoryPage } from '../HarvestedHistory/HarvestedHistory';
import { HarvestBunchesPage } from '../HarvestBunches/HarvestBunches';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'page-home',
    templateUrl: 'MandorHome.html'
})
export class MandorHomePage {
    ifConnect: Subscription;
    constructor(private network: Network, private myCloud: StorageService, private mainMenu: SharedFunctions, public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
        //-----------------------Offline Sync---------------------------
        this.myCloud.getUserLocationListFromCloud();
        this.myCloud.getVehicleLocationListFromCloud();
        this.myCloud.getDriverLocationListFromCloud();
        this.myCloud.syncHarvestHistoryCloudToSQLite();
        this.myCloud.syncLoadHistoryCloudToSQLite();
        //-----------------------End Offline Sync---------------------------

    }

    //-----------------------Offline Sync---------------------------
    ionViewDidEnter() {
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.myCloud.saveHarvestToCloudFromSQLite();
            this.myCloud.syncHarvestHistoryCloudToSQLite();

            this.myCloud.saveLoadToCloudFromSQLite();
            this.myCloud.syncLoadHistoryCloudToSQLite();

        }, error => alert('Error In SurveyorHistory :' + error));
    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------


    onLink(url: string) {
        window.open(url);
    }
    openGlobalMenu() {
        this.mainMenu.openMenu();
    }

    public NewHarvest() {
        this.navCtrl.push(HarvestBunchesPage, {});
    }
    public GetHistory() {
        this.navCtrl.push(HarvestedHistoryPage, {});
    }
}
