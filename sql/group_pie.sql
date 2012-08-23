COPY (
	SELECT
		row_number() OVER ( ORDER BY donor ) AS id,
		sum( coalesce( comulative_commitment, 0 ) ) AS pledged,
		sum( coalesce( cumulative_disbursement, 0 ) ) AS funded,
		donor
	FROM malawi
	GROUP BY
		donor
	ORDER BY
		pledged DESC,
		funded DESC,
		donor
	LIMIT 20
)
TO '/Users/kris/Work/OpenSource/hack-malawi/resources/public/group_pie.csv'
CSV HEADER
;
