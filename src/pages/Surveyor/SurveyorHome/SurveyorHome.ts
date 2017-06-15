import { Component } from '@angular/core';
import { NavController, Platform, ActionSheetController } from 'ionic-angular';
import { CountBunchesPage } from '../CountBunches/CountBunches';
import { CountBunchesHistoryPage } from '../CountBunchesHistory/CountBunchesHistory';
import { SharedFunctions } from '../../../providers/Shared/Functions';

@Component({
    selector: 'page-home',
    templateUrl: 'SurveyorHome.html'
})
export class SurveyorHomePage {
    constructor(public navCtrl: NavController, public platform: Platform, public actionsheetCtrl: ActionSheetController) {

    }

    onLink(url: string) {
        window.open(url);
    }

    public NewCount() {
        this.navCtrl.push(CountBunchesPage, {});

    }
    public GetCountHistory() {
        this.navCtrl.push(CountBunchesHistoryPage, {});

    }
}
