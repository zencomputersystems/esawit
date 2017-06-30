
export class VehicleLocationModel {
    constructor(
        public Id: number = null,
        public location_name: string = null,
        public location_GUID: string = null,
        public vehicle_GUID: string = null,
        public vehicle_no: string = null,

    ) { }


    static fromJson(json: any) {
        if (!json) return;

        return new VehicleLocationModel(
            json.Id,
            json.location_name,
            json.location_GUID,
            json.vehicle_no,
            json.vehicle_GUID

        );
    }


    toJson(stringify?: boolean): any {
        var doc = {
            Id: this.Id,
            location_name: this.location_name,
            location_GUID: this.location_GUID,
            vehicel_no: this.vehicle_no,
            vehicle_GUID: this.vehicle_GUID
        };

        return stringify ? JSON.stringify({ resource: [doc] }) : doc;
    }

}
