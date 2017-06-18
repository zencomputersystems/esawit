export class SurveyHistoryModel {
	constructor(
		public location_name: string = "",
		public bunch_count: number = null,
		public month: number = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			location_name: this.location_name,
			bunch_count: this.bunch_count,
			month: this.month
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}

