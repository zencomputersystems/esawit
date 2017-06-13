import { Component } from '@angular/core';
import { NavController, NavParams,  ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
// import { MainMenu } from "../../../providers/MainMenu";
import * as constants from '../../../config/constants';

@Component({
    selector: 'page-history',
    templateUrl: 'HarvestedHistory.html'
})
export class HarvestedHistoryPage {
    labelsFromStorage: any;
    harvestedHistoryData: any;
    // private storage: Storage, private mainMenu: MainMenu,
    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
        var url = constants.DREAMFACTORY_TABLE_URL+ "/transact_harvest_view?api_key="+constants.DREAMFACTORY_API_KEY;
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.harvestedHistoryData = data["resource"];

        });
    }

    // openGlobalMenu() {
    //     this.mainMenu.openMenu();
    // }


    itemSelected(item: string) {
        console.log("Selected Item", item);
    }
}


