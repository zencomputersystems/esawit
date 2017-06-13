import { Component } from '@angular/core';
import { NavController, NavParams,   Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
// import { MandorHomePage } from '../MandorHome/MandorHome';
// import { SettingsPage } from '../../Shared/Settings/Settings';
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';
import * as constants from '../../../config/constants';
import {SharedFunctions} from '../../../providers/Shared/Functions';
import {CountBunchesModel } from '../../../models/CountBunchesModel';

@Component({
    selector: 'page-CountBunches',
    templateUrl: 'CountBunches.html'
})
export class CountBunchesPage {
    locationListFromDb: any;
    labelsFromStorage: any;
    monthsFromStorage: any;
    currentYear: any;
        surveyModel: CountBunchesModel = new CountBunchesModel();
    UIDFromMobile: string;
    UserGUID: string;

    constructor(public actionsheetCtrl: ActionSheetController, private storage: Storage,public global:SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public _form: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {

 this.UIDFromMobile = "2";
        var loggedInUserFromDB: any;
        var url : string;
        url = constants.DREAMFACTORY_TABLE_URL + "/user_imei/" + this.UIDFromMobile + "?id_field=user_IMEI&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            loggedInUserFromDB = data;
            this.UserGUID = loggedInUserFromDB.user_GUID;
            console.log(this.UserGUID);
    });
        this.getMonths();
        this.currentYear = new Date().getFullYear();
        var url = constants.DREAMFACTORY_TABLE_URL+ "/master_location?api_key="+constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.locationListFromDb = data["resource"];
        });
    }

    getMonths() {
        var url = "assets/Surveyor/Months.json";
        console.log(url);
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.monthsFromStorage = data["MonthsList"];
        });
    }
    //     openGlobalMenu(){
    // this.mainMenu.openMenu();
    //     }

    onLink(url: string) {
        window.open(url);
    }

    submitCount(month:number,location:string,bunchCount:number) {
          this.surveyModel.location_GUID = location;
          this.surveyModel.user_GUID = this.UserGUID;
        this.surveyModel.bunch_count = bunchCount;
        this.surveyModel.month = month
        this.surveyModel.createdby_GUID = this.UserGUID;
        this.surveyModel.updated_ts = this.surveyModel.created_ts = this.global.getTimeStamp();
        this.surveyModel.updatedby_GUID = this.UserGUID;
                this.global.showConfirm(constants.DREAMFACTORY_TABLE_URL + '/transact_survey', this.surveyModel.toJson(true));

    }
}




