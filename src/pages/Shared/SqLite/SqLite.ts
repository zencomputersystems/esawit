import { Component } from '@angular/core';
import { NavController ,NavParams,ViewController,Platform,Alert} from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { user } from '../../../models/user';
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
username='';
items = [];

constructor(private network: Network,private httpService: BaseHttpService,
public navCtrl: NavController,private platform: Platform,
private sqlite: SQLite,private github: UserService,) 
{
 this.getList();
}

getList() 
{
  alert('Getting List From Cloud. Inside Function');
        let params = new URLSearchParams();
        params.set('order', 'name+ASC');
        this.github.query(params).subscribe((usersFromCloud: user[]) => {this.users = usersFromCloud});
        console.table(this.users);
}
 


save()
{
    this.sqlite.create({name: 'data.db',location: 'default'}).then((db: SQLiteObject) => 
    {        
        db.executeSql('CREATE TABLE IF NOT EXISTS usernameList(id INTEGER PRIMARY KEY AUTOINCREMENT,name  text)', {})
        .then(() => alert('usernameList Table Created')).catch(e => console.log(e));
        
        db.executeSql('INSERT INTO usernameList(name) VALUES(?)', [this.username])
        .then(() => alert('Given Name Stored into Sqlite '+this.username)).catch(e => console.log(e));

        db.executeSql('select * from usernameList', {}).then((data) => 
        {
            this.items = [];
            alert('Selecting Inserted list from Sqlite');
            if(data.rows.length > 0) 
            {
              for(var i = 0; i < data.rows.length; i++) 
              {
                alert('Record '+(i+1)+" :"+data.rows.item(i).name.toString());
                this.items.push({name: data.rows.item(i).name});
                this.User.Id=21+i;
                this.User.FullName=data.rows.item(i).name;
                this.User.Name=data.rows.item(i).name;
                this.User.IcNo=1111;
                alert('Before Saving to Cloud');
                this.github.save(this.User).subscribe((response) => { alert(response)});  
              }   
           }
           this.getList();
           db.executeSql('DELETE FROM usernameList',null)
           .then(() => alert('Sqlite Table data removed')).catch(e => console.log(e));
        }, (err) => 
        {
          alert('Unable to execute sql: '+JSON.stringify(err));
        });
        }).catch(e => alert("Error "+JSON.stringify(e)));

}
}
