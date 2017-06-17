import {Injectable} from '@angular/core';  
import {Http, Headers,RequestOptions, URLSearchParams} from '@angular/http';
import { MasterLocationModel } from '../../models/SQLiteSync/MasterLocation';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {BaseHttpService} from '../../services/base-http';
import * as constants from '../../config/constants';
import { Network } from '@ionic-native/network';

class ServerResponse {
	constructor(public resource: any) {
	}
};

@Injectable()
export class StorageService 
{  
    data :any;
    constructor(private http: Http,private httpService: BaseHttpService,private network: Network) { }
  
	

    // private handleError (error: any) {
	//    let errMsg = (error.message) ? error.message :
	//    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
	//    console.log(errMsg); // log to console instead
	//    localStorage.setItem('session_token', '');       
	//   return Observable.throw(errMsg);
	// }
    
    save (user: MasterLocationModel) 
	{
		alert('Saving to Cloud');
		var queryHeaders = new Headers();
    	queryHeaders.append('Content-Type', 'application/json');
    	queryHeaders.append('X-Dreamfactory-API-Key', "a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7");
 
    	let options = new RequestOptions({ headers: queryHeaders });		
			return this.httpService.http.post('http://api.zen.com.my/api/v2/zenpoc/_table/user2/', user.toJson(true),options)
			.map((data) => {
				alert('Cloud Save Success');
				return data;
			});		
	}

    query(params?: URLSearchParams): Observable<MasterLocationModel[]> 
	{
    var url = constants.DREAMFACTORY_TABLE_URL + "/master_location?api_key=a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7";
        // alert('Getting Locations from Cloud. Inside Service :'+url);
		var queryHeaders = new Headers();
    	queryHeaders.append('Content-Type', 'application/json');
            	  queryHeaders.append('X-Dreamfactory-Session-Token', localStorage.getItem('session_token'));
    	queryHeaders.append('X-Dreamfactory-API-Key',  constants.DREAMFACTORY_API_KEY);  
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
	};
 
	

}