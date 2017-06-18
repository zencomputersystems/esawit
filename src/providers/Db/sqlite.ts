import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SurveyDbModel } from '../../models/SurveyDbModel'
@Injectable()
export class Sqlite {

  db: any = new SQLite();
  surveyList: SurveyDbModel[] = [];
  survey: SurveyDbModel = new SurveyDbModel();

  constructor(public sqlite: SQLite) {
    let sql = 'CREATE TABLE IF NOT EXISTS transact_survey (id INTEGER PRIMARY KEY AUTOINCREMENT, location_GUID TEXT, bunch_count INTEGER)';

    this.sqlite.create({
      name: 'esawit.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql(sql, {})
          .then(() => {
            alert('Table Created');
          })
          .catch(e => alert("Error " + JSON.stringify(e)));
      })
      .catch(e => alert("Error " + JSON.stringify(e)));
  }


  getAll() {
    let sql = 'SELECT * FROM transact_survey';
    alert('Inside Get All');
    this.sqlite.create({
      name: 'esawit.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        return db.executeSql(sql, []).then((data) => {
          var count = data.rows.length;
          alert('Rows Length' + count);

          if (count > 0) {
            alert('In If');
            for (var i = 0; i <= count; i++) {
              alert('in for' + i);
              alert('Get' + data.rows.item(i).location_GUID);
              this.survey.Id = data.rows.item(i).id;
              this.survey.location_GUID = data.rows.item(i).location_GUID;
              this.survey.bunch_count = data.rows.item(i).bunch_count;
              this.surveyList.push(this.survey);
              // this.github.save(this.User).subscribe((response) => { alert(alert(response))});  
            }
          }
        }, (err) => {
          alert('Unable to execute sql: ' + JSON.stringify(err));
        });
      }).catch(e => alert("Error " + JSON.stringify(e)));
    return this.surveyList;

  }

  addRecord(survey: any) {
    let sql = 'INSERT INTO transact_survey(location_GUID, bunch_count) VALUES (?, ?)';
    this.sqlite.create({
      name: 'esawit.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      alert('Before insert' + survey.location_GUID);
      db.executeSql(sql, [survey.location_GUID, survey.bunch_count])
        .then(() => {
          alert("Data Inserted");
        })
        .catch(e => alert(e));
    });
    this.getAll();
  }


  //   createTable(dbLite:any) {
  //   let sql = 'CREATE TABLE IF NOT EXISTS transact_survey (id INTEGER PRIMARY KEY AUTOINCREMENT, location_GUID TEXT, bunch_count INTEGER)';
  //     //  let sql = 'CREATE TABLE IF NOT EXISTS transact_survey (id INTEGER PRIMARY KEY AUTOINCREMENT, user_GUID TEXT, month INTEGER,location_GUID TEXT, bunch_count INTEGER, created_ts TEXT)';

  //    dbLite.then((db: SQLiteObject) => {
  //    db  .executeSql(sql, []) .then(() => {
  //           alert('Table Created');
  //         }).catch(e => alert("Error "+JSON.stringify(e)));
  // }).catch(e => alert("Error "+JSON.stringify(e)));
  // }

  // getAll() {
  //   let sql = 'SELECT * FROM transact_survey';
  //   return this.sqlite.create({
  //     name: 'esawit.db',
  //     location: 'default'
  //   })
  //     .then((db: SQLiteObject) => {
  //       return db.executeSql(sql, []);
  //     })
  //     .catch(e => alert(e));
  // }

  // update(task: any) {
  //   let sql = 'UPDATE tasks SET title = ?, completed = ? WHERE id = ?';
  //   return this.db.executeSql(sql, [task.title, task.completed, task.id]);
  // }

  // delete(task: any) {
  //   let sql = 'DELETE FROM tasks WHERE id = ?';
  //   return this.db.executeSql(sql, [task.id]);
  // }
}