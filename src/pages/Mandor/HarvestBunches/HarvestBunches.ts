import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HarvestBunchesModel } from '../../../models/HarvestBunchesModel';
import { LoadBunchesModel } from '../../../models/LoadBunchesModel';
import * as constants from '../../../config/constants';
import { SharedFunctions } from '../../../providers/Shared/Functions';

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
    totalHarvested: string; totalLoaded: string; balanceHarvested: any;
    driverFromDB: any;
    UserGUID: string;
    UIDFromMobile: string;
    harvestModel: HarvestBunchesModel = new HarvestBunchesModel();
    loadModel: LoadBunchesModel = new LoadBunchesModel();
    harvestedHistoryData: any;

    constructor(public actionsheetCtrl: ActionSheetController, public global: SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public fb: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {
        this.harvestAuthForm = fb.group({
            'harvestedBunchCount': [null, Validators.compose([Validators.pattern('[0-9]*'), Validators.required])]
        });
        this.loadAuthForm = fb.group({
            'loadedBunchCount': [null, Validators.compose([Validators.required])],
            'driverSelect': [null, Validators.compose([Validators.required])],
            'vehicleSelect': [null, Validators.compose([Validators.required])]
        });
    
        var url: string;
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        url = constants.DREAMFACTORY_TABLE_URL + "/active_users_location_view?filter=user_GUID=" + this.UserGUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.locationFromDB = data["resource"];
        });         
    }

getHarvestedHistory(locationSelected: any) {  
      var url = constants.DREAMFACTORY_TABLE_URL + "/transact_harvest_view?filter=(location_name=" + locationSelected + ")AND(user_GUID=" + this.UserGUID +  ")&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
           this.harvestedHistoryData= data["resource"]
        });
}

getLoadedHistory(locationSelected: any) {  
      var url = constants.DREAMFACTORY_TABLE_URL + "/transact_loading_view?filter=(location_name=" + locationSelected + ")AND(user_GUID=" + this.UserGUID +  ")&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
           this.harvestedHistoryData= data["resource"]
        });
}

    getSummaryByLocation(locationSelected: any) {  
        //Todo: Inject into a global function
        var url = constants.DREAMFACTORY_TABLE_URL + "/harvested_count_loc_date_view?filter=(location_GUID=" + locationSelected + ")AND(user_GUID=" + this.UserGUID + ")AND(harvested_date=" + this.global.getStringDate() + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            var cloudData = data["resource"];
            if (cloudData.length == 0) {
                this.totalHarvested = "0"
            }
            else {
                this.totalHarvested = cloudData[0].total_bunches
            }
        });

        url = constants.DREAMFACTORY_TABLE_URL + "/loaded_count_loc_date_view?filter=(location_GUID=" + locationSelected + ")AND(user_GUID=" + this.UserGUID + ")AND(loaded_date=" + this.global.getStringDate() + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            var cloudData = data["resource"];
            if (cloudData.length == 0) {
                this.totalLoaded = "0"
            }
            else {
                this.totalLoaded = cloudData[0].total_bunches
            }
            this.balanceHarvested = (Number(this.totalHarvested) - Number(this.totalLoaded));
        });
    }

    getDataByLocation(locationSelected: any) {
        //Todo: Inject into a global function
        var url = constants.DREAMFACTORY_TABLE_URL +
            "/active_vehicle_location_view?filter=location_GUID=" + locationSelected + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.vehicleFromDB = data["resource"];
        });
        //Todo: Inject into a global function
        url = constants.DREAMFACTORY_TABLE_URL +
            "/active_driver_location_view?filter=location_GUID=" + locationSelected + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.driverFromDB = data["resource"];
        });
    }

    submitHarvestForm(value: any, location_GUID: string,location_name:string) {
        this.harvestModel.location_GUID = location_GUID;
        this.harvestModel.bunch_count = value.harvestedBunchCount;
        this.harvestModel.updated_ts = this.harvestModel.created_ts = this.global.getStringTimeStamp();
        this.harvestModel.user_GUID = this.harvestModel.createdby_GUID = this.harvestModel.updatedby_GUID = this.UserGUID;
        this.global.showConfirm('cloud', constants.DREAMFACTORY_TABLE_URL + '/transact_harvest', this.harvestModel.toJson(true));
    }

    submitLoadForm(value: any, location_GUID: string) {
        this.loadModel.location_GUID = location_GUID;
        this.loadModel.vehicle_GUID = value.vehicleSelect;
        this.loadModel.driver_GUID = value.driverSelect;
        this.loadModel.bunch_count = value.loadedBunchCount;
        this.loadModel.createdby_GUID = this.loadModel.updatedby_GUID = this.loadModel.user_GUID = this.UserGUID;
        this.loadModel.created_ts = this.loadModel.updated_ts = this.global.getStringTimeStamp();
        this.global.showConfirm('cloud', constants.DREAMFACTORY_TABLE_URL + '/transact_loading', this.loadModel.toJson(true));
    }

    onLink(url: string) {
        window.open(url);
    }
}









