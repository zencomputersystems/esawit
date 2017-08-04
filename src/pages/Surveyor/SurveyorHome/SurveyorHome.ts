import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { CountBunchesPage } from '../CountBunches/CountBunches';
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';
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

        if (this.network.type != "none") {
            this.myCloud.saveSurveyToCloudFromSQLite();
            this.myCloud.syncHistoryCloudToSQLite();
        }
        //-----------------------Offline Sync---------------------------
        this.myCloud.getUserLocationListFromCloud();
        this.myCloud.syncHistoryCloudToSQLite();
        //-----------------------End Offline Sync---------------------------

    }

    //-----------------------Offline Sync---------------------------
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

    public NewCount() {
        this.navCtrl.push(CountBunchesPage, {});

    }
    public GetCountHistory() {
        this.navCtrl.push(CountBunchesHistoryPage, {});

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
