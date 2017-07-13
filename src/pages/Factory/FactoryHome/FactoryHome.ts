import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { AcceptBunchesPage } from '../AcceptBunches/AcceptBunches';
import { AcceptedBunchesHistoryPage } from '../AcceptedBunchesHistory/AcceptedBunchesHistory';
import { TranslateService } from '@ngx-translate/core';
// import { MainMenu } from "../../../providers/MainMenu";
import { SharedFunctions } from '../../../providers/Shared/Functions';
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
        this.translateToMalay();
        
        //-----------------------Offline Sync---------------------------
        //Get locations based on user_GUID from Cloud. It will be used in CountBunches Module.
        this.myCloud.getCloudMasterLocations();
        this.myCloud.getVehicleLocationListFromCloud();
        this.myCloud.getDriverLocationListFromCloud();
        this.myCloud.getMasterVehiclesListFromCloud();
        this.myCloud.getMasterVehiclesFromSQLite();
        this.myCloud.syncUnloadHistoryCloudToSQLite();

        //Sync the locationList from cloud to SQLite
        // this.myCloud.syncMasterLocationsToSQLite(locationListFromCloud);
        //-----------------------End Offline Sync---------------------------

    }

    //-----------------------Offline Sync---------------------------
    ionViewDidEnter() {
        this.ifConnect = this.network.onConnect().subscribe(data => {
            // this.myCloud.getCloudMasterLocations();
            //Sync the Count Bunches Page
            this.myCloud.saveUnloadToCloudFromSQLite();
            //Sync the History Page
            this.myCloud.syncUnloadHistoryCloudToSQLite();
        }, error => alert('Error In SurveyorHistory :' + error));
    }
    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------


    onLink(url: string) {
        window.open(url);
    }
    // openGlobalMenu() {
    //     this.mainMenu.openMenu();
    // }

    public NewAcceptance() {
        this.navCtrl.push(AcceptBunchesPage, {});
    }
    public GetHistory() {
        this.navCtrl.push(AcceptedBunchesHistoryPage, {});
    }

    //---------------------header button start---------------------//
    public translateToEnglishClicked: boolean = true; //Whatever you want to initialise it as
    public translateToMalayClicked: boolean = false; //Whatever you want to initialise it as

    public translateToEnglish() {
        this.translateService.use('en');
        this.translateToMalayClicked = !this.translateToMalayClicked;
        this.translateToEnglishClicked = !this.translateToEnglishClicked;
        console.log("ms : " + this.translateToMalayClicked);
        console.log("en : " + this.translateToEnglishClicked);
    }

    public translateToMalay() {
        this.translateService.use('ms');
        this.translateToEnglishClicked = !this.translateToEnglishClicked;
        this.translateToMalayClicked = !this.translateToMalayClicked;
        console.log("ms : " + this.translateToMalayClicked);
        console.log("en : " + this.translateToEnglishClicked);
    }
    //---------------------header button end---------------------//
}
