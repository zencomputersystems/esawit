import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';

import {NavController} from 'ionic-angular';
import {Sqlite} from '../../../providers/Db/sqlite';
import {SurveyDbModel} from '../../../models/SurveyDbModel'

@Component(
    {
        selector: 'page-home', 
        templateUrl: 'MySqlite.html'
    })

export class MySqlitePage {
    survey:SurveyDbModel = new SurveyDbModel();
  public surveyList:SurveyDbModel[] = [];
  public locationInput : any;
  constructor(public navCtrl : NavController, public sqliteService : Sqlite, protected platform : Platform) {
  }

  addSurvey(location) {
      this.survey.location_GUID = location;
      this.survey.bunch_count = 432;
          alert('Before leaving MySqlite');

    this      .sqliteService      .addRecord(this.survey);     
    alert('Inside MySqlite');
    alert(this.survey.location_GUID);   
//  this.sqliteService.getAll().then((data) => 
//         {
//             console.table(data);
//                   var count = data.rows.length;
//             if(count > 0) 
//             {
//               for(var i = 0; i < count; i++) 
//               {
//                 alert(data.rows.item(i).name.toString());
//                 this.survey.Id = data.rows.item(i).id;
//                 this.survey.location_GUID = data.rows.item(i).location_GUID;
//                 this.survey.bunch_count = data.rows.item(i).bunch_count;
//                 this.surveyList.push(this.survey);            
//                 // this.github.save(this.User).subscribe((response) => { alert(alert(response))});  
//               }   
//            }  
//         }, (err) => 
//         {
//           alert('Unable to execute sql: '+JSON.stringify(err));
//         });
      this.locationInput = '';
//   this.surveyList=    this.sqliteService.getAll();

  }

//   delete(location) {
//     this
//       .sqliteService
//       .deleteRecord(location)
//       .then(s => {
//         this.locationFromDb = this.sqliteService.locationList;
//       });
//   }

//   update(id, todo) {
//     var prompt = window.prompt('Update', todo);
//     this
//       .sqliteService
//       .updateRecord(id, prompt)
//       .then(s => {
//         this.locationFromDb = this.sqliteService.locationList;
//       });
//   }

}
