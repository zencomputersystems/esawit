import { Component } from '@angular/core';
import { NavController, NavParams,   Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
// import { MandorHomePage } from '../MandorHome/MandorHome';
// import { SettingsPage } from '../../Shared/Settings/Settings';
// import { MainMenu } from "../../../providers/MainMenu";
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';

@Component({
    selector: 'page-CountBunches',
    templateUrl: 'CountBunches.html'
})
export class CountBunchesPage {
    locationListFromDb: any;
    AddTransaction: FormGroup;
    labelsFromStorage: any;
    monthsFromStorage: any;
    currentYear: any;
    // private mainMenu:MainMenu,
    constructor(public actionsheetCtrl: ActionSheetController, private storage: Storage,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public _form: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {
        //    this.getLanguage();
        this.getMonths();
        this.currentYear = new Date().getFullYear();
        var url = "http://api.zen.com.my/api/v2/esawitdb/_table/master_location?api_key=b34c8b6e26a41f07dee48513714a534920f647cd48f299e9f28410a86d8a2cb4";
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.locationListFromDb = data["resource"];
        });

        this.AddTransaction = this._form.group({
            "month": ["", Validators.required],
            "location_GUID": ["", Validators.required],
            "bunch_count": ["", Validators.required]

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


    submitCount() {
        var queryHeaders = new Headers();
        queryHeaders.append('Content-Type', 'application/json');
        let options = new RequestOptions({ headers: queryHeaders });
        this.showConfirm();
    }
    showConfirm() {
        let confirm = this.alertCtrl.create({
            title: 'Create New Count?',
            message: 'Do you really want to add new count with given values?',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.http
                            .post('http://api.zen.com.my/api/v2/esawitdb/_table/transact_survey?api_key=b34c8b6e26a41f07dee48513714a534920f647cd48f299e9f28410a86d8a2cb4', Array.of(this.AddTransaction.value))
                            .subscribe((response) => {
                                this.showToast('bottom', 'New Record Successfully Added');
                                this.navCtrl.push(CountBunchesHistoryPage);

                            }, (error) => {
                                this.showToast('bottom', 'Failed to Submit');
                            });
                    }
                }
            ]
        });
        confirm.present();
    }

    showToast(position: string, tostMessage: string) {
        let toast = this.toastCtrl.create({
            message: tostMessage,
            duration: 2000,
            position: position
        });

        toast.present(toast);
    }
}




