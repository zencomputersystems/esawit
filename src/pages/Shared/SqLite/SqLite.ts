import { Component } from '@angular/core';
import { NavController ,NavParams,ViewController,Platform,Alert} from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { user } from '../../../models/user';
//import { URLSearchParams } from '@angular/http';
import {Http, Headers,RequestOptions, URLSearchParams} from '@angular/http';
import { UserService } from '../../../services/UserService';
import {BaseHttpService} from '../../../services/base-http';



import { Network } from '@ionic-native/network';

@Component({
  selector: 'page-home',
  templateUrl: 'SqLite.html', providers: [UserService,BaseHttpService]
})
export class SqLitePage {
public users: user[] = [];
public User: user = new user();

public users_offline: user[] = [];
constructor(private network: Network,private httpService: BaseHttpService,
public navCtrl: NavController,private platform: Platform,
private sqlite: SQLite,private github: UserService,) 
{
  // this.github.isOffline();
  this.GenerateToken() ;
  var token = localStorage.getItem('session_token');
        if (token =='') 
        {
            console.log('Login Plz');
        }
        else
        {
          console.log(token);
        }
        this. getList() ;
        //this.savesample();
 
}

// checkNetwork() 
// {
//     this.platform.ready().then(() => {
//         let alert = Alert.create({
//             title: "Connection Status",
//             subTitle: <string> Network.,
//             buttons: ["OK"]
//         });
//         this.navCtrl.present(alert);
//     });
// }



// savesample()
// {
//   for(var i = 0; i < 2; i++) 
//       {
     
//       this.User.Id=91+i;
//       this.User.FullName="QWERTYU";
//       this.User.Name="SDFGH";
//       this.User.IcNo=1111;
//       this.github.save(this.User).subscribe((response) => { console.log(response)}); 
//       }    
// }
getList() 
{
        let self = this;
        let params = new URLSearchParams();
        params.set('order', 'name+ASC');
        this.github.query(params).subscribe((users: user[]) => {self.users = users});
        console.log(self.users);
}
  
// savedata()
// {
//     var resource = [];
//     for (let i = 1; i < 2; i++)
//     {
//           let newName = {Name:"KUMAR","FullName":"Sampath Kumar","IcNo":23456};          
//           resource.push(newName);
//           // alert(JSON.stringify({ user }));
//           this.User.Id=77;
//           this.User.FullName="QWERTYU";
//           this.User.Name="SDFGH";
//           this.User.IcNo=1111;
//           this.github.save(this.User).subscribe((response) => { console.log(response)});
//     }    
// }
private storeToken(data){localStorage.setItem('session_token', data.session_token);}

GenerateToken() 
{ var queryHeaders = new Headers();
  queryHeaders.append('Content-Type', 'application/json');
  let options = new RequestOptions({ headers: queryHeaders });
  this.httpService.http.post('http://api.zen.com.my/api/v2/user/session', '{"email":"sampath415@gmail.com","password":"sampath415"}',options)
  .subscribe((data) => {this.storeToken(data.json());}, (error) => {
    // console.log('error', JSON.parse(error._body).error.message);
    console.log('Error');
                });
}


username='';
items = [];
save()
{
    this.sqlite.create({name: 'data.db',location: 'default'}).then((db: SQLiteObject) => 
    {
        
        //data insert section
        db.executeSql('CREATE TABLE IF NOT EXISTS usernameList(id INTEGER PRIMARY KEY AUTOINCREMENT,name  text)', {})
        .then(() => alert('usernameList Executed SQL')).catch(e => console.log(e));
        
        // db.executeSql('CREATE TABLE IF NOT EXISTS usernameListLocal(Name,FullName,IcNo,Created)', {})
        // .then(() => alert('usernameListLocal Executed SQL')).catch(e => console.log(e));
        
        // db.executeSql('DELETE FROM usernameList',null);
        
        //data insert section
        db.executeSql('INSERT INTO usernameList(name) VALUES(?)', [this.username])
        .then(() => alert('Executed SQL')).catch(e => console.log(e));
        
        //data retrieve section
        db.executeSql('select * from usernameList', {}).then((data) => 
        {
            //alert(data);
            this.items = [];
            if(data.rows.length > 0) 
            {
              for(var i = 0; i < data.rows.length; i++) 
              {
                alert(data.rows.item(i).name.toString());
                this.items.push({name: data.rows.item(i).name});
                //this.users.push({name: data.rows.item(i).name});
                this.User.Id=21+i;
                this.User.FullName=data.rows.item(i).name;
                this.User.Name=data.rows.item(i).name;
                this.User.IcNo=1111;
                this.github.save(this.User).subscribe((response) => { alert(console.log(response))});  
              }   
           }  
        }, (err) => 
        {
          alert('Unable to execute sql: '+JSON.stringify(err));
        });
        }).catch(e => alert("Error "+JSON.stringify(e)));
alert(this.username);
//this.savesample();
this.getList();
}
}
