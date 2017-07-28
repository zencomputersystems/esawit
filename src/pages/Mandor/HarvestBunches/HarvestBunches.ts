import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HarvestBunchesModel } from '../../../models/HarvestBunchesModel';
import { TranslateService } from '@ngx-translate/core';
import { LoadBunchesModel } from '../../../models/LoadBunchesModel';
import * as constants from '../../../config/constants';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Component
    ({
        selector: 'page-HarvestBunches',
        templateUrl: 'HarvestBunches.html'
    })

export class HarvestBunchesPage {

    public LocationClicked: any;

    public LocationClick(locID) {
        this.LocationClicked = locID;
        console.log(locID + "|" + this.LocationClicked)
    }

    locationData: string = "seg_harvest";


    harvestAuthForm: FormGroup;
    loadAuthForm: FormGroup;
    locationFromDB: any;
    vehicleFromDB: any;
    totalHarvested: number; totalLoaded: number; balanceHarvested: number; harvestInfo: any;
    driverFromDB: any;
    UserGUID: string;
    UIDFromMobile: string;
    harvestModel: HarvestBunchesModel = new HarvestBunchesModel();
    loadModel: LoadBunchesModel = new LoadBunchesModel();
    harvestedHistoryData: any;
    loadedHistoryData: any; localLoadHistory: any;
    ifConnect: Subscription;
    localHarvestHistory: any;

    constructor(private sqlite: SQLite, private network: Network, public actionsheetCtrl: ActionSheetController, public global: SharedFunctions,
        private myCloud: StorageService, public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public fb: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController, public translate: TranslateService, public translateService: TranslateService) {

        this.translateToEnglish();

        if (this.network.type != "none") {
            this.myCloud.syncMandorInfoCloudToSQLite(this.UserGUID, this.global.getStringDate());
            this.myCloud.saveHarvestToCloudFromSQLite();
            this.myCloud.syncHarvestHistoryCloudToSQLite();
            this.myCloud.saveLoadToCloudFromSQLite();
            this.myCloud.syncLoadHistoryCloudToSQLite();
        }
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        this.harvestAuthForm = fb.group({
            'harvestedBunchCount': [null, Validators.compose([Validators.pattern('^(?!(0))[0-9]*'), Validators.required])]
        });
        this.loadAuthForm = fb.group({
            'loadedBunchCount': [null, Validators.compose([Validators.pattern('^(?!(0))[0-9]*'), Validators.required])],
            'driverSelect': [null, Validators.compose([Validators.required])],
            'vehicleSelect': [null, Validators.compose([Validators.required])]
        });
        //-----------------------------------------Web Design Purpose------------------------------------
        this.locationFromDB = this.myCloud.getUserLocationsFromSQLite();
        // var url = constants.DREAMFACTORY_TABLE_URL + "/active_users_location_view?filter=user_GUID=" + this.UserGUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.locationFromDB = data["resource"];
        // });
        //-----------------------------------------Web Design Purpose------------------------------------
    }

    //-----------------------Offline Sync---------------------------
    ionViewDidEnter() {
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.myCloud.syncMandorInfoCloudToSQLite(this.UserGUID, this.global.getStringDate());
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

    getHarvestedHistory(locationSelected: any) {
        if (this.network.type == "none") {
            this.harvestedHistoryData = this.myCloud.getHarvestHistoryFromSQLite(locationSelected);
            this.localHarvestHistory = this.myCloud.getHarvestFromSQLite(locationSelected);
        } else {
            console.log("transact_harvest_view");
            var url = constants.DREAMFACTORY_TABLE_URL + "/transact_harvest_view?filter=(location_name=" + locationSelected + ")AND(user_GUID=" + this.UserGUID + ")&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                this.harvestedHistoryData = data["resource"]
            });
        }
        // this.harvestInfo = this.myCloud.getHarvestInfoListLocal();
    }

    getLoadedHistory(locationSelected: any) {
        if (this.network.type == "none") {
            this.loadedHistoryData = this.myCloud.getLoadHistoryFromSQLite(locationSelected);
            this.localLoadHistory = this.myCloud.getLoadFromSQLite(locationSelected);
        }
        else {
            var url = constants.DREAMFACTORY_TABLE_URL + "/transact_loading_view?filter=(location_name=" + locationSelected + ")AND(user_GUID=" + this.UserGUID + ")&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                this.loadedHistoryData = data["resource"]
            });
        }
    }

    getSummaryByLocationOld(locationSelected: any) {

        //--------------------------It is synced data maintained locally -----------------Depricated
        // {
        if (this.network.type == "none") {
            this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
                this.totalHarvested = 0;
                this.totalLoaded = 0;
                var query = "select * from mandor_harvested_info where location_GUID='" + locationSelected + "'";
                db.executeSql(query, {}).then((data) => {
                    this.totalHarvested = data.rows.item(0).total_harvested;
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                    query = "select * from mandor_loaded_info where location_GUID='" + locationSelected + "'";
                    db.executeSql(query, {}).then((data) => {
                        this.totalLoaded = data.rows.item(0).total_loaded;
                        this.balanceHarvested = this.totalHarvested - this.totalLoaded
                    }, (err) => {
                        alert('getMandorInfoFromSQLite: ' + JSON.stringify(err));
                    });
                }, (err) => {
                    alert('getMandorInfoFromSQLite: ' + JSON.stringify(err));
                });
                this.balanceHarvested = this.totalHarvested - this.totalLoaded
            }).catch(e => alert("getMandorInfoFromSQLite: " + JSON.stringify(e)));
        }
        else {
            this.totalHarvested = 0;
            this.totalLoaded = 0;
            var url = constants.DREAMFACTORY_TABLE_URL + "/harvested_count_loc_date_view?filter=(location_GUID=" + locationSelected + ")AND(user_GUID=" + this.UserGUID + ")AND(harvested_date=" + this.global.getStringDate() + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                var cloudData = data["resource"];
                if (cloudData.length == 0) {
                    this.totalHarvested = 0
                }
                else {
                    this.totalHarvested = cloudData[0].total_bunches
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                }
            });
            url = constants.DREAMFACTORY_TABLE_URL + "/loaded_count_loc_date_view?filter=(location_GUID=" + locationSelected + ")AND(user_GUID=" + this.UserGUID + ")AND(loaded_date=" + this.global.getStringDate() + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                var cloudData = data["resource"];
                if (cloudData.length == 0) {
                    this.totalLoaded = 0
                }
                else {
                    this.totalLoaded = cloudData[0].total_bunches
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                }
            });
            this.balanceHarvested = this.totalHarvested - this.totalLoaded
        }
        // }
        //--------------------------It is synced data maintained locally -----------------Depricated

    }

    getSummaryByLocation(locationSelected: any) {

        //--------------------------It is synced data maintained locally -----------------Depricated
        this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
            this.totalHarvested = 0;
            this.totalLoaded = 0;
            var query = "select * from harvested_info where location_GUID='" + locationSelected + "'";
            db.executeSql(query, {}).then((data) => {
                this.totalHarvested = data.rows.item(0).total_harvested;
                this.balanceHarvested = this.totalHarvested - this.totalLoaded
                query = "select * from mandor_loaded_info where location_GUID='" + locationSelected + "'";
                db.executeSql(query, {}).then((data) => {
                    this.totalLoaded = data.rows.item(0).total_loaded;
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                }, (err) => {
                    alert('getMandorInfoFromSQLite: ' + JSON.stringify(err));
                });
            }, (err) => {
                alert('getMandorInfoFromSQLite: ' + JSON.stringify(err));
            });
            this.balanceHarvested = this.totalHarvested - this.totalLoaded
        }).catch(e => alert("getMandorInfoFromSQLite: " + JSON.stringify(e)));
        //--------------------------It is synced data maintained locally -----------------Depricated

    }


    getDataByLocation(locationSelected: any) {
        //-----------------------------------------Web Design Purpose------------------------------------
        // this.driverFromDB = this.myCloud.getDriverLocationsFromSQLite(locationSelected);
        this.vehicleFromDB = this.myCloud.getVehicleLocationsFromSQLite(locationSelected);

        // var url = constants.DREAMFACTORY_TABLE_URL +
        //     "/active_vehicle_location_view?filter=location_GUID=" + locationSelected + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.vehicleFromDB = data["resource"];
        // });

        // url = constants.DREAMFACTORY_TABLE_URL +
        //     "/active_driver_location_view?filter=location_GUID=" + locationSelected + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.driverFromDB = data["resource"];
        // });
        //-----------------------------------------Web Design Purpose------------------------------------
    }
    onVehicleSelect(vehicleSelected: string) {
        this.driverFromDB = this.myCloud.getVehicleDriverFromSQLite(vehicleSelected);

    }

    submitHarvestForm(value: any, location_GUID: string, location_name: string) {
        this.harvestModel.location_GUID = location_GUID;
        this.harvestModel.bunch_count = value.harvestedBunchCount;
        this.harvestModel.updated_ts = this.harvestModel.created_ts = this.global.getTimeStamp();
        this.harvestModel.user_GUID = this.harvestModel.createdby_GUID = this.harvestModel.updatedby_GUID = this.UserGUID;
        if (this.network.type == "none") {
            this.global.showConfirm('sqlite', '2', this.harvestModel);
        }
        else {
            this.global.showConfirm('cloud', constants.DREAMFACTORY_TABLE_URL + '/transact_harvest', this.harvestModel.toJson(true));
            this.myCloud.syncHarvestHistoryCloudToSQLite();
        }
        this.myCloud.saveMandorHarvestInfoLocal(this.harvestModel);
        this.harvestAuthForm.reset();
    }

    submitLoadForm(value: any, location_GUID: string) {
        this.loadModel.location_GUID = location_GUID;
        this.loadModel.vehicle_GUID = value.vehicleSelect;
        this.loadModel.driver_GUID = value.driverSelect;
        this.loadModel.bunch_count = value.loadedBunchCount;
        this.loadModel.createdby_GUID = this.loadModel.updatedby_GUID = this.loadModel.user_GUID = this.UserGUID;
        this.loadModel.created_ts = this.loadModel.updated_ts = this.global.getTimeStamp();
        if (this.network.type == "none") {
            this.global.showConfirm('sqlite', '3', this.loadModel);
        }
        else {
            this.global.showConfirm('cloud', constants.DREAMFACTORY_TABLE_URL + '/transact_loading', this.loadModel.toJson(true));
            this.myCloud.syncLoadHistoryCloudToSQLite();
        }
        this.loadAuthForm.reset();
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









