import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder } from '@angular/forms';
import { HarvestBunchesModel } from '../../../models/HarvestBunchesModel';
import { LoadBunchesModel } from '../../../models/LoadBunchesModel';
import * as constants from '../../../config/constants';
import {SharedFunctions} from '../../../providers/Shared/Functions';

@Component({
    selector: 'page-HarvestBunches',
    templateUrl: 'HarvestBunches.html'
})
export class HarvestBunchesPage {
    // today: number = Date.now();

    locationFromDB: any;
    vehicleFromDB: any;
    driverFromDB: any;
    UserGUID: string;
    UIDFromMobile: string;
    harvestModel: HarvestBunchesModel = new HarvestBunchesModel();
    loadModel: LoadBunchesModel = new LoadBunchesModel();

    constructor(public actionsheetCtrl: ActionSheetController, public global: SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public _form: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {
        this.UIDFromMobile = "1";
        var loggedInUserFromDB: any;
        var url : string;

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

    loadBunches(selectedLocation: string, selectedVehicle: string, selectedDriver, loadedCount: number) {
        this.loadModel.location_GUID = selectedLocation;
        this.loadModel.vehicle_GUID = selectedVehicle;
        this.loadModel.driver_GUID = selectedDriver;
        this.loadModel.user_GUID = this.UserGUID;
        console.log(this.UserGUID);
        this.loadModel.bunch_count = loadedCount;
        this.loadModel.createdby_GUID = this.loadModel.updatedby_GUID = this.UserGUID;
        this.loadModel.created_ts = this.loadModel.updated_ts = this.global.getTimeStamp();
        this.global.showConfirm(constants.DREAMFACTORY_TABLE_URL + '/transact_loading', this.loadModel.toJson(true));
   
 }

    onLocationSelect(selectedLocation: string) {
    }



    submitCount(location: string, bunch_count: number) {
        this.harvestModel.location_GUID = location;
        this.harvestModel.bunch_count = bunch_count;
        this.harvestModel.createdby_GUID = this.UserGUID;
        this.harvestModel.updated_ts = this.harvestModel.created_ts = this.global.getTimeStamp();
        // this.harvestModel.updated_ts=     this.harvestModel.created_ts = new Date(myDate.getFullYear(),myDate.getMonth(),myDate.getDate(),myDate.getHours(),myDate.getMinutes(),myDate.getSeconds());
        this.harvestModel.updatedby_GUID = this.UserGUID;
        this.global.showConfirm(constants.DREAMFACTORY_TABLE_URL + '/transact_harvest', this.harvestModel.toJson(true));

        // let options = {
        //     year: 'numeric', month: 'numeric', day: 'numeric',
        //     hour: 'numeric', minute: 'numeric', second: 'numeric',
        //     hour12: false
        // };
        // this.harvestModel.updated_ts = 
        // this.harvestModel.created_ts = new Date(new Date().toLocaleDateString("en-GB", options));
        // console.log(myDate.getDate()+"/"+myDate.getMonth()+"/"+myDate.getFullYear()+" "+myDate.getHours()+":"+myDate.getMinutes()+":"+myDate.getSeconds());
        //    new Date(myDate.getFullYear(),myDate.getMonth(),myDate.getDate(),myDate.getHours(),myDate.getMinutes(),myDate.getSeconds());
        // this.harvestModel.updated_ts = new Date(myDate.getFullYear(),myDate.getMonth(),myDate.getDate(),myDate.getUTCHours(),myDate.getMinutes(),myDate.getSeconds());
        // myDate.getDate()+"/"+myDate.getMonth()+"/"+myDate.getFullYear()+" "+myDate.getHours()+":"+myDate.getMinutes()+":"+myDate.getSeconds();
        // var queryHeaders = new Headers();
        // queryHeaders.append('Content-Type', 'application/json');
        // let options = new RequestOptions({ headers: queryHeaders });
        // console.log(location);
    }

    //     openGlobalMenu(){
    // this.mainMenu.openMenu();
    //     }



    onLink(url: string) {
        window.open(url);
    }


}




