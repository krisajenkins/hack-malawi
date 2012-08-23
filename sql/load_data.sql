DROP TABLE malawi;
CREATE TABLE malawi (
	amp_project_id             TEXT NOT NULL,
	latitude                   TEXT,
	longitude                  TEXT,
	precision                  TEXT NOT NULL,
	geonameid                  TEXT NOT NULL,
	geoname                    TEXT NOT NULL,
	adm1_id                    TEXT,
	adm1_name                  TEXT,
	adm2_id                    TEXT,
	adm2_name                  TEXT,
	donor                      TEXT NOT NULL,
	recipient                  TEXT NOT NULL,
	project_name               TEXT NOT NULL,
	status                     TEXT NOT NULL,
	date_of_agreement_signed   TEXT,
	date_of_planned_completion TEXT,
	comulative_commitment      TEXT,
	cumulative_disbursement    TEXT,
	type_of_assistance         TEXT NOT NULL,
	amp_sector                 TEXT NOT NULL,
	mdgs1                      TEXT NOT NULL,
	aiddata_sector             TEXT ,
	aiddata_purpose_code       TEXT,
	aiddata_purpose_name       TEXT NOT NULL,
	has_feasibility_study      TEXT,
	has_technical_assistance   TEXT NOT NULL,
	aiddata_activity_codes     TEXT NOT NULL,
	aiddata_activity_names     TEXT NOT NULL
);

COPY malawi FROM '/Users/kris/Work/OpenSource/hack-malawi/resources/public/Malawi_release_17april2012.csv' CSV HEADER;

ALTER TABLE malawi ALTER COLUMN has_feasibility_study TYPE boolean USING CASE
	WHEN has_feasibility_study = '1' THEN true
	ELSE false
END;

ALTER TABLE malawi ALTER COLUMN has_technical_assistance TYPE boolean USING CASE
	WHEN has_technical_assistance = '1' THEN true
	ELSE false
END;

ALTER TABLE malawi ALTER COLUMN aiddata_purpose_code TYPE int USING CASE
	WHEN aiddata_purpose_code = '#N/A' THEN null
	ELSE aiddata_purpose_code::integer
END;

ALTER TABLE malawi ALTER COLUMN comulative_commitment TYPE numeric USING CASE
	WHEN comulative_commitment ~ '^\s*\$-\s*$' THEN null
	WHEN comulative_commitment ~ '^\s*$' THEN null
	ELSE replace(comulative_commitment,',','')::numeric
END;

ALTER TABLE malawi ALTER COLUMN cumulative_disbursement TYPE numeric USING CASE
	WHEN cumulative_disbursement ~ '^\s*\$-\s*$' THEN null
	WHEN cumulative_disbursement ~ '^\s*$' THEN null
	ELSE replace(cumulative_disbursement,',','')::numeric
END;

ALTER TABLE malawi ALTER COLUMN date_of_agreement_signed TYPE date USING to_date( date_of_agreement_signed, 'YYYY' );
ALTER TABLE malawi ALTER COLUMN date_of_planned_completion TYPE date USING to_date( date_of_planned_completion, 'YYYY' );

ALTER TABLE malawi ALTER COLUMN geonameid      TYPE numeric USING cast( geonameid AS numeric );
ALTER TABLE malawi ALTER COLUMN amp_project_id TYPE numeric USING cast( amp_project_id AS numeric );
ALTER TABLE malawi ALTER COLUMN adm1_id        TYPE int USING cast( adm1_id AS int );
ALTER TABLE malawi ALTER COLUMN adm2_id        TYPE int USING cast( adm2_id AS int );
ALTER TABLE malawi ALTER COLUMN latitude       TYPE numeric USING cast( latitude AS numeric );
ALTER TABLE malawi ALTER COLUMN longitude      TYPE numeric USING cast( longitude AS numeric );
