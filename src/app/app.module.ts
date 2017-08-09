import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from "@ionic/storage";
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';

import { MandorHomePage } from '../pages/Mandor/MandorHome/MandorHome';
import { HarvestBunchesPage } from '../pages/Mandor/HarvestBunches/HarvestBunches';

import {UnAuthorizedUserPage} from '../pages/Shared/UnAuthorizedUser/UnAuthorizedUser'

import { CountBunchesPage } from '../pages/Surveyor/CountBunches/CountBunches';
import { CountBunchesHistoryPage } from '../pages/Surveyor/CountBunchesHistory/CountBunchesHistory';
import { SurveyorHomePage } from '../pages/Surveyor/SurveyorHome/SurveyorHome';

import { AcceptBunchesPage } from '../pages/Factory/AcceptBunches/AcceptBunches';
import { AcceptedBunchesHistoryPage } from '../pages/Factory/AcceptedBunchesHistory/AcceptedBunchesHistory';
import { FactoryHomePage } from '../pages/Factory/FactoryHome/FactoryHome';


import { MyApp } from './app.component';
import { SharedFunctions } from "../providers/Shared/Functions";
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    MyApp,
    MandorHomePage,  HarvestBunchesPage,
   UnAuthorizedUserPage,
    SurveyorHomePage, CountBunchesPage, CountBunchesHistoryPage,
    AcceptBunchesPage, AcceptedBunchesHistoryPage, FactoryHomePage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MandorHomePage,  HarvestBunchesPage,
   UnAuthorizedUserPage,
    SurveyorHomePage, CountBunchesPage, CountBunchesHistoryPage,
    AcceptBunchesPage, AcceptedBunchesHistoryPage, FactoryHomePage
  ],
  providers: [
    SQLite,
    StatusBar,
    SplashScreen, Network,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    SharedFunctions
  ]
})
export class AppModule { }
export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}