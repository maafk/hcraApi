module.exports = {
	dropHcraTableSQL : "DROP TABLE IF EXISTS electorList;",
	createHcraTableSQL : `CREATE TABLE 
		 IF NOT EXISTS electorList ( 
			changeFlag 		varchar(5),  
			effectiveDate 	DATE, 
			endDate 		DATE, 
			name 			VARCHAR(100), 
			type			VARCHAR(5), 
			fs15			VARCHAR(5), 
			fs16			VARCHAR(5), 
			city			VARCHAR(100), 
			state			VARCHAR(5), 
			contact			VARCHAR(100), 
			phone			VARCHAR(20), 
			message			VARCHAR(100),
			FULLTEXT idx_name (name)
		) ENGINE=InnoDB;`
};