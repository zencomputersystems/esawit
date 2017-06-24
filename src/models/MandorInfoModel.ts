export class MandorInfoModel {
	constructor(
		public total_harvested: number = null,
		public total_loaded: number = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			total_harvested: this.total_harvested,
			total_loaded: this.total_loaded
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}

