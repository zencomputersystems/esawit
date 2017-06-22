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
import { DriverLocationModel } from '../../models/DriverLocationModel';
import { HarvestBunchesModel } from '../../models/HarvestBunchesModel';
import { VehicleLocationModel } from '../../models/VehicleLocationModel';
import { HarvestHistoryModel } from '../../models/HarvestHistoryModel';
import { LoadBunchesModel } from '../../models/LoadBunchesModel';
import { LoadHistoryModel } from '../../models/LoadHistoryModel';

import { App, Platform, ActionSheetController, ToastController, AlertController } from 'ionic-angular';
import { AcceptBunchesModel } from '../../models/AcceptBunchesModel';
import { FactoryHistoryModel } from '../../models/FactoryHistoryModel';
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
	data: any;
	successToast = this.translate.get("_SUCCESS_TOAST_LBL")["value"];
	failedToast = this.translate.get("_FAILED_TOAST_LBL")["value"];
	module: any;
	public masterLocationList: MasterLocationModel[] = [];
	constructor(public toastCtrl: ToastController, public translate: TranslateService, private sqlite: SQLite, private http: Http, private network: Network) {
	}


	//-------------------------Master  data------------------------
	getUserLocationsFromSQLite() {
		alert('Inside getUserLocationsFromSQLite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from user_location', {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID });
					}
				}
			}, (err) => {
				alert('getUserLocationsFromSQLite :' + JSON.stringify(err));
			});
		}).catch(e => alert("getUserLocationsFromSQLite :" + JSON.stringify(e)));
		return storageLocationItems;
	}

	// syncUserLocationToSQLite(masterLocationList: MasterLocationModel[]) {
	// 	alert('In syncUserLocationToSQLite Function');
	// 	this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
	// 		db.executeSql('CREATE TABLE IF NOT EXISTS user_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT)', {})
	// 			.then(() =>
	// 				db.executeSql('DELETE FROM user_location', null)).then(() => {
	// 					// alert('Table Deleted');
	// 					// alert('Locations Count' + masterLocationList.length);
	// 					if (masterLocationList.length > 0) {
	// 						masterLocationList.forEach(locationRec => {
	// 							// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
	// 							db.executeSql('INSERT INTO user_location(id,location_GUID,location_name) VALUES(?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name])
	// 								.then(() => {
	// 									// alert('Record Inserted' + locationRec.location_name);	
	// 								}).catch(e => alert('syncUserLocationToSQLite :' + JSON.stringify(e)));
	// 						});
	// 					}
	// 				}).catch(e => alert('syncUserLocationToSQLite :' + JSON.stringify(e)));
	// 	}).catch(e => alert('syncUserLocationToSQLite :' + JSON.stringify(e)));
	// }

	getUserLocationListFromCloud() {
		var UserGUID = localStorage.getItem('loggedIn_user_GUID');
		alert('getUserLocationListFromCloud Entered')
		var url = constants.DREAMFACTORY_TABLE_URL + "/active_users_location_view?filter=user_GUID=" + UserGUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;

		this.http.get(url).map(res => res.json()).subscribe(data => {
			var locationListFromDb = data["resource"];
			locationListFromDb.forEach(element => {
				var masterLocation: MasterLocationModel = new MasterLocationModel();
				masterLocation.Id = element.h1;
				masterLocation.location_GUID = element.location_GUID;
				masterLocation.location_name = element.location_name;
				this.masterLocationList.push(masterLocation);
			});
			alert(' syncUserLocationToSQLite Begins Here ');
			this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
				db.executeSql('CREATE TABLE IF NOT EXISTS user_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT)', {})
					.then(() =>
						db.executeSql('DELETE FROM user_location', null)).then(() => {
							// alert('Table Deleted');
							// alert('Locations Count' + masterLocationList.length);
							if (this.masterLocationList.length > 0) {
								this.masterLocationList.forEach(locationRec => {
									// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
									db.executeSql('INSERT INTO user_location(id,location_GUID,location_name) VALUES(?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name])
										.then(() => {
											// alert('Record Inserted' + locationRec.location_name);	
										}).catch(e => alert('syncUserLocationToSQLite :' + JSON.stringify(e)));
								});
							}
						}).catch(e => alert('syncUserLocationToSQLite :' + JSON.stringify(e)));
			}).catch(e => alert('syncUserLocationToSQLite :' + JSON.stringify(e)));			// console.table(this.masterLocationList);
			// return this.masterLocationList;
		});
		// });
		// console.table(this.masterLocationList);
		// return this.masterLocationList;
	}

	getSQLiteMasterLocations() {
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
				alert('getSQLiteMasterLocations :' + JSON.stringify(err));
			});
		}).catch(e => alert("getSQLiteMasterLocations :" + JSON.stringify(e)));
		return storageLocationItems;
	}
	getCloudMasterLocations() {
		// alert(UserGUID)
		var url = constants.DREAMFACTORY_TABLE_URL + "/master_location?api_key=" + constants.DREAMFACTORY_API_KEY;

		this.http.get(url).map(res => res.json()).subscribe(data => {
			var locationListFromDb = data["resource"];
			locationListFromDb.forEach(element => {
				var masterLocation: MasterLocationModel = new MasterLocationModel();
				masterLocation.Id = element.h1;
				masterLocation.location_GUID = element.location_GUID;
				masterLocation.location_name = element.name;
				this.masterLocationList.push(masterLocation);
			});
			// console.table(this.masterLocationList);
			this.syncMasterLocationsToSQLite(this.masterLocationList);

			// return this.masterLocationList;
		});
		// });
		// console.table(this.masterLocationList);
		// return this.masterLocationList;
	}
	syncMasterLocationsToSQLite(masterLocationList: MasterLocationModel[]) {
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
									}).catch(e => alert('syncMasterLocationsToSQLite :' + JSON.stringify(e)));
							});
						}
					}).catch(e => alert('syncMasterLocationsToSQLite :' + JSON.stringify(e)));
		}).catch(e => alert('syncMasterLocationsToSQLite :' + JSON.stringify(e)));

	}

	getDriverLocationsFromSQLite(locationId: string) {
		// alert('Inside Get From Lite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			var query = "select * from driver_location where location_GUID='" + locationId + "'";
			// alert(query);
			db.executeSql(query, {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID, driver_GUID: data.rows.item(i).driver_GUID, driver_name: data.rows.item(i).driver_name });
					}
				}
			}, (err) => {
				alert('getDriverLocationsFromSQLite :' + JSON.stringify(err));
			});
		}).catch(e => alert("getDriverLocationsFromSQLite :" + JSON.stringify(e)));
		return storageLocationItems;
	}
	syncDriverLocationToSQLite(masterLocationList: DriverLocationModel[]) {
		// alert('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS driver_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT,driver_GUID TEXT,driver_name  TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM driver_location', null)).then(() => {
						// alert('Table Deleted');
						// alert('Locations Count' + masterLocationList.length);
						if (masterLocationList.length > 0) {
							masterLocationList.forEach(locationRec => {
								// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO driver_location(id,location_GUID,location_name,driver_GUID,driver_name) VALUES(?,?,?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name, locationRec.driver_GUID, locationRec.driver_name])
									.then(() => {
										// alert('Record Inserted' + locationRec.location_name);	
									}).catch(e => alert('syncDriverLocationToSQLite :' + JSON.stringify(e)));
							});
						}
					}).catch(e => alert('syncDriverLocationToSQLite :' + JSON.stringify(e)));
		}).catch(e => alert('syncDriverLocationToSQLite :' + JSON.stringify(e)));
	}
	getDriverLocationListFromCloud() {
		// alert(UserGUID)
		var url = constants.DREAMFACTORY_TABLE_URL + "/active_driver_location_view?api_key=" + constants.DREAMFACTORY_API_KEY;
		var driverLocationList: DriverLocationModel[] = [];
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var locationListFromDb = data["resource"];
			locationListFromDb.forEach(element => {
				var masterLocation: DriverLocationModel = new DriverLocationModel();
				masterLocation.Id = element.h1;
				masterLocation.location_GUID = element.location_GUID;
				masterLocation.location_name = element.location_name;
				masterLocation.driver_GUID = element.driver_GUID;
				masterLocation.driver_name = element.fullname;
				driverLocationList.push(masterLocation);
			});
			this.syncDriverLocationToSQLite(driverLocationList);
			// console.table(this.masterLocationList);
			// return this.masterLocationList;
		});
		// });
		// console.table(this.masterLocationList);
		// return this.masterLocationList;
	}

	getVehicleLocationsFromSQLite(locationId: string) {
		// alert('Inside Get From Lite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql("select * from vehicle_location where location_GUID='" + locationId + "'", {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID, vehicle_GUID: data.rows.item(i).vehicle_GUID, vehicle_no: data.rows.item(i).vehicle_no });
					}
				}
			}, (err) => {
				alert('getDriverLocationsFromSQLite :' + JSON.stringify(err));
			});
		}).catch(e => alert("getDriverLocationsFromSQLite :" + JSON.stringify(e)));
		return storageLocationItems;
	}
	syncVehicleLocationToSQLite(masterLocationList: VehicleLocationModel[]) {
		// alert('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS vehicle_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT,vehicle_GUID TEXT,vehicle_no  TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM vehicle_location', null)).then(() => {
						// alert('Table Deleted');
						// alert('Locations Count' + masterLocationList.length);
						if (masterLocationList.length > 0) {
							masterLocationList.forEach(locationRec => {
								// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO vehicle_location(id,location_GUID,location_name,vehicle_GUID,vehicle_no) VALUES(?,?,?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name, locationRec.vehicle_GUID, locationRec.vehicle_no])
									.then(() => {
										// alert('Record Inserted' + locationRec.location_name);	
									}).catch(e => alert('syncDriverLocationToSQLite :' + JSON.stringify(e)));
							});
						}
					}).catch(e => alert('syncDriverLocationToSQLite :' + JSON.stringify(e)));
		}).catch(e => alert('syncDriverLocationToSQLite :' + JSON.stringify(e)));
	}
	getVehicleLocationListFromCloud() {
		// alert(UserGUID)
		var url = constants.DREAMFACTORY_TABLE_URL + "/active_vehicle_location_view?api_key=" + constants.DREAMFACTORY_API_KEY;
		var vehicleLocationList: VehicleLocationModel[] = [];
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var locationListFromDb = data["resource"];
			locationListFromDb.forEach(element => {
				var masterLocation: VehicleLocationModel = new VehicleLocationModel();
				masterLocation.Id = element.h1;
				masterLocation.location_GUID = element.location_GUID;
				masterLocation.location_name = element.Location;
				masterLocation.vehicle_GUID = element.vehicle_GUID;
				masterLocation.vehicle_no = element.registration_no;
				vehicleLocationList.push(masterLocation);
			});
			this.syncVehicleLocationToSQLite(vehicleLocationList);
			// console.table(this.masterLocationList);
			// return this.masterLocationList;
		});
		// });
		// console.table(this.masterLocationList);
		// return this.masterLocationList;
	}
	//-------------------------End Master data -----------------------

	//--------------------------Surveyor Module------------------------------
	saveSurveyToSQLite(query: string, myModel: any) {
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS transact_survey(user_GUID TEXT,location_GUID TEXT,bunch_count INTEGER,year INTEGER,month INTEGER,created_ts  TEXT,createdby_GUID TEXT,updatedby_GUID TEXT,updated_ts TEXT)', {})
				.then(() =>
					db.executeSql('INSERT INTO transact_survey(user_GUID,location_GUID,bunch_count,year,month,created_ts,createdby_GUID,updatedby_GUID,updated_ts) VALUES(?,?,?,?,?,?,?,?,?)', [myModel.user_GUID, myModel.location_GUID, myModel.bunch_count, myModel.year, myModel.month, myModel.created_ts, myModel.createdby_GUID, myModel.updatedby_GUID, myModel.updated_ts])
						.then(() => {
							this.showToast('bottom', 'Saved Successfully');
							// alert('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => alert('saveSurveyToSQLite :' + JSON.stringify(e))));
		}).catch(e => alert("saveSurveyToSQLite :" + JSON.stringify(e)));
	}

	saveSurveyToCloudFromSQLite() {
		// alert('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_survey', {}).then((data) => {
				// alert('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record ' + (i + 1) + " :" + data.rows.item(i).bunch_count);
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
				db.executeSql('DELETE FROM transact_survey', null).then(() => {
					this.showToast('bottom', 'Data Synced to Cloud Successfully');

					// alert('Survey Table Deleted');
				});
			}, (err) => {
				alert('saveSurveyToCloudFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("saveSurveyToCloudFromSQLite :" + JSON.stringify(e)));
	}

	//-----------------------------Locally Used-------------------
	syncSurveyHistoryCloudToSQLite(SurveyHistoryList: SurveyHistoryModel[]) {
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
									}
									).catch(e => alert('syncSurveyHistoryCloudToSQLite: ' + JSON.stringify(e)));
							});
						}
						this.showToast('bottom', 'Data Synced to SQLite Successfully');

					}).catch(e => alert('syncSurveyHistoryCloudToSQLite: ' + JSON.stringify(e)));
		}).catch(e => alert("syncSurveyHistoryCloudToSQLite: " + JSON.stringify(e)));
	}
	//-----------------------------End Locally Used-------------------

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
				alert('getSurveyHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("getSurveyHistoryFromSQLite: " + JSON.stringify(e)));
		return surveyItems;
	}

	syncHistoryCloudToSQLite() {
		alert('Network exists. Saving data to Cloud');
		var url = constants.DREAMFACTORY_TABLE_URL + "/transact_survey_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var modelFromCloud = data["resource"];
			var surveyHistoryList: SurveyHistoryModel[] = [];
			modelFromCloud.forEach(cloudItem => {
				var surveyHistory: SurveyHistoryModel = new SurveyHistoryModel();
				surveyHistory.location_name = cloudItem.location_name;
				surveyHistory.bunch_count = cloudItem.bunch_count;
				surveyHistory.month = cloudItem.month;
				surveyHistoryList.push(surveyHistory);
			});
			this.syncSurveyHistoryCloudToSQLite(surveyHistoryList);
		});
	}
	//--------------------------End Surveyor Module------------------------------


	//--------------------------Mandor Module-------------------------------------

	syncMandorInfoCloudToSQLite(user: string, location: string, today: string) {
		var totalHarvested: string;
		var totalLoaded: string;
		//Todo: Inject into a global function
		var url = constants.DREAMFACTORY_TABLE_URL + "/harvested_count_loc_date_view?filter=(user_GUID=" + user + ")AND(harvested_date=" + today + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var cloudData = data["resource"];
			if (cloudData.length == 0) {
				totalHarvested = "0"
			}
			else {
				totalHarvested = cloudData[0].total_bunches
			}
		});

		url = constants.DREAMFACTORY_TABLE_URL + "/loaded_count_loc_date_view?filter=(user_GUID=" + user + ")AND(loaded_date=" + today + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var cloudData = data["resource"];
			if (cloudData.length == 0) {
				totalLoaded = "0"
			}
			else {
				totalLoaded = cloudData[0].total_bunches
			}
		});

		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS mandor_info(total_harvested TEXT,total_loaded TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM mandor_info', null)).then(() => {
						db.executeSql('INSERT INTO mandor_info(total_harvested,total_loaded) VALUES(?,?)', [totalHarvested, totalLoaded])
							.then(() => {
								this.showToast('bottom', 'Saved Successfully');
								// alert('Record Inserted to SQLite' + myModel.bunch_count);
							}).catch(e => alert('syncMandorInfoCloudToSQLite :' + JSON.stringify(e)));
					}).catch(e => alert('syncMandorInfoCloudToSQLite: ' + JSON.stringify(e)));
		}).catch(e => alert("syncMandorInfoCloudToSQLite :" + JSON.stringify(e)));
	}

	getMandorInfoFromSQLite() {
		// alert('Inside Get From Lite Function');
		var unloadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from mandor_info', {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');					
				unloadItems.push(data.rows.item(0).total_harvested);
				unloadItems.push(data.rows.item(0).total_loaded);
			}, (err) => {
				alert('getMandorInfoFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("getMandorInfoFromSQLite: " + JSON.stringify(e)));
		return unloadItems;
	}
	//--------------------------Harvest Module-------------------------------------

	saveHarvestToSQLite(myModel: any) {
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS transact_harvest(user_GUID TEXT,location_GUID TEXT,bunch_count INTEGER,created_ts  TEXT,createdby_GUID TEXT,updatedby_GUID TEXT,updated_ts TEXT)', {})
				.then(() =>
					db.executeSql('INSERT INTO transact_harvest(user_GUID,location_GUID,bunch_count,created_ts,createdby_GUID,updatedby_GUID,updated_ts) VALUES(?,?,?,?,?,?,?)', [myModel.user_GUID, myModel.location_GUID, myModel.bunch_count, myModel.created_ts, myModel.createdby_GUID, myModel.updatedby_GUID, myModel.updated_ts])
						.then(() => {
							this.showToast('bottom', 'Saved Successfully');
							// alert('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => alert('saveHarvestToSQLite :' + JSON.stringify(e))));
		}).catch(e => alert("saveHarvestToSQLite :" + JSON.stringify(e)));
	}
	saveHarvestToCloudFromSQLite() {
		// alert('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_harvest', {}).then((data) => {
				// alert('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record ' + (i + 1) + " :" + data.rows.item(i).bunch_count);
						var survey: HarvestBunchesModel = new HarvestBunchesModel();
						survey.user_GUID = data.rows.item(i).user_GUID;
						survey.location_GUID = data.rows.item(i).location_GUID;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.created_ts = data.rows.item(i).created_ts;
						survey.createdby_GUID = data.rows.item(i).createdby_GUID;
						survey.updatedby_GUID = data.rows.item(i).updatedby_GUID
						survey.updated_ts = data.rows.item(i).updated_ts;

						this.saveToCloud(constants.DREAMFACTORY_TABLE_URL + '/transact_harvest', survey.toJson(true));
					}
				}
				db.executeSql('DELETE FROM transact_harvest', null).then(() => {
					this.showToast('bottom', 'Data Synced to Cloud Successfully');

					// alert('Survey Table Deleted');
				});
			}, (err) => {
				alert('saveHarvestToCloudFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("saveHarvestToCloudFromSQLite :" + JSON.stringify(e)));

	}

	//-----------------------------Locally Used-------------------
	syncHarvestToSQLite(HarvestHistoryList: HarvestHistoryModel[]) {
		// alert('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS harvest_history(location_name TEXT,bunch_count  INTEGER,created_ts TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM harvest_history', null)).then(() => {
						// alert('Table Deleted');
						// alert('Locations Count' + masterLocationList.length);
						if (HarvestHistoryList.length > 0) {
							HarvestHistoryList.forEach(surveyRec => {
								// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO harvest_history(location_name,bunch_count,created_ts) VALUES(?,?,?)', [surveyRec.location_name, surveyRec.bunch_count, surveyRec.created_ts])
									.then(() => {
										// alert('Record Inserted' + surveyRec.location_name);	
									}
									).catch(e => alert('syncHarvestToSQLite: ' + JSON.stringify(e)));
							});
						}
						this.showToast('bottom', 'Data Synced to SQLite Successfully');

					}).catch(e => alert('syncHarvestToSQLite: ' + JSON.stringify(e)));
		}).catch(e => alert("syncHarvestToSQLite: " + JSON.stringify(e)));
	}
	//-----------------------------End Locally Used-------------------
	getHarvestHistoryFromSQLite(locationSelected: string) {
		// alert('Inside Get From Lite Function');
		var unloadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql("select * from harvest_history where location_name='" + locationSelected + "'", {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: HarvestHistoryModel = new HarvestHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.created_ts = data.rows.item(i).created_ts;
						unloadItems.push(survey);
					}
				}
			}, (err) => {
				alert('getHarvestHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("getHarvestHistoryFromSQLite: " + JSON.stringify(e)));
		return unloadItems;
	}
	syncHarvestHistoryCloudToSQLite() {
		alert('Network exists. Saving data to SQLite');
		var url = constants.DREAMFACTORY_TABLE_URL + "/transact_harvest_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var modelFromCloud = data["resource"];
			var surveyHistoryList: HarvestHistoryModel[] = [];
			modelFromCloud.forEach(cloudItem => {
				var surveyHistory: HarvestHistoryModel = new HarvestHistoryModel();
				surveyHistory.location_name = cloudItem.location_name;
				surveyHistory.bunch_count = cloudItem.bunch_count;
				surveyHistory.created_ts = cloudItem.created_ts;
				surveyHistoryList.push(surveyHistory);
			});
			this.syncHarvestToSQLite(surveyHistoryList);
		});
	}
	//--------------------------End Harvest Module-------------------------------------


	//--------------------------Load Module-------------------------------------

	saveLoadToSQLite(myModel: any) {
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS transact_loading(user_GUID TEXT,location_GUID TEXT,bunch_count INTEGER,vehicle_GUID TEXT,driver_GUID TEXT,created_ts  TEXT,createdby_GUID TEXT,updatedby_GUID TEXT,updated_ts TEXT)', {})
				.then(() =>
					db.executeSql('INSERT INTO transact_loading(user_GUID,location_GUID,bunch_count,vehicle_GUID,driver_GUID,created_ts,createdby_GUID,updatedby_GUID,updated_ts) VALUES(?,?,?,?,?,?,?,?,?)', [myModel.user_GUID, myModel.location_GUID, myModel.bunch_count, myModel.vehicle_GUID, myModel.driver_GUID, myModel.created_ts, myModel.createdby_GUID, myModel.updatedby_GUID, myModel.updated_ts])
						.then(() => {
							this.showToast('bottom', 'Saved Successfully');
							// alert('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => alert('saveLoadToSQLite :' + JSON.stringify(e))));
		}).catch(e => alert("saveLoadToSQLite :" + JSON.stringify(e)));
	}

	saveLoadToCloudFromSQLite() {
		// alert('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_loading', {}).then((data) => {
				// alert('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record ' + (i + 1) + " :" + data.rows.item(i).bunch_count);
						var survey: LoadBunchesModel = new LoadBunchesModel();
						survey.user_GUID = data.rows.item(i).user_GUID;
						survey.location_GUID = data.rows.item(i).location_GUID;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.vehicle_GUID = data.rows.item(i).vehicle_GUID;
						survey.driver_GUID = data.rows.item(i).driver_GUID;
						survey.created_ts = data.rows.item(i).created_ts;
						survey.createdby_GUID = data.rows.item(i).createdby_GUID;
						survey.updatedby_GUID = data.rows.item(i).updatedby_GUID
						survey.updated_ts = data.rows.item(i).updated_ts;

						this.saveToCloud(constants.DREAMFACTORY_TABLE_URL + '/transact_loading', survey.toJson(true));
					}
				}
				db.executeSql('DELETE FROM transact_loading', null).then(() => {
					this.showToast('bottom', 'Data Synced to Cloud Successfully');

					// alert('Survey Table Deleted');
				});
			}, (err) => {
				alert('saveLoadToCloudFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("saveLoadToCloudFromSQLite :" + JSON.stringify(e)));

	}

	//-----------------------------Locally Used-------------------
	syncLoadToSQLite(LoadHistoryList: LoadHistoryModel[]) {
		// alert('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS loading_history(location_name TEXT,bunch_count  INTEGER,vehicle_no INTEGER)', {})
				.then(() =>
					db.executeSql('DELETE FROM loading_history', null)).then(() => {
						// alert('Table Deleted');
						// alert('Locations Count' + masterLocationList.length);
						if (LoadHistoryList.length > 0) {
							LoadHistoryList.forEach(surveyRec => {
								// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO loading_history(location_name,bunch_count,vehicle_no) VALUES(?,?,?)', [surveyRec.location_name, surveyRec.bunch_count, surveyRec.vehicle_no])
									.then(() => {
										// alert('Record Inserted' + surveyRec.location_name);	
									}
									).catch(e => alert('syncLoadToSQLite: ' + JSON.stringify(e)));
							});
						}
						this.showToast('bottom', 'Data Synced to SQLite Successfully');

					}).catch(e => alert('syncLoadToSQLite: ' + JSON.stringify(e)));
		}).catch(e => alert("syncLoadToSQLite: " + JSON.stringify(e)));
	}
	//-----------------------------End Locally Used-------------------
	getLoadHistoryFromSQLite(locationSelected: string) {
		// alert('Inside Get From Lite Function');
		var unloadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql("select * from loading_history  where location_name='" + locationSelected + "'", {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: LoadHistoryModel = new LoadHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.vehicle_no = data.rows.item(i).vehicle_no;
						unloadItems.push(survey);
					}
				}
			}, (err) => {
				alert('getLoadHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("getLoadHistoryFromSQLite: " + JSON.stringify(e)));
		return unloadItems;
	}
	syncLoadHistoryCloudToSQLite() {
		alert('Network exists. Saving data to SQLite');
		var url = constants.DREAMFACTORY_TABLE_URL + "/transact_loading_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var modelFromCloud = data["resource"];
			var surveyHistoryList: LoadHistoryModel[] = [];
			modelFromCloud.forEach(cloudItem => {
				var surveyHistory: LoadHistoryModel = new LoadHistoryModel();
				surveyHistory.location_name = cloudItem.location_name;
				surveyHistory.bunch_count = cloudItem.bunch_count;
				surveyHistory.vehicle_no = cloudItem.registration_no;
				surveyHistoryList.push(surveyHistory);
			});
			this.syncLoadToSQLite(surveyHistoryList);
		});
	}
	//--------------------------End Load Module-------------------------------------


	//--------------------------End Mandor Module--------------------------------


	//--------------------------Factory Module-------------------------------------
	saveUnloadToSQLite(myModel: any) {
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS transact_unloading(user_GUID TEXT,location_GUID TEXT,bunch_count INTEGER,vehicle_GUID TEXT,driver_GUID TEXT,created_ts  TEXT,createdby_GUID TEXT,updatedby_GUID TEXT,updated_ts TEXT)', {})
				.then(() =>
					db.executeSql('INSERT INTO transact_unloading(user_GUID,location_GUID,bunch_count,vehicle_GUID,driver_GUID,created_ts,createdby_GUID,updatedby_GUID,updated_ts) VALUES(?,?,?,?,?,?,?,?,?)', [myModel.user_GUID, myModel.loading_location_GUID, myModel.bunch_count, myModel.vehicle_GUID, myModel.driver_GUID, myModel.created_ts, myModel.createdby_GUID, myModel.updatedby_GUID, myModel.updated_ts])
						.then(() => {
							this.showToast('bottom', 'Saved Successfully');
							// alert('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => alert('saveUnloadToSQLite :' + JSON.stringify(e))));
		}).catch(e => alert("saveUnloadToSQLite :" + JSON.stringify(e)));

	}
	saveUnloadToCloudFromSQLite() {
		// alert('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_unloading', {}).then((data) => {
				// alert('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record ' + (i + 1) + " :" + data.rows.item(i).bunch_count);
						var survey: AcceptBunchesModel = new AcceptBunchesModel();
						survey.user_GUID = data.rows.item(i).user_GUID;
						survey.loading_location_GUID = data.rows.item(i).location_GUID;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.vehicle_GUID = data.rows.item(i).vehicle_GUID;
						survey.driver_GUID = data.rows.item(i).driver_GUID;
						survey.created_ts = data.rows.item(i).created_ts;
						survey.createdby_GUID = data.rows.item(i).createdby_GUID;
						survey.updatedby_GUID = data.rows.item(i).updatedby_GUID
						survey.updated_ts = data.rows.item(i).updated_ts;

						this.saveToCloud(constants.DREAMFACTORY_TABLE_URL + '/transact_unloading', survey.toJson(true));
					}
				}
				db.executeSql('DELETE FROM transact_unloading', null).then(() => {
					this.showToast('bottom', 'Data Synced to Cloud Successfully');

					// alert('Survey Table Deleted');
				});
			}, (err) => {
				alert('saveUnloadToCloudFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("saveUnloadToCloudFromSQLite :" + JSON.stringify(e)));

	}

	//-----------------------------Locally Used-------------------
	syncFactoryToSQLite(UnloadHistoryList: FactoryHistoryModel[]) {
		// alert('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS factory_history(location_name TEXT,bunch_count  INTEGER,vehicle_no INTEGER)', {})
				.then(() =>
					db.executeSql('DELETE FROM factory_history', null)).then(() => {
						// alert('Table Deleted');
						// alert('Locations Count' + masterLocationList.length);
						if (UnloadHistoryList.length > 0) {
							UnloadHistoryList.forEach(surveyRec => {
								// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO factory_history(location_name,bunch_count,vehicle_no) VALUES(?,?,?)', [surveyRec.location_name, surveyRec.bunch_count, surveyRec.vehicle_no])
									.then(() => {
										// alert('Record Inserted' + surveyRec.location_name);	
									}
									).catch(e => alert('syncFactoryToSQLite: ' + JSON.stringify(e)));
							});
						}
						this.showToast('bottom', 'Data Synced to SQLite Successfully');

					}).catch(e => alert('syncFactoryToSQLite: ' + JSON.stringify(e)));
		}).catch(e => alert("syncFactoryToSQLite: " + JSON.stringify(e)));
	}
	//-----------------------------End Locally Used-------------------
	getUnloadHistoryFromSQLite() {
		// alert('Inside Get From Lite Function');
		var unloadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from factory_history', {}).then((data) => {
				// alert('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// alert(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// alert('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: FactoryHistoryModel = new FactoryHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.vehicle_no = data.rows.item(i).vehicle_no;
						unloadItems.push(survey);
					}
				}
			}, (err) => {
				alert('getUnloadHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => alert("getUnloadHistoryFromSQLite: " + JSON.stringify(e)));
		return unloadItems;
	}
	syncUnloadHistoryCloudToSQLite() {
		alert('Network exists. Saving data to SQLite');
		var url = constants.DREAMFACTORY_TABLE_URL + "/transact_unloading_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var modelFromCloud = data["resource"];
			var surveyHistoryList: FactoryHistoryModel[] = [];
			modelFromCloud.forEach(cloudItem => {
				var surveyHistory: FactoryHistoryModel = new FactoryHistoryModel();
				surveyHistory.location_name = cloudItem.location_name;
				surveyHistory.bunch_count = cloudItem.bunch_count;
				surveyHistory.vehicle_no = cloudItem.registration_no;
				surveyHistoryList.push(surveyHistory);
			});
			this.syncFactoryToSQLite(surveyHistoryList);
		});
	}
	//--------------------------End Factory Module--------------------------------



	saveToCloud(url: string, myModel: any) {
		// alert('In Save Cloud');
		var queryHeaders = new Headers();
		queryHeaders.append('Content-Type', 'application/json');
		queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);
		let options = new RequestOptions({ headers: queryHeaders });
		// alert(url);
		// alert(myModel);
		this.http
			.post(url, myModel, options)
			.subscribe((response) => {
				// alert(response);
				// this.showToast('bottom', this.successToast);
				this.showToast('bottom', 'Saved Successfully');

			}, (error) => {
				alert(error);
				this.showToast('bottom', 'Failed to Save');
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
		var url = constants.DREAMFACTORY_TABLE_URL + "/user_location?api_key=a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7";
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
	//----------------------End Obsolete Functions-----------------------

}