export class UserImeiModel {
	constructor(
		public user_GUID: string = "",
		public user_IMEI_GUID: string = "",
		public user_mobile_no: string = "",
		public user_IMEI: string = "",
		public module_id: number = null,
		public active:number=null,
		public created_ts: string = null,
		public createdby_GUID: string = null,
		public updatedby_GUID: string = null,
		public updated_ts: string = null
	) { }

	toJson(stringify?: boolean): any {
		var doc = {
			user_GUID: this.user_GUID,
			user_IMEI_GUID: this.user_IMEI_GUID,
			user_mobile_no: this.user_mobile_no,
			user_IMEI: this.user_IMEI,
			module_id: this.module_id,
			active:this.active,
			created_ts: this.created_ts,
			createdby_GUID: this.createdby_GUID,
			updatedby_GUID: this.updatedby_GUID,
			updated_ts: this.updated_ts
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}
}
