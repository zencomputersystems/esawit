
export class MasterLocationModel 
{
	constructor(
		public Id: number = null,
		public location_name: string = null,
        public location_GUID: string = null,
	) { }


	static fromJson(json: any) {
		if (!json) return;

		return new MasterLocationModel(
			json.Id,
			json.location_name,
			json.location_GUID
		);
	}


	toJson(stringify?: boolean): any {
		var doc = {
			Id: this.Id,
			Name: this.location_name,
            FullName: this.location_GUID
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}

}
