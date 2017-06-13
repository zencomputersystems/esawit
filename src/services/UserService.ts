import {Injectable} from '@angular/core';  
import {Http, Headers,RequestOptions, URLSearchParams} from '@angular/http';
import {user} from '../models/user';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {BaseHttpService} from './base-http';

import { Network } from '@ionic-native/network';


class ServerResponse {
	constructor(public resource: any) {
	}
};

@Injectable()
export class UserService 
{  
    data :any;
    constructor(private http: Http,private httpService: BaseHttpService,private network: Network) { }

    
    
    
	

    private handleError (error: any) {
	   let errMsg = (error.message) ? error.message :
	   error.status ? `${error.status} - ${error.statusText}` : 'Server error';
	   console.log(errMsg); // log to console instead
	   localStorage.setItem('session_token', '');       
	  return Observable.throw(errMsg);
	}
    
    save (user: user) 
	{
		var queryHeaders = new Headers();
    	queryHeaders.append('Content-Type', 'application/json');
    	queryHeaders.append('X-Dreamfactory-Session-Token', localStorage.getItem('session_token'));
    	queryHeaders.append('X-Dreamfactory-API-Key', "a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7");
    	
    	let options = new RequestOptions({ headers: queryHeaders });

		
			return this.httpService.http.post('http://api.zen.com.my/api/v2/zenpoc/_table/user2/', user.toJson(true),options)
			.map((data) => {
				return data;
			});
		
	}


    query(params?: URLSearchParams): Observable<user[]> 
	{
		var queryHeaders = new Headers();
    	queryHeaders.append('Content-Type', 'application/json');
		queryHeaders.append('X-Dreamfactory-Session-Token', localStorage.getItem('session_token'));
    	queryHeaders.append('X-Dreamfactory-API-Key', "a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7");  
		return this.http
			.get("http://api.zen.com.my/api/v2/zenpoc/_table/user2?api_key=a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7")
			.map((response) => {
				var result: ServerResponse = response.json();
				let users: Array<user> = [];
				result.resource.forEach((person) => {
					users.push(user.fromJson(person));
				});
				return users;
			}).catch(this.handleError);
	};

	remove(PersonID: string) {
		var queryHeaders = new Headers();
    	queryHeaders.append('Content-Type', 'application/json');
    	queryHeaders.append('X-Dreamfactory-Session-Token', localStorage.getItem('session_token'));
    	queryHeaders.append('X-Dreamfactory-API-Key', "constants.DREAMFACTORY_API_KEY");
		return this.http
			.delete("http://api.zen.com.my/api/v2/zenpoc/_table/harvest/"+PersonID+"?api_key=a7b6d4c78c4f5280f861fd14d62b01f955f867f98f2bc4bf87ae8c71689263d7")
			.map((response) => {
				var result: any = response.json();
				return result.PersonID;
			});
	}
    
	DisplayNetwork()
	{
		let networktype=this.network.type
        console.log(networktype);
	}
    
	isOffline() 
	{
	    console.log(navigator.onLine);
	}

	check_connection()
	{
		// watch network for a disconnect
		let disconnectSubscription = this.network.onDisconnect().subscribe(() => 
		{
        alert(console.log('network was disconnected :-('));
	});

		// stop disconnect watch
        disconnectSubscription.unsubscribe();

		// watch network for a connection
		let connectSubscription = this.network.onConnect().subscribe(() => {
		  alert(console.log('network connected!'));
		  // We just got a connection but we need to wait briefly
		   // before we determine the connection type. Might need to wait.
		  // prior to doing any api requests as well.
		  setTimeout(() => {
		    if (this.network.type === 'wifi') {
		      console.log('we got a wifi connection, woohoo!');
		    }
		  }, 3000);
		});

		// stop connect watch
		connectSubscription.unsubscribe();
	}
}