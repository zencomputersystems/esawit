import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { HarvestedHistoryPage } from '../HarvestedHistory/HarvestedHistory';
import { HarvestBunchesPage } from '../HarvestBunches/HarvestBunches';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import * as constants from '../../../config/constants';
import { Http, Headers, RequestOptions } from '@angular/http';

@Component({
    selector: 'page-home',
    templateUrl: 'MandorHome.html'
})
export class MandorHomePage {
    ifConnect: Subscription;
    UserGUID: string;
    totalHarvested: number; totalLoaded: number; balanceHarvested: number;
    constructor(private network: Network, public global: SharedFunctions, public http: Http, private sqlite: SQLite, private myCloud: StorageService, private mainMenu: SharedFunctions, public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController, public translate: TranslateService, public translateService: TranslateService) {
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        console.log(this.UserGUID);
        this.getSummary();

        this.translateToEnglish();
        this.translateToMalay();
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
    getSummary() {
        if (this.network.type == "none") {
            console.log(this.UserGUID);
            this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
                this.totalHarvested = 0;
                this.totalLoaded = 0;
                var query = "select * from mandor_harvested_info";
                // alert(query)
                db.executeSql(query, {}).then((data) => {
                    // alert('Selecting Inserted list from Sqlite');		
                    // alert('push :' + data.rows.item(0).total_harvested)
                    this.totalHarvested = data.rows.item(0).total_harvested;
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                    query = "select * from mandor_loaded_info";
                    // alert(query)
                    db.executeSql(query, {}).then((data) => {
                        // alert('Selecting Inserted list from Sqlite');	
                        // alert('push :' + data.rows.item(0).total_loaded)
                        this.totalLoaded = data.rows.item(0).total_loaded;
                        this.balanceHarvested = this.totalHarvested - this.totalLoaded
                    }, (err) => {
                        alert('getMandorInfoFromSQLite: ' + JSON.stringify(err));
                    });
                }, (err) => {
                    alert('getMandorInfoFromSQLite: ' + JSON.stringify(err));
                });
                // alert('Harvest'+this.totalHarvested); alert('Loaded'+this.totalLoaded)
                this.balanceHarvested = this.totalHarvested - this.totalLoaded
                // alert('balance'+this.balanceHarvested)
            }).catch(e => alert("getMandorInfoFromSQLite: " + JSON.stringify(e)));
        }
        else {
            console.log("Else " + this.UserGUID);
            this.totalHarvested = 0;
            this.totalLoaded = 0;
            var url = constants.DREAMFACTORY_TABLE_URL + "/harvested_count_loc_date_view?filter=(user_GUID=" + this.UserGUID + ")AND(harvested_date=" + this.global.getStringDate() + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
            console.log("URL : " + url);
            this.http.get(url).map(res => res.json()).subscribe(data => {
                alert(url);
                console.log(data);
                var cloudData = data["resource"];
                if (cloudData.length == 0) {
                    this.totalHarvested = 0
                }
                else {
                    cloudData.forEach(element => {
                        this.totalHarvested += element.total_bunches
                    });
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                }
            });
            url = constants.DREAMFACTORY_TABLE_URL + "/loaded_count_loc_date_view?filter=(user_GUID=" + this.UserGUID + ")AND(loaded_date=" + this.global.getStringDate() + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                var cloudData = data["resource"];
                if (cloudData.length == 0) {
                    this.totalLoaded = 0
                }
                else {
                    cloudData.forEach(element => {
                        this.totalLoaded += element.total_bunches
                    });
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                }
            });
            this.balanceHarvested = this.totalHarvested - this.totalLoaded
        }
    }


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
