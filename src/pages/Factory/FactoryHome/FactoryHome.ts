import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { AcceptBunchesPage } from '../AcceptBunches/AcceptBunches';
import { AcceptedBunchesHistoryPage } from '../AcceptedBunchesHistory/AcceptedBunchesHistory';
// import { MainMenu } from "../../../providers/MainMenu";

@Component({
    selector: 'page-home',
    templateUrl: 'FactoryHome.html'
})
export class FactoryHomePage {
    // private mainMenu: MainMenu, 
    constructor(public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController) {

    }

    onLink(url: string) {
        window.open(url);
    }
    // openGlobalMenu() {
    //     this.mainMenu.openMenu();
    // }

    public NewAcceptance() {
        this.navCtrl.push(AcceptBunchesPage, {});
    }
    public GetHistory() {
        this.navCtrl.push(AcceptedBunchesHistoryPage, {});
    }
}
