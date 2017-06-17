import { Component } from '@angular/core';
import { NavController ,NavParams,ViewController,Platform,Alert} from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { MasterLocationModel } from '../../../models/SQLiteSync/MasterLocation';
import {Http, Headers,RequestOptions, URLSearchParams} from '@angular/http';
import { StorageService } from '../../../providers/Db/StorageFunctions';
import {BaseHttpService} from '../../../services/base-http';
import { Network } from '@ionic-native/network';
import * as constants from '../../../config/constants';

@Component({
  selector: 'page-home',
  templateUrl: 'SqLite.html', providers: [StorageService,BaseHttpService]
})
export class SqLitePage {

public masterLocationList: MasterLocationModel[] = [];
public masterLocation: MasterLocationModel = new MasterLocationModel();
storageLocationItems = [];

constructor(private network: Network,private httpService: BaseHttpService,
public navCtrl: NavController,private platform: Platform,
private sqlite: SQLite,private myCloud: StorageService,) 
{
   this.GenerateToken() ; 
  var token = localStorage.getItem('session_token'); 
        if (token =='')  
        { 
           alert('Please Login');
        } 
        else 
        { 
          console.log(token); 
          this.getLocationListFromCloud();
this.syncMasterLocation();
        } 
}

syncMasterLocation(){
    this.sqlite.create({name: 'esawit.db',location: 'default'}).then((db: SQLiteObject) => 
    {        
        db.executeSql('CREATE TABLE IF NOT EXISTS master_location(id INTEGER PRIMARY KEY AUTOINCREMENT,location_GUID TEXT,name  TEXT)', {})
        .then(()=>  db.executeSql('DELETE FROM master_location',null) )        
        .then(() => 
        {
          // alert('Master Location Table Created');

           if(this.masterLocationList.length > 0) 
            {
              this.masterLocationList.forEach(locationRec => {
                alert('Record'+locationRec.Id+" :"+locationRec.Id+"."+locationRec.location_GUID+"=>"+locationRec.name);
                  db.executeSql('INSERT INTO master_location(location_GUID,name) VALUES(?,?)', [locationRec.location_GUID,locationRec.name])
        .then(() => {
        // alert('Record Inserted'+locationRec.Id)

        db.executeSql('select * from master_location', {}).then((data) => 
        {
            this.storageLocationItems = [];
            // alert('Selecting Inserted list from Sqlite');
            if(data.rows.length > 0) 
            {
              for(var i = 0; i < data.rows.length; i++) 
              {
                // alert('Record '+(i+1)+" :"+data.rows.item(i).name.toString());
                this.storageLocationItems.push({name: data.rows.item(i).name});              
                // alert('Before Saving to Cloud');
              }   
           }   
        }, (err) => 
        {
          alert('Unable to execute sql: '+JSON.stringify(err));
        });

        }
        ).catch(e => console.log(e));

 

              });             
           }
        }).catch(e => console.log(e));      
       

        }).catch(e => alert("Error "+JSON.stringify(e)));
}

getLocationListFromCloud() 
{
  // alert('Getting Locations From Cloud. Inside Mediator');
        let params = new URLSearchParams();
        params.set('order', 'name+ASC');
        this.myCloud.query(params).subscribe((masterLocationsFromCloud: MasterLocationModel[]) => {this.masterLocationList = masterLocationsFromCloud});
        console.table(this.masterLocationList);
}
private storeToken(data){localStorage.setItem('session_token', data.session_token);}
 
GenerateToken()  
{ 
  var queryHeaders = new Headers(); 
  queryHeaders.append('Content-Type', 'application/json'); 
  let options = new RequestOptions({ headers: queryHeaders }); 
      var url = "http://api.zen.com.my/api/v2/user/session";
  this.httpService.http.post(url, '{"email":"sampath415@gmail.com","password":"sampath415"}',options)
  .subscribe((data) => {this.storeToken(data.json());}, (error) => { 
    console.log('Error'); 
                }); 
}
 
// save()
// {
//     this.sqlite.create({name: 'esawit.db',location: 'default'}).then((db: SQLiteObject) => 
//     {        
//         db.executeSql('CREATE TABLE IF NOT EXISTS master_location(id INTEGER PRIMARY KEY AUTOINCREMENT,location_GUID TEXT,name  TEXT)', {})
//         .then(() => alert('Master Location Table Created')).catch(e => console.log(e));
        
//         // db.executeSql('INSERT INTO usernameList(name) VALUES(?)', [this.username])
//         // .then(() => alert('Given Name Stored into Sqlite '+this.username)).catch(e => console.log(e));

//         db.executeSql('select * from usernameList', {}).then((data) => 
//         {
//             this.storageItems = [];
//             alert('Selecting Inserted list from Sqlite');
//             if(data.rows.length > 0) 
//             {
//               for(var i = 0; i < data.rows.length; i++) 
//               {
//                 alert('Record '+(i+1)+" :"+data.rows.item(i).name.toString());
//                 this.storageItems.push({name: data.rows.item(i).name});
//                 this.User.Id=21+i;
//                 this.User.FullName=data.rows.item(i).name;
//                 this.User.Name=data.rows.item(i).name;
//                 this.User.IcNo=1111;
//                 alert('Before Saving to Cloud');
//                 this.github.save(this.User).subscribe((response) => { alert(response)});  
//               }   
//            }
//            this.getList();
//            db.executeSql('DELETE FROM usernameList',null)
//            .then(() => alert('Sqlite Table data removed')).catch(e => console.log(e));
//         }, (err) => 
//         {
//           alert('Unable to execute sql: '+JSON.stringify(err));
//         });
//         }).catch(e => alert("Error "+JSON.stringify(e)));

// }
}
