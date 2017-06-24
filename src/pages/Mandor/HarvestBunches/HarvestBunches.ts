import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HarvestBunchesModel } from '../../../models/HarvestBunchesModel';
import { LoadBunchesModel } from '../../../models/LoadBunchesModel';
import * as constants from '../../../config/constants';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { MandorInfoModel } from '../../../models/MandorInfoModel';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Component
    ({
        selector: 'page-HarvestBunches',
        templateUrl: 'HarvestBunches.html'
    })

export class HarvestBunchesPage {
    harvestAuthForm: FormGroup;
    loadAuthForm: FormGroup;
    locationFromDB: any;
    vehicleFromDB: any;
    totalHarvested: number; totalLoaded: number; balanceHarvested: number;
    driverFromDB: any;
    UserGUID: string;
    UIDFromMobile: string;
    harvestModel: HarvestBunchesModel = new HarvestBunchesModel();
    loadModel: LoadBunchesModel = new LoadBunchesModel();
    harvestedHistoryData: any;
    ifConnect: Subscription;

    constructor(private myCloud: StorageService, private sqlite: SQLite, private network: Network, public actionsheetCtrl: ActionSheetController, public global: SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public fb: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {

        this.harvestAuthForm = fb.group({
            'harvestedBunchCount': [null, Validators.compose([Validators.pattern('[0-9]*'), Validators.required])]
        });
        this.loadAuthForm = fb.group({
            'loadedBunchCount': [null, Validators.compose([Validators.required])],
            'driverSelect': [null, Validators.compose([Validators.required])],
            'vehicleSelect': [null, Validators.compose([Validators.required])]
        });
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        this.locationFromDB = this.myCloud.getUserLocationsFromSQLite();
        this.myCloud.syncMandorInfoCloudToSQLite(this.UserGUID, this.global.getStringDate());
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
        } else {
            var url = constants.DREAMFACTORY_TABLE_URL + "/transact_harvest_view?filter=(location_name=" + locationSelected + ")AND(user_GUID=" + this.UserGUID + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                this.harvestedHistoryData = data["resource"]
            });
        }
    }

    getLoadedHistory(locationSelected: any) {
        if (this.network.type == "none") {
            this.harvestedHistoryData = this.myCloud.getLoadHistoryFromSQLite(locationSelected);
        }
        else {
            var url = constants.DREAMFACTORY_TABLE_URL + "/transact_loading_view?filter=(location_name=" + locationSelected + ")AND(user_GUID=" + this.UserGUID + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                this.harvestedHistoryData = data["resource"]
            });
        }

    }

    getSummaryByLocation(locationSelected: any) {
        if (this.network.type == "none") {
            this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
                this.totalHarvested = 0;
                this.totalLoaded = 0;
                var query = "select * from mandor_harvested_info where location_GUID='" + locationSelected + "'";
                // alert(query)
                db.executeSql(query, {}).then((data) => {
                    // alert('Selecting Inserted list from Sqlite');		
                    // alert('push :' + data.rows.item(0).total_harvested)
                    this.totalHarvested = data.rows.item(0).total_harvested;
                    this.balanceHarvested = this.totalHarvested - this.totalLoaded
                    query = "select * from mandor_loaded_info where location_GUID='" + locationSelected + "'";
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
    }

    getDataByLocation(locationSelected: any) {
        this.driverFromDB = this.myCloud.getDriverLocationsFromSQLite(locationSelected);
        this.vehicleFromDB = this.myCloud.getVehicleLocationsFromSQLite(locationSelected);

        //Todo: Inject into a global function
        // var url = constants.DREAMFACTORY_TABLE_URL +
        //     "/active_vehicle_location_view?filter=location_GUID=" + locationSelected + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.vehicleFromDB = data["resource"];
        // });
        //Todo: Inject into a global function
        // url = constants.DREAMFACTORY_TABLE_URL +
        //     "/active_driver_location_view?filter=location_GUID=" + locationSelected + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.driverFromDB = data["resource"];
        // });
    }

    submitHarvestForm(value: any, location_GUID: string, location_name: string) {
        this.harvestModel.location_GUID = location_GUID;
        this.harvestModel.bunch_count = value.harvestedBunchCount;
        this.harvestModel.updated_ts = this.harvestModel.created_ts = this.global.getStringTimeStamp();
        this.harvestModel.user_GUID = this.harvestModel.createdby_GUID = this.harvestModel.updatedby_GUID = this.UserGUID;
        if (this.network.type == "none") {
            alert('No Network. Saving data to SQLite');
            this.global.showConfirm('sqlite', '2', this.harvestModel);
        }
        else {
            alert('Network exists. Saving data to Cloud');
            this.global.showConfirm('cloud', constants.DREAMFACTORY_TABLE_URL + '/transact_harvest', this.harvestModel.toJson(true));
        }
    }

    submitLoadForm(value: any, location_GUID: string) {
        this.loadModel.location_GUID = location_GUID;
        this.loadModel.vehicle_GUID = value.vehicleSelect;
        this.loadModel.driver_GUID = value.driverSelect;
        this.loadModel.bunch_count = value.loadedBunchCount;
        this.loadModel.createdby_GUID = this.loadModel.updatedby_GUID = this.loadModel.user_GUID = this.UserGUID;
        this.loadModel.created_ts = this.loadModel.updated_ts = this.global.getStringTimeStamp();
        if (this.network.type == "none") {
            alert('No Network. Saving data to SQLite');
            this.global.showConfirm('sqlite', '3', this.loadModel);
        }
        else {
            alert('Network exists. Saving data to Cloud');
            this.global.showConfirm('cloud', constants.DREAMFACTORY_TABLE_URL + '/transact_loading', this.loadModel.toJson(true));
        }
    }

    onLink(url: string) {
        window.open(url);
    }
}









