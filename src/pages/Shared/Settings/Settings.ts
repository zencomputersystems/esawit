import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
// import {MainMenu} from "../../providers/MainMenu";

@Component({
  selector: 'page-Settings',
  templateUrl: 'Settings.html'
})
export class SettingsPage {
  items: any;
  // private mainMenu:MainMenu,
  constructor(public actionsheetCtrl: ActionSheetController, public alertCtrl: AlertController, public http: Http, private storage: Storage, public navCtrl: NavController, public navParams: NavParams) {
    var url = "assets/Languages/LanguagesList.json";
    this.http.get(url).map(res => res.json()).subscribe(data => {
      this.items = data["LanguagesList"];
    });
  }
  //   openGlobalMenu(){
  // this.mainMenu.openMenu();
  //     }


  onSelectChange(languageSelect) {
    this.setLanguage(languageSelect);
  }

  setLanguage(lang) {
    this.storage.set('language', lang);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

}
