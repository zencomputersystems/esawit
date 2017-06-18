import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
// import { MandorHomePage } from '../MandorHome/MandorHome';
// import { SettingsPage } from '../../Shared/Settings/Settings';
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';
import * as constants from '../../../config/constants';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { CountBunchesModel } from '../../../models/CountBunchesModel';
import { StorageService } from '../../../providers/Db/StorageFunctions';

@Component({
    selector: 'page-CountBunches',
    templateUrl: 'CountBunches.html'
})
export class CountBunchesPage {
    authForm: FormGroup;
    locationListFromDb: any;
    monthsFromStorage: any;
    currentYear: number;
    surveyModel: CountBunchesModel = new CountBunchesModel();
    UIDFromMobile: string;
    UserGUID: string;
    constructor(private myCloud: StorageService, public actionsheetCtrl: ActionSheetController, private storage: Storage, public global: SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public fb: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {

        this.authForm = fb.group({
            'bunchCount': [null, Validators.compose([Validators.required])],
            'monthSelect': [null, Validators.compose([Validators.required])],
            'locationSelect': [null, Validators.compose([Validators.required])],
        })
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        // console.log(this.UserGUID);
        this.locationListFromDb = this.myCloud.getLocationsFromSQLite();
        this.getMonths();
        this.currentYear = new Date().getFullYear();
    }

    getMonths() {
        var url = "assets/Surveyor/Months.json";
        console.log(url);
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.monthsFromStorage = data["MonthsList"];
        });
    }

    onLink(url: string) {
        window.open(url);
    }

    submitForm(value: any) {
        // console.log(value);
        this.surveyModel.location_GUID = value.locationSelect;
        this.surveyModel.user_GUID = this.surveyModel.createdby_GUID = this.surveyModel.updatedby_GUID = this.UserGUID;
        this.surveyModel.bunch_count = value.bunchCount;
        this.surveyModel.month = value.monthSelect;
        this.surveyModel.year = this.currentYear;
        this.surveyModel.updated_ts = this.surveyModel.created_ts = this.global.getStringTimeStamp();
        this.global.showConfirm('sqlite','n', this.surveyModel);
        this.myCloud.saveSurveyToCloudFromSQLite();
        //  this.global.showConfirm('cloud',constants.DREAMFACTORY_TABLE_URL + '/transact_survey', this.surveyModel.toJson(true));

    }



}




