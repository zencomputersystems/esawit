import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-UnAuthorizedUser',
  templateUrl: 'UnAuthorizedUser.html',
})
export class UnAuthorizedUserPage {
device_UUID : string;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
this.device_UUID = localStorage.getItem('device_UUID');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UnauthorizedUserPage');
  }

}
