import { Component } from '@angular/core';
import { NavController, NavParams,  ViewController, Platform, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { MainMenu } from "../../../providers/MainMenu/MainMenu";

@Component({
    selector: 'page-history',
    templateUrl: 'CountBunchesHistory.html'
})
export class CountBunchesHistoryPage {
    labelsFromStorage: any;
    countHistoryData: any;
    constructor(private mainMenu: MainMenu, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public http: Http, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
        // this.getLanguage();
        var url = "http://api.zen.com.my/api/v2/esawitdb/_table/transact_survey_view?api_key=b34c8b6e26a41f07dee48513714a534920f647cd48f299e9f28410a86d8a2cb4";
        this.http.get(url).map(res => res.json()).subscribe(data => {
            this.countHistoryData = data["resource"];

        });
    }

    // openGlobalMenu() {
    //     this.mainMenu.openMenu();
    // }
    itemSelected(item: string) {
        console.log("Selected Item", item);
    }
}


