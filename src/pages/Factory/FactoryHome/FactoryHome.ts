import { Component } from '@angular/core';
import { App,NavController, Platform, ActionSheetController } from 'ionic-angular';
import { AcceptBunchesPage } from '../AcceptBunches/AcceptBunches';
import { AcceptedBunchesHistoryPage } from '../AcceptedBunchesHistory/AcceptedBunchesHistory';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { UnAuthorizedUserPage } from '../../Shared/UnAuthorizedUser/UnAuthorizedUser'
import * as constants from '../../../config/constants';
import { Http } from '@angular/http';

@Component({
    selector: 'page-home',
    templateUrl: 'FactoryHome.html'
})
export class FactoryHomePage {
    ifConnect: Subscription;    UIDFromMobile: string;
    
    constructor(private http:Http,public appCtrl: App,private network: Network, private myCloud: StorageService, public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {
    }

    syncAndRefresh() {
        var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=user_IMEI=" + this.UIDFromMobile + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            var loggedInUserFromDB = data["resource"][0];
            if (loggedInUserFromDB == null || loggedInUserFromDB.active == 2 || loggedInUserFromDB.active == 0) {
                localStorage.setItem('isActive', null);
                this.appCtrl.getRootNav().setRoot(UnAuthorizedUserPage);
            }
            else {
                this.myCloud.saveUnloadToCloudFromSQLite();
                this.myCloud.syncUnloadHistoryCloudToSQLite();
        
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
        });

       
    }

    //-----------------------Offline Sync---------------------------
    ionViewWillEnter() {
        this.UIDFromMobile = localStorage.getItem("device_UUID");        
        
        if (this.network.type != "none") {
            this.syncAndRefresh();
        }
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.syncAndRefresh();
        }, error => console.log('Error In SurveyorHistory :' + error));
    }

    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }
    //-----------------------End Offline Sync---------------------------

    public NewAcceptance() {
        this.appCtrl.getRootNav().setRoot(AcceptBunchesPage);
    }
    public GetHistory() {
       this.appCtrl.getRootNav().setRoot(AcceptedBunchesHistoryPage);
    }

}
