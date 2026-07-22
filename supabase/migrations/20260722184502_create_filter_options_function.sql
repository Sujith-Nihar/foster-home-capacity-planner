-- Shared filter option values for recruitment and retention pages.

CREATE OR REPLACE FUNCTION public.get_application_filter_options(
  reporting_date_param date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH active_reporting_date AS (
    SELECT COALESCE(
      reporting_date_param,
      (SELECT reporting_date FROM public.system_snapshot ORDER BY reporting_date DESC LIMIT 1)
    ) AS reporting_date
  )
  SELECT jsonb_build_object(
    'reporting_date', ard.reporting_date,
    'counties',
      COALESCE(
        (
          SELECT jsonb_agg(county ORDER BY county)
          FROM (
            SELECT DISTINCT county
            FROM public.county_metrics
            WHERE reporting_date = ard.reporting_date
          ) counties
        ),
        '[]'::jsonb
      ),
    'recruitment_priorities',
      COALESCE(
        (
          SELECT jsonb_agg(recruitment_priority ORDER BY recruitment_priority)
          FROM (
            SELECT DISTINCT recruitment_priority
            FROM public.county_metrics
            WHERE reporting_date = ard.reporting_date
          ) priorities
        ),
        '[]'::jsonb
      ),
    'outreach_priorities',
      COALESCE(
        (
          SELECT jsonb_agg(outreach_priority ORDER BY outreach_priority)
          FROM (
            SELECT DISTINCT outreach_priority
            FROM public.provider_metrics
            WHERE reporting_date = ard.reporting_date
          ) priorities
        ),
        '[]'::jsonb
      ),
    'age_groups',
      to_jsonb(ARRAY['0–5', '6–12', '13–17', 'Unknown']::text[])
  )
  FROM active_reporting_date ard;
$$;

COMMENT ON FUNCTION public.get_application_filter_options(date) IS
  'Returns distinct county and priority filter values for the active reporting-date snapshot.';

GRANT EXECUTE ON FUNCTION public.get_application_filter_options(date) TO anon;
