export class HarvestBunchesModel {
	constructor(
		public location_GUID: string = "",
		public bunch_count: number = null,
		public created_ts: Date = null,
		public createdby_GUID: string = null,
		public updatedby_GUID: string = null,
		public updated_ts: Date = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			location_GUID: this.location_GUID,
			bunch_count: this.bunch_count,
			created_ts: this.created_ts,
			createdby_GUID: this.createdby_GUID,
			updatedby_GUID: this.updatedby_GUID,
			updated_ts: this.updated_ts
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}
