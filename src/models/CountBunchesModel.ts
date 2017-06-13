export class CountBunchesModel {
	constructor(
		public user_GUID: string = "",
		public location_GUID: string = "",
		public bunch_count: number = null,
		public month: number = null,
		public created_ts: Date = null,
		public createdby_GUID: string = null,
		public updatedby_GUID: string = null,
		public updated_ts: Date = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			user_GUID: this.user_GUID,
			location_GUID: this.location_GUID,
			bunch_count: this.bunch_count,
			month: this.month,
			created_ts: this.created_ts,
			createdby_GUID: this.createdby_GUID,
			updatedby_GUID: this.updatedby_GUID,
			updated_ts: this.updated_ts
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}
