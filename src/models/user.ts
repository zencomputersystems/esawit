
export class user 
{
	constructor(
		public Id: number = null,
		public Name: string = null,
        public FullName: string = null,
        public IcNo: number = null
        //public Created: Date = null
	) { }


	static fromJson(json: any) {
		if (!json) return;

		return new user(
			json.Id,
			json.Name,
			json.FullName,
			json.IcNo
			//json.Created
		);
	}


	toJson(stringify?: boolean): any {
		var doc = {
			Id: this.Id,
			Name: this.Name,
            FullName: this.FullName,
			IcNo: this.IcNo
            //Created: this.Created
		};

		return stringify ? JSON.stringify({ resource: [doc] }) : doc;
	}

}
