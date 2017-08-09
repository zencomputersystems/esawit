import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as constants from '../../../config/constants';
import { AcceptBunchesModel } from '../../../models/AcceptBunchesModel';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'page-AcceptBunches',
    templateUrl: 'AcceptBunches.html'
})
export class AcceptBunchesPage {
    ifConnect: Subscription;
    authForm: FormGroup;
    locationFromDb: any;
    vehicleFromDb: any;
    driverFromDb: any;
    UIDFromMobile: string;
    UserGUID: string;
    factoryModel: AcceptBunchesModel = new AcceptBunchesModel();
    locationListFromDb: any;

    constructor(private myCloud: StorageService, private network: Network, public actionsheetCtrl: ActionSheetController, public global: SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public fb: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController, public translate: TranslateService, public translateService: TranslateService) {
        // this.translateToEnglish();

        if (this.network.type != "none") {
            this.myCloud.saveUnloadToCloudFromSQLite();
            this.myCloud.syncUnloadHistoryCloudToSQLite();
        }
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        this.authForm = fb.group({
            'bunchCount': [null, Validators.compose([Validators.pattern('^(?!(0))[0-9]*'), Validators.required])],
            'driverSelect': [null, Validators.compose([Validators.required])],
            'vehicleSelect': [null, Validators.compose([Validators.required])],
            'locationSelect': [null, Validators.compose([Validators.required])],
        })
        //-----------------------------------------Web Design Purpose------------------------------------
        this.locationFromDb = this.myCloud.getSQLiteMasterLocations();
        // var url = constants.DREAMFACTORY_TABLE_URL + "/master_location?api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.locationFromDb = data["resource"];
        // });
        //-----------------------------------------Web Design Purpose------------------------------------
    }

    syncAndRefresh() {
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

    ionViewWillEnter() {
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

    submitForm(value: any) {
        this.factoryModel.loading_location_GUID = value.locationSelect;
        this.factoryModel.vehicle_GUID = value.vehicleSelect;
        this.factoryModel.driver_GUID = value.driverSelect;
        this.factoryModel.user_GUID = this.factoryModel.createdby_GUID = this.factoryModel.updatedby_GUID = this.UserGUID;
        this.factoryModel.bunch_count = value.bunchCount;
        this.factoryModel.updated_ts = this.factoryModel.created_ts = this.global.getStringTimeStamp();
        if (this.network.type == "none") {
            this.global.showConfirm('sqlite', '4', this.factoryModel);
        }
        else {
            this.global.showConfirm('cloud', constants.DREAMFACTORY_TABLE_URL + '/transact_unloading', this.factoryModel.toJson(true));
            this.myCloud.syncUnloadHistoryCloudToSQLite();
        }
        this.authForm.reset();

    }

    onLocationSelect(locationSelected: string) {
        //-----------------------------------------Web Design Purpose------------------------------------
        this.vehicleFromDb = this.myCloud.getVehicleLocationsFromSQLite(locationSelected);
        // this.driverFromDb = this.myCloud.getDriverLocationsFromSQLite(locationSelected);

        // var url = constants.DREAMFACTORY_TABLE_URL + "/active_vehicle_location_view?filter=location_GUID=" + locationSelected + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.vehicleFromDb = data["resource"];
        // });
        // url = constants.DREAMFACTORY_TABLE_URL + "/active_driver_location_view?filter=location_GUID=" + locationSelected + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.driverFromDb = data["resource"];
        // });
        //-----------------------------------------Web Design Purpose------------------------------------
    }

    onVehicleSelect(vehicleSelected: string) {
        this.driverFromDb = this.myCloud.getVehicleDriverFromSQLite(vehicleSelected);

    }

    //---------------------Language module start---------------------//
    // public translateToEnglishClicked: boolean = false;
    // public translateToMalayClicked: boolean = true;

    // public translateToEnglish() {
    //     this.translateService.use('en');
    //     this.translateToMalayClicked = !this.translateToMalayClicked;
    //     this.translateToEnglishClicked = !this.translateToEnglishClicked;
    // }

    // public translateToMalay() {
    //     this.translateService.use('ms');
    //     this.translateToEnglishClicked = !this.translateToEnglishClicked;
    //     this.translateToMalayClicked = !this.translateToMalayClicked;
    // }
    //---------------------Language module end---------------------//
}




