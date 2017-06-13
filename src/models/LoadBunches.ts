export class LoadBunchesModel {
	constructor (
			public vehicle_GUID:string = "",
   			public location_GUID:string = "",
               public driver_GUID:string = "",  
               public user_GUID:string ="",       
			public bunch_count:number = null
	) { }
	
	toJson (stringify?: boolean):any {
		var doc = {
			location_GUID: this.location_GUID,
vehicle_GUID:this.vehicle_GUID,
driver_GUID:this.driver_GUID,
user_GUID:this.user_GUID,
			bunch_count: this.bunch_count
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}
