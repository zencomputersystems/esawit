export class MasterVehicleModel {
	constructor(
		public Id: number = null,
		public vehicle_no: string = null,
		public vehicle_GUID: string = null
	) { }
	static fromJson(json: any) {
		if (!json) return;
		return new MasterVehicleModel(
			json.Id,
			json.vehicle_no,
			json.vehicle_GUID
		);
	}
	toJson(stringify?: boolean): any {
		var doc = {
			Id: this.Id,
			location_name: this.vehicle_no,
			location_GUID: this.vehicle_GUID
		};
		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}
