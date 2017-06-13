import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { CountBunchesPage } from '../CountBunches/CountBunches';
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';
import { MainMenu } from "../../../providers/MainMenu/MainMenu";

@Component({
    selector: 'page-home',
    templateUrl: 'SurveyorHome.html'
})
export class SurveyorHomePage {
    // private mainMenu: MainMenu, 
    constructor(public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController) {

    }

    onLink(url: string) {
        window.open(url);
    }
    // openSurveyorMenu() {
    //     this.mainMenu.openSurveyorMenu();
    // }

    public NewCount() {
        // this.navCtrl.setRoot(CountBunchesPage);
        this.navCtrl.push(CountBunchesPage, {});

    }
    public GetCountHistory() {
        // this.navCtrl.setRoot(CountBunchesHistoryPage);
        this.navCtrl.push(CountBunchesHistoryPage, {});

    }
}
