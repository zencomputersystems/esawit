export class LoadHistoryModel {
	constructor(
		public location_name: string = "",
		public bunch_count: number = null,
		public registration_no: number = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			location_name: this.location_name,
			bunch_count: this.bunch_count,
			registration_no: this.registration_no
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}

