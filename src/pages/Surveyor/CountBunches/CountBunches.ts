import { Component } from '@angular/core';
import { App, NavController, NavParams, Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import * as constants from '../../../config/constants';
import { SharedFunctions } from '../../../providers/Shared/Functions';
import { CountBunchesModel } from '../../../models/CountBunchesModel';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { UnAuthorizedUserPage } from '../../Shared/UnAuthorizedUser/UnAuthorizedUser'

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
    ifConnect: Subscription;

    constructor(public appCntrl: App, private myCloud: StorageService, private network: Network, public actionsheetCtrl: ActionSheetController, private storage: Storage, public global: SharedFunctions,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public fb: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController, public translate: TranslateService, public translateService: TranslateService) {
        this.authForm = fb.group({
            'bunchCount': [null, Validators.compose([Validators.pattern('^(?!(0))[0-9]*'), Validators.required])],
            'monthSelect': [null, Validators.compose([Validators.required])],
            'locationSelect': [null, Validators.compose([Validators.required])],
        })
        this.UserGUID = localStorage.getItem('loggedIn_user_GUID');
        this.getMonths();
        this.currentYear = new Date().getFullYear();
    }

    // checkUser(){
    //     this.UIDFromMobile = localStorage.getItem("device_UUID");
    //     var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=user_IMEI=" + this.UIDFromMobile + "&api_key=" + constants.DREAMFACTORY_API_KEY;
    //     this.http.get(url).map(res => res.json()).subscribe(data => {
    //         var loggedInUserFromDB = data["resource"][0];            
    //         if (loggedInUserFromDB == null || loggedInUserFromDB.active == 2 || loggedInUserFromDB.active == 0) {
    //         return true
    //         }
    //         else {
    //            return false;
    //         }
    //     });
    // }

    SyncAndRefresh() {
        var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei?filter=user_IMEI=" + this.UIDFromMobile + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            var loggedInUserFromDB = data["resource"][0];
            if (loggedInUserFromDB == null || loggedInUserFromDB.active == 2 || loggedInUserFromDB.active == 0) {
                localStorage.setItem('isActive', null);
                this.appCntrl.getRootNav().setRoot(UnAuthorizedUserPage);
            }
            else {
                this.myCloud.saveSurveyToCloudFromSQLite();
                this.myCloud.syncHistoryCloudToSQLite();
            }
        });
        // if (this.checkUser()) {
        //     this.appCntrl.getRootNav().setRoot(UnAuthorizedUserPage);
        // }
        // else {
        //     this.myCloud.saveSurveyToCloudFromSQLite();
        //     this.myCloud.syncHistoryCloudToSQLite();
        // }
    }

    ionViewWillEnter() {
        this.UIDFromMobile = localStorage.getItem("device_UUID");        
        if (this.network.type != "none") {
            this.SyncAndRefresh();
        }
        this.ifConnect = this.network.onConnect().subscribe(data => {
            this.SyncAndRefresh();
        }, error => console.error(error));

        //-----------------------------------------Web Design Purpose------------------------------------
        this.locationListFromDb = this.myCloud.getUserLocationsFromSQLite();
        // 		var url = constants.DREAMFACTORY_TABLE_URL + "/active_users_location_view?filter=user_GUID=" + this.UserGUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        // 	 this.locationListFromDb = data["resource"];
        // });
        //-----------------------------------------Web Design Purpose------------------------------------

    }

    ionViewWillLeave() {
        this.ifConnect.unsubscribe();
    }

    getMonths() {
        var url = "assets/Surveyor/Months.json";
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.monthsFromStorage = data["MonthsList"];
            var month = (new Date().getMonth() + 1)
            var mark = 0;
            this.monthsFromStorage.forEach(function (item, index, object) {
                if (parseInt(item.value) < month) {
                    mark++;
                }
            }
            );
            this.monthsFromStorage.splice(0, mark);
        });
    }

    submitForm(value: any) {
        this.surveyModel.location_GUID = value.locationSelect;
        this.surveyModel.user_GUID = this.surveyModel.createdby_GUID = this.surveyModel.updatedby_GUID = this.UserGUID;
        this.surveyModel.bunch_count = value.bunchCount;
        this.surveyModel.month = value.monthSelect;
        this.surveyModel.year = this.currentYear;
        this.surveyModel.updated_ts = this.surveyModel.created_ts = this.global.getStringTimeStamp();
        if (this.network.type == "none") {
            this.global.showConfirm('sqlite', '1', this.surveyModel);
        }
        else {
            this.global.showConfirm('cloud', constants.DREAMFACTORY_TABLE_URL + '/transact_survey', this.surveyModel.toJson(true));
            this.myCloud.syncHistoryCloudToSQLite();
        }
        this.authForm.reset();
    }

}

