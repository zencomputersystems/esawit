
export class VehicleDriverModel {
    constructor(
        public Id: number = null,
        public vehicle_no: string = null,
        public vehicle_GUID: string = null,
        public driver_GUID: string = null,
        public driver_name: string = null,

    ) { }


    static fromJson(json: any) {
        if (!json) return;

        return new VehicleDriverModel(
            json.Id,
            json.vehicle_no,
            json.vehicle_GUID,
            json.driver_name,
            json.driver_GUID

        );
    }


    toJson(stringify?: boolean): any {
        var doc = {
            Id: this.Id,
            vehicle_no: this.vehicle_no,
            vehicle_GUID: this.vehicle_GUID,
            driver_name: this.driver_name,
            driver_GUID: this.driver_GUID
        };

        return stringify ? JSON.stringify({ resource: [doc] }) : doc;
    }

}
