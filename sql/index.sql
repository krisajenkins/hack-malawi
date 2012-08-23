COPY (
	SELECT
		row_number() OVER ( ORDER BY amp_sector ) AS id,
		longitude,
		latitude,
		precision,
		comulative_commitment AS funding,
		donor,
		status,
		type_of_assistance,
		amp_sector
	FROM malawi
	WHERE longitude IS NOT NULL
	AND latitude IS NOT NULL
	ORDER BY amp_sector
)
TO '/Users/kris/Work/OpenSource/hack-malawi/resources/public/Malawi_Digested.csv'
CSV HEADER;
