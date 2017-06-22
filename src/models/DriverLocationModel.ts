
export class DriverLocationModel {
    constructor(
        public Id: number = null,
        public location_name: string = null,
        public location_GUID: string = null,
        public driver_GUID: string = null,
        public driver_name: string = null,

    ) { }


    static fromJson(json: any) {
        if (!json) return;

        return new DriverLocationModel(
            json.Id,
            json.location_name,
            json.location_GUID,
            json.driver_name,
            json.driver_GUID

        );
    }


    toJson(stringify?: boolean): any {
        var doc = {
            Id: this.Id,
            location_name: this.location_name,
            location_GUID: this.location_GUID,
            driver_name: this.driver_name,
            driver_GUID: this.driver_GUID
        };

        return stringify ? JSON.stringify({ resource: [doc] }) : doc;
    }

}
