import { Component } from '@angular/core';
import { NavController, NavParams,   Platform, AlertController, ActionSheetController, ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FormBuilder } from '@angular/forms';
import { HarvestBunchesModel } from '../../../models/HarvestBunches';
import { LoadBunchesModel } from '../../../models/LoadBunches';
import * as constants from '../../../config/constants';

@Component({
    selector: 'page-HarvestBunches',
    templateUrl: 'HarvestBunches.html'
})
export class HarvestBunchesPage {
    // today: number = Date.now();
    locationFromDB: any;
    vehicleFromDB: any;
    driverFromDB: any;
    loggedInUser: string;
    harvestModel: HarvestBunchesModel = new HarvestBunchesModel();
    loadModel: LoadBunchesModel = new LoadBunchesModel();
    constructor(public actionsheetCtrl: ActionSheetController,
        public platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController, public http: Http, public _form: FormBuilder, public navParams: NavParams, public alertCtrl: AlertController) {

        this.loggedInUser = "4b368185-49bc-11e7-bb9f-00155de7e742";
        var url = "http://api.zen.com.my/api/v2/esawitdb/_table/active_users_location_view?filter=user_GUID=" + this.loggedInUser + "&api_key=b34c8b6e26a41f07dee48513714a534920f647cd48f299e9f28410a86d8a2cb4";
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.locationFromDB = data["resource"];
            // console.table(this.locationFromDB);
        });

         url = "http://api.zen.com.my/api/v2/esawitdb/_table/master_vehicle?api_key=b34c8b6e26a41f07dee48513714a534920f647cd48f299e9f28410a86d8a2cb4";
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.vehicleFromDB = data["resource"];
        });

         url = "http://api.zen.com.my/api/v2/esawitdb/_table/master_driver?api_key=b34c8b6e26a41f07dee48513714a534920f647cd48f299e9f28410a86d8a2cb4";
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.driverFromDB = data["resource"];
        });
    }

    loadBunches(selectedLocation: string, selectedVehicle: string, selectedDriver, loadedCount: number) {
        this.loadModel.location_GUID = selectedLocation;
        this.loadModel.vehicle_GUID = selectedVehicle;
        this.loadModel.driver_GUID = selectedDriver;
        this.loadModel.user_GUID = selectedDriver;
        this.loadModel.bunch_count = loadedCount;
        this.showConfirm('http://api.zen.com.my/api/v2/esawitdb/_table/transact_loading', this.loadModel.toJson(true));
    }
    onLocationSelect(selectedLocation: string) {
    }

    submitCount(location: string, bunch_count: number) {
        this.harvestModel.location_GUID = location;
        this.harvestModel.bunch_count = bunch_count;
        var myDate = new Date();
        this.harvestModel.createdby_GUID = "ssh";
        this.harvestModel.updated_ts=     this.harvestModel.created_ts = new Date(myDate.getUTCFullYear(),myDate.getUTCMonth(),myDate.getUTCDate(),myDate.getUTCHours(),myDate.getUTCMinutes(),myDate.getSeconds());
        // this.harvestModel.updated_ts=     this.harvestModel.created_ts = new Date(myDate.getFullYear(),myDate.getMonth(),myDate.getDate(),myDate.getHours(),myDate.getMinutes(),myDate.getSeconds());
        this.harvestModel.updatedby_GUID = "ssh";
        this.showConfirm('http://api.zen.com.my/api/v2/esawitdb/_table/transact_harvest', this.harvestModel.toJson(true));

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

    showConfirm(url: string, myModel: any) {
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

                        var queryHeaders = new Headers();
                        queryHeaders.append('Content-Type', 'application/json');
                        queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);

                        let options = new RequestOptions({ headers: queryHeaders });

                        this.http
                            .post(url, myModel, options)
                            .subscribe((response) => {
                                console.log(response);
                                this.showToast('bottom', 'New Record Successfully Added');
                                // this.navCtrl.push(HarvestedHistoryPage);

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

   
    //     openGlobalMenu(){
    // this.mainMenu.openMenu();
    //     }



    onLink(url: string) {
        window.open(url);
    }


}




