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
import { DriverLocationModel } from '../../models/SQLiteSync/DriverLocationModel';
import { VehicleDriverModel } from '../../models/SQLiteSync/VehicleDriverModel';

import { HarvestBunchesModel } from '../../models/HarvestBunchesModel';
import { VehicleLocationModel } from '../../models/SQLiteSync/VehicleLocationModel';
import { MasterVehicleModel } from '../../models/SQLiteSync/MasterVehicleModel';
import { HarvestHistoryModel } from '../../models/HarvestHistoryModel';
import { LoadBunchesModel } from '../../models/LoadBunchesModel';
import { LoadHistoryModel } from '../../models/LoadHistoryModel';
import { MandorInfoModel } from '../../models/MandorInfoModel';
import { HarvestInfoLocal } from '../../models//SQLiteSync/HarvestInfoLocal';

import { ToastController } from 'ionic-angular';
import { AcceptBunchesModel } from '../../models/AcceptBunchesModel';
import { FactoryHistoryModel } from '../../models/FactoryHistoryModel';
// Translation Service:
import { TranslateService } from '@ngx-translate/core';

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
	// public masterLocationList: MasterLocationModel[] = [];
	constructor(public toastCtrl: ToastController, public translate: TranslateService, private sqlite: SQLite, private http: Http, private network: Network) {
	}


	//-------------------------Master  data------------------------
	getUserLocationsFromSQLite() {
		// console.log('Inside getUserLocationsFromSQLite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from user_location', {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID });
					}
				}
			}, (err) => {
				// console.log('getUserLocationsFromSQLite :' + JSON.stringify(err));
			});
		}).catch(e => {// console.log("getUserLocationsFromSQLite :" + JSON.stringify(e))
		}
			); return storageLocationItems;
	}

	getUserLocationListFromCloud() {
		var UserGUID = localStorage.getItem('loggedIn_user_GUID');
		// console.log('getUserLocationListFromCloud Entered')
		var url = constants.DREAMFACTORY_TABLE_URL + "/active_users_location_view?filter=user_GUID=" + UserGUID + "&api_key=" + constants.DREAMFACTORY_API_KEY;
		var masterLocationList: MasterLocationModel[] = [];
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var locationListFromDb = data["resource"];
			locationListFromDb.forEach(element => {
				var masterLocation: MasterLocationModel = new MasterLocationModel();
				masterLocation.Id = element.h1;
				masterLocation.location_GUID = element.location_GUID;
				masterLocation.location_name = element.location_name;
				masterLocationList.push(masterLocation);
			});
			// console.log(' syncUserLocationToSQLite Begins Here ');
			this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
				db.executeSql('CREATE TABLE IF NOT EXISTS user_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT)', {})
					.then(() =>
						db.executeSql('DELETE FROM user_location', null)).then(() => {
							// console.log('Table Deleted');
							// console.log('Locations Count' + masterLocationList.length);
							if (masterLocationList.length > 0) {
								masterLocationList.forEach(locationRec => {
									// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
									db.executeSql('INSERT INTO user_location(id,location_GUID,location_name) VALUES(?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name])
										.then(() => {
											// console.log('Record Inserted' + locationRec.location_name);	
										}).catch(e => {	// console.log('syncUserLocationToSQLite :' + JSON.stringify(e))
										});
								});
							}
						}).catch(e => {
							// console.log('syncUserLocationToSQLite :' + JSON.stringify(e))
						});
			}).catch(e => {
				// console.log('syncUserLocationToSQLite :' + JSON.stringify(e))
			});
			// console.table(this.masterLocationList);
		});
	}

	getSQLiteMasterLocations() {
		// console.log('Inside Get From Lite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from master_location', {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID });
					}
				}
			}, (err) => {
				{
					// console.log('getSQLiteMasterLocations :' + JSON.stringify(err));
				}
			});
		}).catch(e => {
			// console.log("getSQLiteMasterLocations :" + JSON.stringify(e))
		});
		return storageLocationItems;
	}
	getCloudMasterLocations() {
		// console.log(UserGUID)
		var url = constants.DREAMFACTORY_TABLE_URL + "/master_location?api_key=" + constants.DREAMFACTORY_API_KEY;
		var masterLocationList: MasterLocationModel[] = [];
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var locationListFromDb = data["resource"];
			locationListFromDb.forEach(element => {
				var masterLocation: MasterLocationModel = new MasterLocationModel();
				masterLocation.Id = element.h1;
				masterLocation.location_GUID = element.location_GUID;
				masterLocation.location_name = element.name;
				masterLocationList.push(masterLocation);
			});
			// console.table(this.masterLocationList);
			this.syncMasterLocationsToSQLite(masterLocationList);
			// return this.masterLocationList;
		});
		// });
		// console.table(this.masterLocationList);
		// return this.masterLocationList;
	}
	syncMasterLocationsToSQLite(masterLocationList: MasterLocationModel[]) {
		// console.log('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS master_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM master_location', null)).then(() => {
						// console.log('Table Deleted');
						// console.log('Locations Count' + masterLocationList.length);
						if (masterLocationList.length > 0) {
							masterLocationList.forEach(locationRec => {
								// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO master_location(id,location_GUID,location_name) VALUES(?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name])
									.then(() => {
										// console.log('Record Inserted' + locationRec.location_name);	
									}).catch(e => {
										// console.log('syncMasterLocationsToSQLite :' + JSON.stringify(e))
									});
							});
						}
					}).catch(e => {
						// console.log('syncMasterLocationsToSQLite :' + JSON.stringify(e))
					});
		}).catch(e => {
			// console.log('syncMasterLocationsToSQLite :' + JSON.stringify(e))
		});

	}

	getDriverLocationsFromSQLite(locationId: string) {
		// console.log('Inside Get From Lite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			var query = "select * from driver_location where location_GUID='" + locationId + "'";
			// console.log(query);
			db.executeSql(query, {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID, driver_GUID: data.rows.item(i).driver_GUID, driver_name: data.rows.item(i).driver_name });
					}
				}
			}, (err) => {
				// console.log('getDriverLocationsFromSQLite :' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getDriverLocationsFromSQLite :" + JSON.stringify(e))
		});
		return storageLocationItems;
	}

	syncDriverLocationToSQLite(masterLocationList: DriverLocationModel[]) {
		// console.log('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS driver_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT,driver_GUID TEXT,driver_name  TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM driver_location', null)).then(() => {
						// console.log('Table Deleted');
						// console.log('Locations Count' + masterLocationList.length);
						if (masterLocationList.length > 0) {
							masterLocationList.forEach(locationRec => {
								// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO driver_location(id,location_GUID,location_name,driver_GUID,driver_name) VALUES(?,?,?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name, locationRec.driver_GUID, locationRec.driver_name])
									.then(() => {
										// console.log('Record Inserted' + locationRec.location_name);	
									}).catch(e => {
										// console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
									});
							});
						}
					}).catch(e => {
						//  console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
					});
		}).catch(e => {
			//  console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
		});
	}
	getDriverLocationListFromCloud() {
		// console.log(UserGUID)
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

	getVehicleDriverFromSQLite(vehicleId: string) {
		// console.log('Inside Get From Lite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			var query = "select * from vehicle_driver where vehicle_GUID='" + vehicleId + "'";
			console.log(query);
			db.executeSql(query, {}).then((data) => {
				console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						console.log('Record ' + (i + 1) + " :" + data.rows.item(i).vehicle_no);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID, driver_GUID: data.rows.item(i).driver_GUID, driver_name: data.rows.item(i).driver_name });
					}
				}
			}, (err) => {
				console.log('getVehicleDriverFromSQLite :' + JSON.stringify(err));
			});
		}).catch(e => {
			console.log("getVehicleDriverFromSQLite :" + JSON.stringify(e))
		});
		return storageLocationItems;
	}

	syncVehicleDriverToSQLite(masterLocationList: VehicleDriverModel[]) {
		console.table(masterLocationList)
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			var tableQuery = 'CREATE TABLE IF NOT EXISTS vehicle_driver(id INTEGER,vehicle_GUID TEXT,vehicle_no TEXT,driver_GUID TEXT,driver_name  TEXT)';
			console.log(tableQuery)
			db.executeSql(tableQuery, {})
				.then(() =>
					db.executeSql('DELETE FROM vehicle_driver', null)).then(() => {
						console.log('Table Deleted');
						console.log('Locations Count' + masterLocationList.length);
						if (masterLocationList.length > 0) {
							masterLocationList.forEach(locationRec => {
								console.log('Record' + locationRec.Id + " :" + locationRec.Id + "." + locationRec.vehicle_GUID + "=>" + locationRec.vehicle_no);
								db.executeSql('INSERT INTO vehicle_driver(id,vehicle_GUID,vehicle_no,driver_GUID,driver_name) VALUES(?,?,?,?,?)', [locationRec.Id, locationRec.vehicle_GUID, locationRec.vehicle_no, locationRec.driver_GUID, locationRec.driver_name])
									.then(() => {
										console.log('Record Inserted' + locationRec.vehicle_no);
									}).catch(e => {
										console.log('syncVehicleDriverToSQLite :' + JSON.stringify(e))
									});
							});
						}
					}).catch(e => {
						//  console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
					});
		}).catch(e => {
			//  console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
		});
	}

	getVehicleDriverListFromCloud() {
		// console.log(UserGUID)
		var url = constants.DREAMFACTORY_TABLE_URL + "/active_vehicle_driver_view?api_key=" + constants.DREAMFACTORY_API_KEY;
		// console.log(url)
		var vehicleDriverList: VehicleDriverModel[] = [];
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var locationListFromDb = data["resource"];
			// console.table(locationListFromDb);
			locationListFromDb.forEach(element => {
				var masterLocation: VehicleDriverModel = new VehicleDriverModel();
				masterLocation.Id = element.h1;
				masterLocation.vehicle_GUID = element.vehicle_GUID;
				masterLocation.vehicle_no = element.registration_no;
				masterLocation.driver_GUID = element.driver_GUID;
				masterLocation.driver_name = element.fullname;
				vehicleDriverList.push(masterLocation);
			});
			this.syncVehicleDriverToSQLite(vehicleDriverList);
			// console.table(this.masterLocationList);
			// return this.masterLocationList;
		});
		// });
		// console.table(this.masterLocationList);
		// return this.masterLocationList;
	}

	getVehicleLocationsFromSQLite(locationId: string) {
		// console.log('Inside Get From Lite Function');
		var storageLocationItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql("select * from vehicle_location where location_GUID='" + locationId + "'", {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageLocationItems.push({ id: data.rows.item(i).id, location_name: data.rows.item(i).location_name, location_GUID: data.rows.item(i).location_GUID, vehicle_GUID: data.rows.item(i).vehicle_GUID, vehicle_no: data.rows.item(i).vehicle_no });
					}
				}
			}, (err) => {
				// console.log('getDriverLocationsFromSQLite :' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getDriverLocationsFromSQLite :" + JSON.stringify(e))
		});
		return storageLocationItems;
	}
	syncVehicleLocationToSQLite(masterLocationList: VehicleLocationModel[]) {
		// console.log('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS vehicle_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT,vehicle_GUID TEXT,vehicle_no  TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM vehicle_location', null)).then(() => {
						// console.log('Table Deleted');
						// console.log('Locations Count' + masterLocationList.length);
						if (masterLocationList.length > 0) {
							masterLocationList.forEach(locationRec => {
								// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO vehicle_location(id,location_GUID,location_name,vehicle_GUID,vehicle_no) VALUES(?,?,?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name, locationRec.vehicle_GUID, locationRec.vehicle_no])
									.then(() => {
										// console.log('Record Inserted' + locationRec.location_name);	
									}).catch(e => {
										//  console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
									});
							});
						}
					}).catch(e => {
						//  console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
					});
		}).catch(e => {
			// console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
		});
	}
	getVehicleLocationListFromCloud() {
		// console.log(UserGUID)
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

	getMasterVehiclesFromSQLite() {
		// console.log('Inside Get From Lite Function');
		var storageVehicleItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql("select * from master_vehicles", {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						storageVehicleItems.push({ id: data.rows.item(i).id, vehicle_no: data.rows.item(i).vehicle_no, vehicle_GUID: data.rows.item(i).vehicle_GUID });
					}
				}
			}, (err) => {
				// console.log('getDriverLocationsFromSQLite :' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getDriverLocationsFromSQLite :" + JSON.stringify(e))
		});
		return storageVehicleItems;
	}
	syncMasterVehiclesToSQLite(masterVehicleList: MasterVehicleModel[]) {
		// console.log('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS master_vehicles(id INTEGER  ,vehicle_GUID TEXT,vehicle_no  TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM master_vehicles', null)).then(() => {
						// console.log('Table Deleted');
						// console.log('Locations Count' + masterLocationList.length);
						if (masterVehicleList.length > 0) {
							masterVehicleList.forEach(locationRec => {
								// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO master_vehicles(id,vehicle_GUID,vehicle_no) VALUES(?,?,?)', [locationRec.Id, locationRec.vehicle_GUID, locationRec.vehicle_no])
									.then(() => {
										// console.log('Record Inserted' + locationRec.location_name);	
									}).catch(e => {
										//  console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
									});
							});
						}
					}).catch(e => {
						//  console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
					});
		}).catch(e => {
			// console.log('syncDriverLocationToSQLite :' + JSON.stringify(e))
		});
	}
	getMasterVehiclesListFromCloud() {
		// console.log(UserGUID)
		var url = constants.DREAMFACTORY_TABLE_URL + "/master_vehicle?api_key=" + constants.DREAMFACTORY_API_KEY;
		var vehicleList: MasterVehicleModel[] = [];
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var locationListFromDb = data["resource"];
			locationListFromDb.forEach(element => {
				var masterVehicle: MasterVehicleModel = new MasterVehicleModel();
				masterVehicle.Id = element.h1;
				masterVehicle.vehicle_GUID = element.vehicle_GUID;
				masterVehicle.vehicle_no = element.registration_no;
				vehicleList.push(masterVehicle);
			});
			this.syncMasterVehiclesToSQLite(vehicleList);
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
							// console.log('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => {
							// console.log('saveSurveyToSQLite :' + JSON.stringify(e))
						}));
		}).catch(e => {
			//  console.log("saveSurveyToSQLite :" + JSON.stringify(e))
		});
	}

	saveSurveyToCloudFromSQLite() {
		// console.log('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_survey', {}).then((data) => {
				// console.log('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record ' + (i + 1) + " :" + data.rows.item(i).bunch_count);
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
					// this.showToast('bottom', 'Data Synced to Cloud Successfully');

					// console.log('Survey Table Deleted');
				});
			}, (err) => {
				// console.log('saveSurveyToCloudFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			//  console.log("saveSurveyToCloudFromSQLite :" + JSON.stringify(e))
		});
	}

	getSurveyFromSQLite() {
		// console.log('Inside Get From Lite Function');
		var surveyItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			var query = 'select B.location_name,A.bunch_count,A.month from transact_survey AS  A INNER JOIN user_location AS B where A.location_GUID = B.location_GUID ORDER BY A.created_ts DESC';
			// console.log('Selecting Inserted list from Sqlite'+query);
			db.executeSql(query, {}).then((data) => {
				// console.log(data.rows.length);
				if (data.rows.length > 0) {
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: SurveyHistoryModel = new SurveyHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.month = data.rows.item(i).month;
						surveyItems.push(survey);
					}
				}
			}, (err) => {
				// console.log('getSurveyHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getSurveyHistoryFromSQLite: " + JSON.stringify(e))
		});
		return surveyItems;
	}


	//-----------------------------Locally Used-------------------
	syncSurveyHistoryCloudToSQLite(SurveyHistoryList: SurveyHistoryModel[]) {
		// console.log('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS survey_history(location_name TEXT,bunch_count  INTEGER,month INTEGER)', {})
				.then(() =>
					db.executeSql('DELETE FROM survey_history', null)).then(() => {
						// console.log('Table Deleted');
						// console.log('Locations Count' + masterLocationList.length);
						if (SurveyHistoryList.length > 0) {
							SurveyHistoryList.forEach(surveyRec => {
								// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO survey_history(location_name,bunch_count,month) VALUES(?,?,?)', [surveyRec.location_name, surveyRec.bunch_count, surveyRec.month])
									.then(() => {
										// console.log('Record Inserted' + surveyRec.location_name);	
									}
									).catch(e => {
										// console.log('syncSurveyHistoryCloudToSQLite: ' + JSON.stringify(e))
									});
							});
						}
						// this.showToast('bottom', 'Data Synced to SQLite Successfully');

					}).catch(e => {
						// console.log('syncSurveyHistoryCloudToSQLite: ' + JSON.stringify(e))
					});
		}).catch(e => {
			//  console.log("syncSurveyHistoryCloudToSQLite: " + JSON.stringify(e))
		});
	}
	//-----------------------------End Locally Used-------------------

	getSurveyHistoryFromSQLite() {
		// console.log('Inside Get From Lite Function');
		var surveyItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from survey_history', {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: SurveyHistoryModel = new SurveyHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.month = data.rows.item(i).month;
						surveyItems.push(survey);
					}
				}
			}, (err) => {
				// console.log('getSurveyHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getSurveyHistoryFromSQLite: " + JSON.stringify(e))
		});
		return surveyItems;
	}

	syncHistoryCloudToSQLite() {
		// console.log('Network exists. Saving data to Cloud');
		var url = constants.DREAMFACTORY_TABLE_URL + "/transact_survey_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
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
	getStringDate() {
		var myDate = new Date();
		var day: string = null;
		var month: string = null;
		var temp = myDate.getDate();
		if (temp < 10) { day = "0" + temp; } else { day = temp + ""; }
		temp = (myDate.getMonth() + 1);
		if (temp < 10) { month = "0" + temp; } else { month = temp + ""; }
		return (myDate.getFullYear() + "-" + month + "-" + day);
	}
	saveMandorHarvestInfoLocal(myModel: any) {
		console.log('In Save Mandor Info')
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			console.log('DB Created')
			db.executeSql('CREATE TABLE IF NOT EXISTS harvested_info(date_stamp TEXT,harvest_date TEXT,location_GUID TEXT,bunch_count INTEGER)', {})
				.then(() => {

					console.log('Table Created')
					db.executeSql('INSERT INTO harvested_info(date_stamp,harvest_date,location_GUID,bunch_count) VALUES(?,?,?,?)', [this.getStringDate(),myModel.created_ts, myModel.location_GUID, myModel.bunch_count])
						.then(() => {
							console.log('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => {
							console.log('saveMandorHarvestInfoLocal-Harvest :' + JSON.stringify(e))
						});
				}).catch(e => {
					console.log('saveMandorHarvestInfoLocal- Harvest: ' + JSON.stringify(e))
				});
		}).catch(e => {
			console.log("saveMandorHarvestInfoLocal- Harvest :" + JSON.stringify(e))
		});
	}

	saveMandorLoadedInfoLocal(myModel: any) {
		console.log('In Save Mandor Loaded Info')
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			console.log('DB Created')
			db.executeSql('CREATE TABLE IF NOT EXISTS loaded_info(date_stamp TEXT,loaded_date TEXT,location_GUID TEXT,bunch_count INTEGER)', {})
				.then(() => {
					
					console.log('Table Created')
					db.executeSql('INSERT INTO loaded_info(date_stamp,loaded_date,location_GUID,bunch_count) VALUES(?,?,?,?)', [this.getStringDate(),myModel.created_ts, myModel.location_GUID, myModel.bunch_count])
						.then(() => {
							console.log('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => {
							console.log('saveMandorHarvestInfoLocal-Harvest :' + JSON.stringify(e))
						});
				}).catch(e => {
					console.log('saveMandorHarvestInfoLocal- Harvest: ' + JSON.stringify(e))
				});
		}).catch(e => {
			console.log("saveMandorHarvestInfoLocal- Harvest :" + JSON.stringify(e))
		});
	}


	getHarvestInfoListLocal() {
		// console.log('Inside getMandorHarvestInfoLocal Function');
		// var harvestItems = [];

		// this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
		// 	var query = "select * from harvested_info";
		// 	console.log(query)
		// 	db.executeSql(query, {}).then((data) => {
		// 		console.log('Selecting Inserted list from Sqlite');
		// 		console.log('push :' + data.rows.item(0).harvest_date)

		// 		if (data.rows.length > 0) {
		// console.log(data.rows.length);
		// for (var i = 0; i < data.rows.length; i++) {
		// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
		// 				var harvestInfo: HarvestInfoLocal = new HarvestInfoLocal();
		// 				harvestInfo.harvest_date = data.rows.item(i).harvest_date;
		// 				harvestInfo.bunch_count = data.rows.item(i).bunch_count;
		// 				harvestInfo.location_GUID = data.rows.item(i).location_GUID;
		// 				harvestItems.push(harvestInfo);
		// 			}
		// 		}
		// 	}, (err) => {
		// 		console.log('getMandorInfoFromSQLite: ' + JSON.stringify(err));
		// 	});
		// 	return harvestItems;
		// }).catch(e => {
		// 	console.log("getMandorInfoFromSQLite: " + JSON.stringify(e))
		// });
		// return harvestItems;
	}


	//--------------------------It is synced data maintained locally -----------------Depricated
	syncMandorInfoCloudToSQLite(user: string, today: string) {
		//Todo: Inject into a global function
		var url = constants.DREAMFACTORY_TABLE_URL + "/harvested_count_loc_date_view?filter=(user_GUID=" + user + ")AND(harvested_date=" + today + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var cloudData = data["resource"];

			this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
				db.executeSql('CREATE TABLE IF NOT EXISTS mandor_harvested_info(location_GUID TEXT,total_harvested INTEGER)', {})
					.then(() =>
						db.executeSql('DELETE FROM mandor_harvested_info', null)).then(() => {
							if (cloudData.length > 0) {
								cloudData.forEach(harvestedRec => {
									// console.log('Harvest Sync:' + harvestedRec.location_GUID + harvestedRec.total_bunches)
									db.executeSql('INSERT INTO mandor_harvested_info(location_GUID,total_harvested) VALUES(?,?)', [harvestedRec.location_GUID, harvestedRec.total_bunches])
										.then(() => {
											// this.showToast('bottom', 'Saved Successfully');
											// console.log('Record Inserted to SQLite' + myModel.bunch_count);
										}).catch(e => {
											// console.log('syncMandorInfoCloudToSQLite-Harvest :' + JSON.stringify(e))
										});
								})
							}
						}).catch(e => {
							// console.log('syncMandorInfoCloudToSQLite- Harvest: ' + JSON.stringify(e))
						});
			}).catch(e => {
				// console.log("syncMandorInfoCloudToSQLite- Harvest :" + JSON.stringify(e))
			});

			// if (cloudData.length == 0) {
			// 	totalHarvested = "0"
			// }
			// else {
			// 	totalHarvested = cloudData[0].total_bunches
			// }
		});

		url = constants.DREAMFACTORY_TABLE_URL + "/loaded_count_loc_date_view?filter=(user_GUID=" + user + ")AND(loaded_date=" + today + ")&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var cloudData = data["resource"];

			this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
				db.executeSql('CREATE TABLE IF NOT EXISTS mandor_loaded_info(location_GUID TEXT,total_loaded INTEGER)', {})
					.then(() =>
						db.executeSql('DELETE FROM mandor_loaded_info', null)).then(() => {
							if (cloudData.length > 0) {
								cloudData.forEach(harvestedRec => {
									// console.log('Load Sync:' + harvestedRec.location_GUID + harvestedRec.total_bunches)
									db.executeSql('INSERT INTO mandor_loaded_info(location_GUID,total_loaded) VALUES(?,?)', [harvestedRec.location_GUID, harvestedRec.total_bunches])
										.then(() => {
											// this.showToast('bottom', 'Saved Successfully');
											// console.log('Record Inserted to SQLite' + myModel.bunch_count);
										}).catch(e => {
											// console.log('syncMandorInfoCloudToSQLite-loaded :' + JSON.stringify(e))
										});
								})
							}
						}).catch(e => {
							//  console.log('syncMandorInfoCloudToSQLite- loaded: ' + JSON.stringify(e))
						});
			}).catch(e => {
				// console.log("syncMandorInfoCloudToSQLite- loaded :" + JSON.stringify(e))
			});



		});


	}
	//--------------------------It is synced data maintained locally -----------------Depricated

	getMandorInfoFromSQLite(location: string) {
		// console.log('Inside Get From Lite Function');
		var mandorInfo: MandorInfoModel = new MandorInfoModel();
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			var query = "select * from mandor_harvested_info where location_GUID='" + location + "'";
			// console.log(query)
			db.executeSql(query, {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');		
				// console.log('push :' + data.rows.item(0).total_harvested)
				mandorInfo.total_harvested = (data.rows.item(0).total_harvested);

				query = "select * from mandor_loaded_info where location_GUID='" + location + "'";
				// console.log(query)
				db.executeSql(query, {}).then((data) => {
					// console.log('Selecting Inserted list from Sqlite');	
					// console.log('push :' + data.rows.item(0).total_loaded)
					mandorInfo.total_loaded = (data.rows.item(0).total_loaded);
				}, (err) => {
					// console.log('getMandorInfoFromSQLite: ' + JSON.stringify(err));
				});

			}, (err) => {
				// console.log('getMandorInfoFromSQLite: ' + JSON.stringify(err));
			});
			// console.log('list:' + mandorInfo.total_harvested + " , " + mandorInfo.total_loaded)
			return mandorInfo;
		}).catch(e => {
			//  console.log("getMandorInfoFromSQLite: " + JSON.stringify(e))
		});
		// console.log('list:' + mandorInfo.total_harvested + " , " + mandorInfo.total_loaded)
		return mandorInfo;
	}
	//--------------------------Harvest Module-------------------------------------

	saveHarvestToSQLite(myModel: any) {
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS transact_harvest(user_GUID TEXT,location_GUID TEXT,bunch_count INTEGER,created_ts  TEXT,createdby_GUID TEXT,updatedby_GUID TEXT,updated_ts TEXT)', {})
				.then(() =>
					db.executeSql('INSERT INTO transact_harvest(user_GUID,location_GUID,bunch_count,created_ts,createdby_GUID,updatedby_GUID,updated_ts) VALUES(?,?,?,?,?,?,?)', [myModel.user_GUID, myModel.location_GUID, myModel.bunch_count, myModel.created_ts, myModel.createdby_GUID, myModel.updatedby_GUID, myModel.updated_ts])
						.then(() => {
							this.showToast('bottom', 'Saved Successfully');
							// console.log('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => {
							// console.log('saveHarvestToSQLite :' + JSON.stringify(e))
						}));
		}).catch(e => {
			// console.log("saveHarvestToSQLite :" + JSON.stringify(e))
		});
	}
	saveHarvestToCloudFromSQLite() {
		// console.log('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_harvest', {}).then((data) => {
				// console.log('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record ' + (i + 1) + " :" + data.rows.item(i).bunch_count);
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
					// this.showToast('bottom', 'Data Synced to Cloud Successfully');

					// console.log('Survey Table Deleted');
				});
			}, (err) => {
				// console.log('saveHarvestToCloudFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("saveHarvestToCloudFromSQLite :" + JSON.stringify(e))
		});

	}

	//-----------------------------Locally Used-------------------
	syncHarvestToSQLite(HarvestHistoryList: HarvestHistoryModel[]) {
		// console.log('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS harvest_history(location_name TEXT,bunch_count  INTEGER,created_ts TEXT)', {})
				.then(() =>
					db.executeSql('DELETE FROM harvest_history', null)).then(() => {
						// console.log('Table Deleted');
						// console.log('Locations Count' + masterLocationList.length);
						if (HarvestHistoryList.length > 0) {
							HarvestHistoryList.forEach(surveyRec => {
								// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO harvest_history(location_name,bunch_count,created_ts) VALUES(?,?,?)', [surveyRec.location_name, surveyRec.bunch_count, surveyRec.created_ts])
									.then(() => {
										// console.log('Record Inserted' + surveyRec.location_name);	
									}
									).catch(e => {
										// console.log('syncHarvestToSQLite: ' + JSON.stringify(e))
									});
							});
						}
						// this.showToast('bottom', 'Data Synced to SQLite Successfully');

					}).catch(e => {
						// console.log('syncHarvestToSQLite: ' + JSON.stringify(e))
					});
		}).catch(e => {
			// console.log("syncHarvestToSQLite: " + JSON.stringify(e))
		});
	}
	//-----------------------------End Locally Used-------------------
	getHarvestHistoryFromSQLite(locationSelected: string) {
		// console.log('Inside Get From Lite Function');
		var unloadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql("select * from harvest_history where location_name='" + locationSelected + "'", {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: HarvestHistoryModel = new HarvestHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.created_ts = data.rows.item(i).created_ts;
						unloadItems.push(survey);
					}
				}
			}, (err) => {
				// console.log('getHarvestHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getHarvestHistoryFromSQLite: " + JSON.stringify(e))
		});
		return unloadItems;
	}

	getHarvestFromSQLite(locationSelected: string) {
		// console.log('Inside Get From Lite Function');
		var harvestItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			//------------Change Now to real time-------------
			var query = "select B.location_name,A.bunch_count,strftime('%d/%m/%Y','now') AS created_ts from transact_harvest AS A INNER JOIN user_location AS B on A.location_GUID = B.location_GUID where B.location_name='" + locationSelected + "' ORDER BY A.created_ts DESC";
			console.log(query)
			db.executeSql(query, {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				// console.log(query + '   ' + data.rows.length)
				if (data.rows.length > 0) {
					// console.log(query)
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: HarvestHistoryModel = new HarvestHistoryModel();
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.created_ts = data.rows.item(i).created_ts;
						harvestItems.push(survey);
					}
					console.table(harvestItems)
				}
			}, (err) => {
				console.log('getHarvestFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			console.log("getHarvestFromSQLite: " + JSON.stringify(e))
		});
		return harvestItems;
	}
	syncHarvestHistoryCloudToSQLite() {
		// console.log('Network exists. Saving data to SQLite');
		var url = constants.DREAMFACTORY_TABLE_URL + "/transact_harvest_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&api_key=" + constants.DREAMFACTORY_API_KEY;
		// var url = constants.DREAMFACTORY_TABLE_URL + "/transact_harvest_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
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
							// console.log('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => {
							// console.log('saveLoadToSQLite :' + JSON.stringify(e))
						}));
		}).catch(e => {
			// console.log("saveLoadToSQLite :" + JSON.stringify(e))
		});
	}

	saveLoadToCloudFromSQLite() {
		// console.log('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_loading', {}).then((data) => {
				// console.log('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record ' + (i + 1) + " :" + data.rows.item(i).bunch_count);
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
					// this.showToast('bottom', 'Data Synced to Cloud Successfully');

					// console.log('Survey Table Deleted');
				});
			}, (err) => {
				// console.log('saveLoadToCloudFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("saveLoadToCloudFromSQLite :" + JSON.stringify(e))
		});

	}

	//-----------------------------Locally Used-------------------
	syncLoadToSQLite(LoadHistoryList: LoadHistoryModel[]) {
		// console.log('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS loading_history(location_name TEXT,bunch_count  INTEGER,registration_no INTEGER)', {})
				.then(() =>
					db.executeSql('DELETE FROM loading_history', null)).then(() => {
						// console.log('Table Deleted');
						// console.log('Locations Count' + masterLocationList.length);
						if (LoadHistoryList.length > 0) {
							LoadHistoryList.forEach(surveyRec => {
								// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO loading_history(location_name,bunch_count,registration_no) VALUES(?,?,?)', [surveyRec.location_name, surveyRec.bunch_count, surveyRec.registration_no])
									.then(() => {
										// console.log('Record Inserted' + surveyRec.location_name);	
									}
									).catch(e => {
										// console.log('syncLoadToSQLite: ' + JSON.stringify(e))
									});
							});
						}
						// this.showToast('bottom', 'Data Synced to SQLite Successfully');

					}).catch(e => {
						// console.log('syncLoadToSQLite: ' + JSON.stringify(e))
					});
		}).catch(e => {
			//  console.log("syncLoadToSQLite: " + JSON.stringify(e))
		});
	}
	//-----------------------------End Locally Used-------------------
	getLoadHistoryFromSQLite(locationSelected: string) {
		// console.log('Inside Get From Lite Function');
		var unloadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql("select * from loading_history  where location_name='" + locationSelected + "'", {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: LoadHistoryModel = new LoadHistoryModel();
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.registration_no = data.rows.item(i).registration_no;
						unloadItems.push(survey);
					}
				}
			}, (err) => {
				// console.log('getLoadHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getLoadHistoryFromSQLite: " + JSON.stringify(e))
		});
		return unloadItems;
	}

	getLoadFromSQLite(locationSelected: string) {
		// console.log('Inside Get From Lite Function');
		var loadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			var query = "select Distinct C.vehicle_no AS registration_no ,A.bunch_count from transact_loading AS A INNER JOIN user_location AS B on A.location_GUID = B.location_GUID INNER JOIN vehicle_location AS C on A.vehicle_GUID = C.vehicle_GUID   where B.location_name='" + locationSelected + "' ORDER BY A.created_ts DESC";
			// console.log(query)
			db.executeSql(query, {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				// console.log(query + '   ' + data.rows.length)
				if (data.rows.length > 0) {
					// console.log(query)
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var load: LoadHistoryModel = new LoadHistoryModel();
						load.bunch_count = data.rows.item(i).bunch_count;
						load.registration_no = data.rows.item(i).registration_no;
						loadItems.push(load);
					}
				}
			}, (err) => {
				console.log('getHarvestFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			console.log("getHarvestFromSQLite: " + JSON.stringify(e))
		});
		return loadItems;
	}

	syncLoadHistoryCloudToSQLite() {
		// console.log('Network exists. Saving data to SQLite');
		var url = constants.DREAMFACTORY_TABLE_URL + "/transact_loading_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&api_key=" + constants.DREAMFACTORY_API_KEY;
		// var url = constants.DREAMFACTORY_TABLE_URL + "/transact_loading_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var modelFromCloud = data["resource"];
			var surveyHistoryList: LoadHistoryModel[] = [];
			modelFromCloud.forEach(cloudItem => {
				var surveyHistory: LoadHistoryModel = new LoadHistoryModel();
				surveyHistory.location_name = cloudItem.location_name;
				surveyHistory.bunch_count = cloudItem.bunch_count;
				surveyHistory.registration_no = cloudItem.registration_no;
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
							// console.log('Record Inserted to SQLite' + myModel.bunch_count);
						}).catch(e => console.log('saveUnloadToSQLite :' + JSON.stringify(e))));
		}).catch(e => {
			//  console.log("saveUnloadToSQLite :" + JSON.stringify(e))
		});

	}
	saveUnloadToCloudFromSQLite() {
		// console.log('Inside Survey save to Cloud');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from transact_unloading', {}).then((data) => {
				// console.log('Selected Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record ' + (i + 1) + " :" + data.rows.item(i).bunch_count);
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
					// this.showToast('bottom', 'Data Synced to Cloud Successfully');

					// console.log('Survey Table Deleted');
				});
			}, (err) => {
				// console.log('saveUnloadToCloudFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("saveUnloadToCloudFromSQLite :" + JSON.stringify(e))
		});

	}

	//-----------------------------Locally Used-------------------
	syncFactoryToSQLite(UnloadHistoryList: FactoryHistoryModel[]) {
		// console.log('In Sync Function');
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS factory_history(location_name TEXT,bunch_count  INTEGER,vehicle_no INTEGER)', {})
				.then(() =>
					db.executeSql('DELETE FROM factory_history', null)).then(() => {
						// console.log('Table Deleted');
						// console.log('Locations Count' + masterLocationList.length);
						if (UnloadHistoryList.length > 0) {
							UnloadHistoryList.forEach(surveyRec => {
								// console.log('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
								db.executeSql('INSERT INTO factory_history(location_name,bunch_count,vehicle_no) VALUES(?,?,?)', [surveyRec.location_name, surveyRec.bunch_count, surveyRec.vehicle_no])
									.then(() => {
										// console.log('Record Inserted' + surveyRec.location_name);	
									}
									).catch(e => {
										// console.log('syncFactoryToSQLite: ' + JSON.stringify(e))
									});
							});
						}
						// this.showToast('bottom', 'Data Synced to SQLite Successfully');

					}).catch(e => {
						// console.log('syncFactoryToSQLite: ' + JSON.stringify(e))
					});
		}).catch(e => {
			//  console.log("syncFactoryToSQLite: " + JSON.stringify(e))
		});
	}
	//-----------------------------End Locally Used-------------------
	getUnloadHistoryFromSQLite() {
		// console.log('Inside Get From Lite Function');
		var unloadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('select * from factory_history', {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: FactoryHistoryModel = new FactoryHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.vehicle_no = data.rows.item(i).vehicle_no;
						unloadItems.push(survey);
					}
				}
			}, (err) => {
				// console.log('getUnloadHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getUnloadHistoryFromSQLite: " + JSON.stringify(e))
		});
		return unloadItems;
	}

	getUnloadFromSQLite() {
		// console.log('Inside Get From Lite Function');
		var unloadItems = [];
		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			var query = 'select B.location_name,A.bunch_count, C.vehicle_no from transact_unloading AS  A INNER JOIN master_location AS B on  A.location_GUID = B.location_GUID INNER JOIN master_vehicles AS C ON A.vehicle_GUID=C.vehicle_GUID ORDER BY A.created_ts DESC';
			db.executeSql(query, {}).then((data) => {
				// console.log('Selecting Inserted list from Sqlite');
				if (data.rows.length > 0) {
					// console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						// console.log('Record '+(i+1)+" :"+data.rows.item(i).location_name);
						var survey: FactoryHistoryModel = new FactoryHistoryModel();
						survey.location_name = data.rows.item(i).location_name;
						survey.bunch_count = data.rows.item(i).bunch_count;
						survey.vehicle_no = data.rows.item(i).vehicle_no;
						unloadItems.push(survey);
					}
				}
			}, (err) => {
				// console.log('getUnloadHistoryFromSQLite: ' + JSON.stringify(err));
			});
		}).catch(e => {
			// console.log("getUnloadHistoryFromSQLite: " + JSON.stringify(e))
		});
		return unloadItems;
	}
	syncUnloadHistoryCloudToSQLite() {
		// console.log('Network exists. Saving data to SQLite');
		var url = constants.DREAMFACTORY_TABLE_URL + "/transact_unloading_view?filter=user_GUID=" + localStorage.getItem('loggedIn_user_GUID') + "&limit=20&api_key=" + constants.DREAMFACTORY_API_KEY;
		this.http.get(url).map(res => res.json()).subscribe(data => {
			var modelFromCloud = data["resource"];
			var surveyHistoryList: FactoryHistoryModel[] = [];
			modelFromCloud.forEach(cloudItem => {
				var surveyHistory: FactoryHistoryModel = new FactoryHistoryModel();
				surveyHistory.location_name = cloudItem.location_name;
				surveyHistory.bunch_count = cloudItem.bunch_count;
				surveyHistory.vehicle_no = cloudItem.vehicle_no;
				surveyHistoryList.push(surveyHistory);
			});
			this.syncFactoryToSQLite(surveyHistoryList);
		});
	}
	//--------------------------End Factory Module--------------------------------
	saveToCloud(url: string, myModel: any) {
		// console.log('In Save Cloud');
		var queryHeaders = new Headers();
		queryHeaders.append('Content-Type', 'application/json');
		queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);
		let options = new RequestOptions({ headers: queryHeaders });
		// console.log(url);
		// console.log(myModel);
		this.http
			.post(url, myModel, options)
			.subscribe((response) => {
				// console.log(response);
				// this.showToast('bottom', this.successToast);
				this.showToast('bottom', 'Saved Successfully');

			}, (error) => {
				// console.log(error);
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
	// private storeToken(data) {
	// 	localStorage.setItem('session_token', data.session_token);
	// }
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
		// 	console.log('Saving to Cloud');
		// 	var queryHeaders = new Headers();
		// 	queryHeaders.append('Content-Type', 'application/json');
		// 	queryHeaders.append('X-Dreamfactory-API-Key', "a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7");

		// 	let options = new RequestOptions({ headers: queryHeaders });		
		// 		return this.httpService.http.post('http://api.zen.com.my/api/v2/zenpoc/_table/user2/', user.toJson(true),options)
		// 		.map((data) => {
		// 			console.log('Cloud Save Success');
		// 			return data;
		// 		});		
		// }
	}
	getLocationMasterFromCloud() {
		// console.log('Getting Locations From Cloud. Inside Mediator');
		// let params = new URLSearchParams();
		// params.set('order', 'name+ASC');
		// this.query(params).subscribe((masterLocationsFromCloud: MasterLocationModel[]) => { this.masterLocationList = masterLocationsFromCloud });
		// // console.table(this.masterLocationList);
		// return this.masterLocationList;
	}
	query(params?: URLSearchParams): Observable<MasterLocationModel[]> {
		var url = constants.DREAMFACTORY_TABLE_URL + "/user_location?api_key=a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7";
		// console.log('Getting Locations from Cloud. Inside Service :'+url);
		var queryHeaders = new Headers();
		queryHeaders.append('Content-Type', 'application/json');
		queryHeaders.append('X-Dreamfactory-Session-Token', localStorage.getItem('session_token'));
		queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);
		// console.log('Getting From Cloud');
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
		// console.log('in update with error ha');

		// var queryHeaders = new Headers();
		// queryHeaders.append('Content-Type', 'application/json');
		// queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);

		// let options = new RequestOptions({ headers: queryHeaders });

		// this.http
		// 	.patch(url, myModel.toJson(true), options)
		// 	.subscribe((response) => {
		// 		console.log(response);
		// 		// this.navCtrl.push(HarvestedHistoryPage);

		// 	}, (error) => {
		// 		console.log(error);
		// 	});
	}
	//----------------------End Obsolete Functions-----------------------

}