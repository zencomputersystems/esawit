import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { MasterLocationModel } from '../../models/SQLiteSync/MasterLocation';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as constants from '../../config/constants';
import { Network } from '@ionic-native/network';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

class ServerResponse {
	constructor(public resource: any) {
	}
}

@Injectable()
export class StorageService {
	data: any;
	public masterLocationList: MasterLocationModel[] = [];
	constructor(private sqlite: SQLite, private http: Http,  private network: Network) {
	}

	updateRecord(url: string, myModel: any) {
		alert('in update with error ha');

		var queryHeaders = new Headers();
		queryHeaders.append('Content-Type', 'application/json');
		queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);

		let options = new RequestOptions({ headers: queryHeaders });

		this.http
			.patch(url, myModel.toJson(true), options)
			.subscribe((response) => {
				alert(response);
				// this.navCtrl.push(HarvestedHistoryPage);

			}, (error) => {
				alert(error);
			});
	}


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
		alert('In Sync Function');

		this.sqlite.create({ name: 'esawit.db', location: 'default' }).then((db: SQLiteObject) => {
			db.executeSql('CREATE TABLE IF NOT EXISTS master_location(id INTEGER  ,location_GUID TEXT,location_name  TEXT)', {})
				.then(() =>
				// db.executeSql('DELETE FROM master_location', null))				.then(() =>
				{
					console.table(this.masterLocationList);
					alert(masterLocationList.length);
					if (masterLocationList.length > 0) {
						masterLocationList.forEach(locationRec => {
							// alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.location_name);
							db.executeSql('INSERT INTO master_location(id,location_GUID,location_name) VALUES(?,?,?)', [locationRec.Id, locationRec.location_GUID, locationRec.location_name])
								.then(() => {
									// alert('Record Inserted' + locationRec.location_name);	
									locationRec.is_synced = 1;
									this.updateRecord(constants.DREAMFACTORY_TABLE_URL + '/users_location?ids=' + locationRec.Id, locationRec);
								}
								).catch(e => console.log(e));
						});
					}
				}).catch(e => console.log(e));
		}).catch(e => alert("Error " + JSON.stringify(e)));
	}

	getLocationListFromCloud(userIMEI: string) {
		alert('In cloud');
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

	// private storeToken(data) { localStorage.setItem('session_token', data.session_token); }
	// GenerateToken() {
	// 	var queryHeaders = new Headers();
	// 	queryHeaders.append('Content-Type', 'application/json');
	// 	let options = new RequestOptions({ headers: queryHeaders });
	// 	var url = "http://api.zen.com.my/api/v2/user/session";
	// 	this.httpService.http.post(url, '{"email":"sampath415@gmail.com","password":"sampath415"}', options)
	// 		.subscribe((data) => { this.storeToken(data.json()); }, (error) => {
	// 			console.log('Error');
	// 		});
	// }
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

}