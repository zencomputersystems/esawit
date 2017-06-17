import { Component } from '@angular/core';

import { NavController, NavParams, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';

import { Http, Headers, RequestOptions } from '@angular/http';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HarvestBunchesModel } from '../../../models/HarvestBunchesModel';

import { LoadBunchesModel } from '../../../models/LoadBunchesModel';

import * as constants from '../../../config/constants';

import { SharedFunctions } from '../../../providers/Shared/Functions';



@Component({

    selector: 'page-HarvestBunches',

    templateUrl: 'HarvestBunches.html'

})

export class HarvestBunchesPage {

    harvestAuthForm: FormGroup;

    loadAuthForm: FormGroup;

    locationFromDB: any;

    vehicleFromDB: any;

    driverFromDB: any;

    UserGUID: string;

    UIDFromMobile: string;

    harvestModel: HarvestBunchesModel = new HarvestBunchesModel();

    loadModel: LoadBunchesModel = new LoadBunchesModel();



    constructor(public actionsheetCtrl: ActionSheetController, public global: SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public fb: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {
        this.harvestAuthForm = fb.group({
            'harvestedBunchCount': [null, Validators.compose([Validators.required])]
        });

        this.loadAuthForm = fb.group({
            'loadedBunchCount': [null, Validators.compose([Validators.required])],
            'driverSelect': [null, Validators.compose([Validators.required])],
            'vehicleSelect': [null, Validators.compose([Validators.required])]
        });

        this.UIDFromMobile = "1";
        var loggedInUserFromDB: any;
        var url: string;

        url = constants.DREAMFACTORY_TABLE_URL + "/user_imei/" + this.UIDFromMobile + "?id_field=user_IMEI&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            loggedInUserFromDB = data;
            this.UserGUID = loggedInUserFromDB.user_GUID;
            url = constants.DREAMFACTORY_TABLE_URL + "/active_users_location_view?filter=user_GUID=" + this.UserGUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;
            this.http.get(url).map(res => res.json()).subscribe(data => {
                this.locationFromDB = data["resource"];
            });

        });



        url = constants.DREAMFACTORY_TABLE_URL + "/master_vehicle?api_key=" + constants.DREAMFACTORY_API_KEY;

        this.http.get(url).map(res => res.json()).subscribe(data => {

            this.vehicleFromDB = data["resource"];

        });



        url = constants.DREAMFACTORY_TABLE_URL + "/master_driver?api_key=" + constants.DREAMFACTORY_API_KEY;

        this.http.get(url).map(res => res.json()).subscribe(data => {

            this.driverFromDB = data["resource"];

        });

    }



    submitLoadForm(value: any, location_GUID: string) {

        this.loadModel.location_GUID = location_GUID;

        this.loadModel.vehicle_GUID = value.vehicleSelect;

        this.loadModel.driver_GUID = value.driverSelect;

        this.loadModel.bunch_count = value.loadedBunchCount;

        this.loadModel.createdby_GUID = this.loadModel.updatedby_GUID = this.loadModel.user_GUID = this.UserGUID;

        this.loadModel.created_ts = this.loadModel.updated_ts = this.global.getTimeStamp();

        this.global.showConfirm(constants.DREAMFACTORY_TABLE_URL + '/transact_loading', this.loadModel.toJson(true));

        console.log("---------------------loadBunches Log BEGIN--------------------");

        console.log(this.loadModel.toJson(true));

        console.log("---------------------loadBunches Log END--------------------");

    }



    submitHarvestForm(value: any, location_GUID: string) {

        this.harvestModel.location_GUID = location_GUID;

        this.harvestModel.bunch_count = value.harvestedBunchCount;

        this.harvestModel.updated_ts = this.harvestModel.created_ts = this.global.getTimeStamp();

        this.harvestModel.user_GUID = this.harvestModel.createdby_GUID = this.harvestModel.updatedby_GUID = this.UserGUID;

        this.global.showConfirm(constants.DREAMFACTORY_TABLE_URL + '/transact_harvest', this.harvestModel.toJson(true));



        console.log("---------------begin log--------------");

        console.log("this.global.getTimeStamp: " + this.global.getTimeStamp());

        console.log("this.harvestModel.updated_ts: " + this.harvestModel.updated_ts);

        console.log("JSON:");

        console.log(this.harvestModel.toJson(true));

        console.log("---------------end log ---------------");





    }



    onLink(url: string) {

        window.open(url);

    }





}









