export class HarvestHistoryModel {
	constructor(
		public location_name: string = "",
		public bunch_count: number = null,
		public created_ts: number = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			location_name: this.location_name,
			bunch_count: this.bunch_count,
			created_ts: this.created_ts
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}

