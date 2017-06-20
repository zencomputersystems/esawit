export class LoadBunchesModel {
	constructor(
		public user_GUID: string = "",
		public vehicle_GUID: string = "",
		public location_GUID: string = "",
		public driver_GUID: string = "",
		public bunch_count: number = null,
		public created_ts: string = null,
		public createdby_GUID: string = null,
		public updatedby_GUID: string = null,
		public updated_ts: string = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			user_GUID: this.user_GUID,
			location_GUID: this.location_GUID,
			vehicle_GUID: this.vehicle_GUID,
			driver_GUID: this.driver_GUID,
			bunch_count: this.bunch_count,
			created_ts: this.created_ts,
			createdby_GUID: this.createdby_GUID,
			updatedby_GUID: this.updatedby_GUID,
			updated_ts: this.updated_ts
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}
