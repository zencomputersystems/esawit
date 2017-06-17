
export class SurveyDbModel 
{
	constructor(
		public Id: number = null,
		public location_GUID: string = null,
        public bunch_count: number = null,
	) { }


	static fromJson(json: any) {
		if (!json) return;

		return new SurveyDbModel(
			json.Id,
			json.location_GUID,
			json.bunch_count,
		);
	}


	toJson(stringify?: boolean): any {
		var doc = {
			Id: this.Id,
			Name: this.location_GUID,
            FullName: this.bunch_count,
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}

}
