import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AcceptedBunchesHistoryPage } from '../AcceptedBunchesHistory/AcceptedBunchesHistory';
import { Observable } from 'rxjs/Observable';
import * as constants from '../../../config/constants';
import {AcceptBunchesModel } from '../../../models/AcceptBunchesModel';
import {SharedFunctions} from '../../../providers/Shared/Functions';

@Component({
    selector: 'page-AcceptBunches',
    templateUrl: 'AcceptBunches.html'
})
export class AcceptBunchesPage {

    locationFromDb: any;
    vehicleFromDb: any;
    driverFromDb: any;
    UIDFromMobile: string;
    UserGUID: string;
        factoryModel: AcceptBunchesModel = new AcceptBunchesModel();

    constructor(public actionsheetCtrl: ActionSheetController,public global:SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public _form: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {
 this.UIDFromMobile = "3";
        var loggedInUserFromDB: any;
        var url : string;
        url = constants.DREAMFACTORY_TABLE_URL + "/user_imei/" + this.UIDFromMobile + "?id_field=user_IMEI&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            loggedInUserFromDB = data;
            this.UserGUID = loggedInUserFromDB.user_GUID;
            console.log(this.UserGUID);
    });

        //Todo: Inject into a global function
        var url = constants.DREAMFACTORY_TABLE_URL+ "/master_location?api_key="+constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.locationFromDb = data["resource"];
        });

    }

    onLocationSelect(locationSelected: any) {

        //Todo: Inject into a global function
        var url = constants.DREAMFACTORY_TABLE_URL+ "/active_vehicle_location_view?filter=location_GUID=" + locationSelected + "&api_key="+constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.vehicleFromDb = data["resource"];
        });
        //Todo: Inject into a global function
        url = constants.DREAMFACTORY_TABLE_URL+ "/active_driver_location_view?filter=location_GUID=" + locationSelected + "&api_key="+constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.driverFromDb = data["resource"];
        });
    }

    //     openGlobalMenu(){
    // this.mainMenu.openMenu();
    //     }


    onLink(url: string) {
        window.open(url);
    }


    submitCount(location:string,vehicle:string,driver:string,bunchCount:number) {
         this.factoryModel.loading_location_GUID = location;
         this.factoryModel.vehicle_GUID = vehicle;
         this.factoryModel.driver_GUID = driver;
          this.factoryModel.user_GUID = this.UserGUID;
        this.factoryModel.bunch_count = bunchCount;
        this.factoryModel.createdby_GUID = this.UserGUID;
        this.factoryModel.updated_ts = this.factoryModel.created_ts = this.global.getTimeStamp();
        this.factoryModel.updatedby_GUID = this.UserGUID;
                this.global.showConfirm(constants.DREAMFACTORY_TABLE_URL + '/transact_unloading', this.factoryModel.toJson(true));
    }

  
}




