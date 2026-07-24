-- Support database-side retention sorting by outreach priority without full-table scans.

ALTER TABLE public.provider_metrics
  ADD COLUMN IF NOT EXISTS outreach_priority_rank smallint GENERATED ALWAYS AS (
    CASE outreach_priority
      WHEN 'High' THEN 0
      WHEN 'Medium' THEN 1
      WHEN 'Low' THEN 2
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS provider_metrics_reporting_priority_rank_idx
  ON public.provider_metrics (reporting_date, outreach_priority_rank, provider_id);

CREATE INDEX IF NOT EXISTS county_age_metrics_reporting_date_idx
  ON public.county_age_metrics (reporting_date);

CREATE INDEX IF NOT EXISTS county_metrics_reporting_date_idx
  ON public.county_metrics (reporting_date);
