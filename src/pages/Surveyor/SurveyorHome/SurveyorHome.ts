import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { CountBunchesPage } from '../CountBunches/CountBunches';
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'page-home',
    templateUrl: 'SurveyorHome.html'
})
export class SurveyorHomePage {
    ifConnect: Subscription;

    constructor(private network: Network, private myCloud: StorageService, public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {
        
        this.translateToEnglish();
        this.translateToMalay();

        //   alert('Modified');
        //-----------------------Offline Sync---------------------------
                this.myCloud.getCloudMasterLocations();
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
