-- Row level security and anonymous read-only access for assessment deployment.

ALTER TABLE public.dataset_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.county_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.county_age_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_activity_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY dataset_metadata_anon_select
  ON public.dataset_metadata
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY system_snapshot_anon_select
  ON public.system_snapshot
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY county_metrics_anon_select
  ON public.county_metrics
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY county_age_metrics_anon_select
  ON public.county_age_metrics
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY provider_metrics_anon_select
  ON public.provider_metrics
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY provider_activity_periods_anon_select
  ON public.provider_activity_periods
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY monthly_metrics_anon_select
  ON public.monthly_metrics
  FOR SELECT
  TO anon
  USING (true);

GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON TABLE public.dataset_metadata TO anon;
GRANT SELECT ON TABLE public.system_snapshot TO anon;
GRANT SELECT ON TABLE public.county_metrics TO anon;
GRANT SELECT ON TABLE public.county_age_metrics TO anon;
GRANT SELECT ON TABLE public.provider_metrics TO anon;
GRANT SELECT ON TABLE public.provider_activity_periods TO anon;
GRANT SELECT ON TABLE public.monthly_metrics TO anon;
