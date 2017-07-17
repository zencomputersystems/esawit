export class HarvestInfoLocal {
	constructor(
		public harvest_date: string = null,
		public location_GUID: string = null,
		public bunch_count: string = null

	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			harvest_date: this.harvest_date,
			location_GUID: this.location_GUID,
			bunch_count: this.bunch_count
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}

