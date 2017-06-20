import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http, Headers, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import * as constants from '../../../config/constants';

// import { MainMenu } from "../../../providers/MainMenu";

@Component({
    selector: 'page-history',
    templateUrl: 'AcceptedBunchesHistory.html'
})
export class AcceptedBunchesHistoryPage {
    labelsFromStorage: any;UserGUID:any;
    acceptedBunchesHistoryData: any;
    //  private mainMenu: MainMenu,
    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
               this.UserGUID = localStorage.getItem('loggedIn_user_GUID');

         var     url = constants.DREAMFACTORY_TABLE_URL + "/transact_unloading_view?filter=user_GUID=" + this.UserGUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;

        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.acceptedBunchesHistoryData = data["resource"];
        });


        // var url = constants.DREAMFACTORY_TABLE_URL+ "/transact_unloading?api_key="+constants.DREAMFACTORY_API_KEY;
        // this.http.get(url).map(res => res.json()).subscribe(data => {
        //     this.acceptedBunchesHistoryData = data["resource"];
        // });
    }

    // openGlobalMenu() {
    //     this.mainMenu.openMenu();
    // }

    itemSelected(item: string) {
        console.log("Selected Item", item);
    }
}


