import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { MasterLocationModel } from '../../models/SQLiteSync/MasterLocation';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as constants from '../../config/constants';
import { Network } from '@ionic-native/network';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { CountBunchesModel } from '../../models/CountBunchesModel';
import { SurveyHistoryModel } from '../../models/SurveyHistoryModel';
import { App, Platform, ActionSheetController, ToastController, AlertController } from 'ionic-angular';

// Translation Service:
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

class ServerResponse {
	constructor(public resource: any) {
	}
}

@Injectable()
export class StorageService {
	data: any; successToast = this.translate.get("_SUCCESS_TOAST_LBL")["value"];
	failedToast = this.translate.get("_FAILED_TOAST_LBL")["value"];

	public masterLocationList: MasterLocationModel[] = [];
	constructor(public toastCtrl: ToastController, public translate: TranslateService, private sqlite: SQLite, private http: Http, private network: Network) {
	}


	//-------------------------Master Location data based on user_GUID-------------------------
	getLocationsFromSQLite() {
		// alert('Inside Get From Lite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from master_location', {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID });
					}
				}
			}, (err) => {
				// alert('Unable to execute sql: ' + JSON.stringify(err));
			});
		}).catch(e => alert("Error " + JSON.stringify(e)));
		return storageLocationItems;
	}

	syncMasterLocation(masterLocationList: MasterLocationModel[]) {
		// alert('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS master_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM master_location', null)).then(() => {
						// alert('Table Deleted');
						// alert('Locations Count' + masterLocationList.length);
						if (masterLocationList.length > 0) {
							masterLocationList.forEach(locationRec => {
								// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO master_location(id,location_GUID,location_name) VALUES(?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name])
									.then(() => {
										// alert('Record Inserted' + locationRec.location_name);	
										// locationRec.is_synced = 1;
										// this.updateRecord(constants.DREAMFACTORY_TABLE_URL + '/users_location?ids=' + locationRec.Id, locationRec);
									}
									).catch(e => console.log(e));
							});
						}
					}).catch(e => console.log(e));
		}).catch(e => alert("Error " + JSON.stringify(e)));
	}

	getLocationListFromCloud(userIMEI: string) {
		// alert('In cloud');
		var loggedInUserFromDB: any;
		var url = constants.DREAMFACTORY_TABLE_URL + "/user_imei/" + userIMEI + "?id_field=user_IMEI&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {

			loggedInUserFromDB = data;
			localStorage.setItem('loggedIn_user_GUID', loggedInUserFromDB.user_GUID);

			url = constants.DREAMFACTORY_TABLE_URL + "/active_users_location_view?filter=user_GUID=" + loggedInUserFromDB.user_GUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;

			this.http.get(url).map(res => res.json()).subscribe(data => {
				var locationListFromDb = data["resource"];
				locationListFromDb.forEach(element => {
					var masterLocation: MasterLocationModel = new MasterLocationModel();
					masterLocation.Id = element.h1;
					masterLocation.location_GUID = element.location_GUID;
					masterLocation.location_name = element.location_name;
					this.masterLocationList.push(masterLocation);
				});
				console.table(this.masterLocationList);
				return this.masterLocationList;

			});
		});
		console.table(this.masterLocationList);
		return this.masterLocationList;
	}
	//-------------------------Master Location data based on user_GUID-------------------------

	//--------------------------Surveyor Module------------------------------
	saveToSQLite(query: string, myModel: any) {
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS transact_survey(user_GUID TEXT,location_GUID TEXT,bunch_count INTEGER,year INTEGER,month INTEGER,created_ts  TEXT,createdby_GUID TEXT,updatedby_GUID TEXT,updated_ts TEXT)', {})
				.then(() =>
					// db.executeSql('DELETE FROM master_location', null)).then(() => {
					// alert('Table Deleted');
					// alert('Locations Count' + masterLocationList.length);
					// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);

					db.executeSql('INSERT INTO transact_survey(user_GUID,location_GUID,bunch_count,year,month,created_ts,createdby_GUID,updatedby_GUID,updated_ts) VALUES(?,?,?,?,?,?,?,?,?)', [myModel.user_GUID, myModel.location_GUID, myModel.bunch_count, myModel.year, myModel.month, myModel.created_ts, myModel.createdby_GUID, myModel.updatedby_GUID, myModel.updated_ts])
						.then(() => {
							alert('Record Inserted to SQLite' + myModel.bunch_count);
							// locationRec.is_synced = 1;
							// this.updateRecord(constants.DREAMFACTORY_TABLE_URL + '/users_location?ids=' + locationRec.Id, locationRec);
						}
						).catch(e => console.log(e)));
			// }).catch(e => console.log(e));
		}).catch(e => alert("Error " + JSON.stringify(e)));
	}

	saveSurveyToCloudFromSQLite() {
		alert('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_survey', {}).then((data) => {
				alert('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						alert('Record '+(i+1)+" :"+data.rows.item(i).bunch_count);
						var survey: CountBunchesModel = new CountBunchesModel();
						survey.user_GUID = data.rows.item(i).user_GUID;
						survey.location_GUID = data.rows.item(i).location_GUID;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.year = data.rows.item(i).year;
						survey.month = data.rows.item(i).month;
						survey.created_ts = data.rows.item(i).created_ts;
						survey.createdby_GUID = data.rows.item(i).createdby_GUID;
						survey.updatedby_GUID = data.rows.item(i).updatedby_GUID
						survey.updated_ts = data.rows.item(i).updated_ts;

						this.saveToCloud(constants.DREAMFACTORY_TABLE_URL + '/transact_survey', survey.toJson(true));
					}
				}
			}, (err) => {
				// alert('Unable to execute sql: ' + JSON.stringify(err));
			});
		}).catch(e => alert("Error " + JSON.stringify(e)));
	}

	syncSurveyHistory(SurveyHistoryList: SurveyHistoryModel[]) {
		// alert('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS survey_history(location_name TEXT,bunch_count  INTEGER,month INTEGER)', {})
				.then(() =>
					db.executeSql('DELETE FROM survey_history', null)).then(() => {
						// alert('Table Deleted');
						// alert('Locations Count' + masterLocationList.length);
						if (SurveyHistoryList.length > 0) {
							SurveyHistoryList.forEach(surveyRec => {
								// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO survey_history(location_name,bunch_count,month) VALUES(?,?,?)', [surveyRec.location_name, surveyRec.bunch_count, surveyRec.month])
									.then(() => {
										// alert('Record Inserted' + surveyRec.location_name);	
										// locationRec.is_synced = 1;
										// this.updateRecord(constants.DREAMFACTORY_TABLE_URL + '/users_location?ids=' + locationRec.Id, locationRec);
									}
									).catch(e => console.log(e));
							});
						}
					}).catch(e => console.log(e));
		}).catch(e => alert("Error " + JSON.stringify(e)));
	}

	getSurveyHistoryFromSQLite() {
		// alert('Inside Get From Lite Function');
		var surveyItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from survey_history', {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: SurveyHistoryModel = new SurveyHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.month = data.rows.item(i).month;
						surveyItems.push(survey);
					}
				}
			}, (err) => {
				// alert('Unable to execute sql: ' + JSON.stringify(err));
			});
		}).catch(e => alert("Error " + JSON.stringify(e)));
		return surveyItems;
	}
	//--------------------------Surveyor Module------------------------------

	saveToCloud(url: string, myModel: any) {
		alert('In Save Cloud');
			var queryHeaders = new Headers();
		queryHeaders.append('Content-Type', 'application/json');
		queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);
		let options = new RequestOptions({ headers: queryHeaders });
		alert(url);
		alert(myModel);
		this.http
			.post(url, myModel, options)
			.subscribe((response) => {
				 alert(response);
				this.showToast('bottom', this.successToast);
			}, (error) => {
				 alert(error);
				this.showToast('bottom', this.failedToast);
			});
	}

	showToast(position: string, tostMessage: string) {
		let toast = this.toastCtrl.create({
			message: tostMessage,
			duration: 2000,
			position: position
		});
		toast.present(toast);
	}


	//----------------------Obsolete Functions------------------------
	private storeToken(data) {
		localStorage.setItem('session_token', data.session_token);
	}
	GenerateToken() {
		// var queryHeaders = new Headers();
		// queryHeaders.append('Content-Type', 'application/json');
		// let options = new RequestOptions({ headers: queryHeaders });
		// var url = "http://api.zen.com.my/api/v2/user/session";
		// this.httpService.http.post(url, '{"email":"sampath415@gmail.com","password":"sampath415"}', options)
		// 	.subscribe((data) => { this.storeToken(data.json()); }, (error) => {
		// 		console.log('Error');
		// 	});
	}
	waste() {
		// save (user: MasterLocationModel) 
		// {
		// 	alert('Saving to Cloud');
		// 	var queryHeaders = new Headers();
		// 	queryHeaders.append('Content-Type', 'application/json');
		// 	queryHeaders.append('X-Dreamfactory-API-Key', "a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7");

		// 	let options = new RequestOptions({ headers: queryHeaders });		
		// 		return this.httpService.http.post('http://api.zen.com.my/api/v2/zenpoc/_table/user2/', user.toJson(true),options)
		// 		.map((data) => {
		// 			alert('Cloud Save Success');
		// 			return data;
		// 		});		
		// }
	}
	getLocationMasterFromCloud() {
		// alert('Getting Locations From Cloud. Inside Mediator');
		// let params = new URLSearchParams();
		// params.set('order', 'name+ASC');
		// this.query(params).subscribe((masterLocationsFromCloud: MasterLocationModel[]) => { this.masterLocationList = masterLocationsFromCloud });
		// // console.table(this.masterLocationList);
		// return this.masterLocationList;
	}
	query(params?: URLSearchParams): Observable<MasterLocationModel[]> {
		var url = constants.DREAMFACTORY_TABLE_URL + "/master_location?api_key=a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7";
		// alert('Getting Locations from Cloud. Inside Service :'+url);
		var queryHeaders = new Headers();
		queryHeaders.append('Content-Type', 'application/json');
		queryHeaders.append('X-Dreamfactory-Session-Token', localStorage.getItem('session_token'));
		queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);
		// alert('Getting From Cloud');
		return this.http
			.get(url)
			.map((response) => {
				var result: ServerResponse = response.json();
				let locationList: Array<MasterLocationModel> = [];
				result.resource.forEach((location) => {
					locationList.push(MasterLocationModel.fromJson(location));
				});
				return locationList;
			});
	}
	updateRecord(url: string, myModel: any) {
		// alert('in update with error ha');

		// var queryHeaders = new Headers();
		// queryHeaders.append('Content-Type', 'application/json');
		// queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);

		// let options = new RequestOptions({ headers: queryHeaders });

		// this.http
		// 	.patch(url, myModel.toJson(true), options)
		// 	.subscribe((response) => {
		// 		alert(response);
		// 		// this.navCtrl.push(HarvestedHistoryPage);

		// 	}, (error) => {
		// 		alert(error);
		// 	});
	}
	//----------------------Obsolete Functions-----------------------

}