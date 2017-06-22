export class FactoryHistoryModel {
	constructor(
		public location_name: string = "",
		public bunch_count: number = null,
		public vehicle_no: number = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			location_name: this.location_name,
			bunch_count: this.bunch_count,
			vehicle_no: this.vehicle_no
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}

