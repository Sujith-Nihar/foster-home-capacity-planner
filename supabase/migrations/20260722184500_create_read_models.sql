-- Foster Home Capacity Planner read models
-- Processed, deidentified tables loaded from local ETL output.

-- ---------------------------------------------------------------------------
-- dataset_metadata
-- ---------------------------------------------------------------------------
CREATE TABLE public.dataset_metadata (
  dataset_version text NOT NULL,
  reporting_date date NOT NULL,
  generated_at timestamptz NOT NULL,
  provider_source_hash text NOT NULL,
  child_source_hash text NOT NULL,
  placement_source_hash text NOT NULL,
  source_hash text NOT NULL,
  etl_version text NOT NULL,
  provider_count integer NOT NULL,
  child_count integer NOT NULL,
  placement_count integer NOT NULL,

  CONSTRAINT dataset_metadata_pkey PRIMARY KEY (dataset_version),
  CONSTRAINT dataset_metadata_provider_count_non_negative CHECK (provider_count >= 0),
  CONSTRAINT dataset_metadata_child_count_non_negative CHECK (child_count >= 0),
  CONSTRAINT dataset_metadata_placement_count_non_negative CHECK (placement_count >= 0),
  CONSTRAINT dataset_metadata_reporting_date_key UNIQUE (reporting_date)
);

COMMENT ON TABLE public.dataset_metadata IS
  'Active processed dataset provenance and source-file fingerprints.';
COMMENT ON COLUMN public.dataset_metadata.source_hash IS
  'Combined SHA-256 hash of the three raw source CSV files.';
COMMENT ON COLUMN public.dataset_metadata.generated_at IS
  'UTC timestamp when the local ETL generated the processed snapshot.';

-- ---------------------------------------------------------------------------
-- system_snapshot
-- ---------------------------------------------------------------------------
CREATE TABLE public.system_snapshot (
  reporting_date date NOT NULL,
  current_children_in_care integer NOT NULL,
  current_foster_home_children integer NOT NULL,
  current_kin_children integer NOT NULL,
  current_nonfamily_children integer NOT NULL,
  currently_licensed_providers integer NOT NULL,
  currently_active_providers integer NOT NULL,
  high_recruitment_counties integer NOT NULL,
  high_retention_providers integer NOT NULL,

  CONSTRAINT system_snapshot_pkey PRIMARY KEY (reporting_date),
  CONSTRAINT system_snapshot_reporting_date_fkey
    FOREIGN KEY (reporting_date) REFERENCES public.dataset_metadata (reporting_date)
    ON DELETE CASCADE,
  CONSTRAINT system_snapshot_current_children_in_care_non_negative
    CHECK (current_children_in_care >= 0),
  CONSTRAINT system_snapshot_current_foster_home_children_non_negative
    CHECK (current_foster_home_children >= 0),
  CONSTRAINT system_snapshot_current_kin_children_non_negative
    CHECK (current_kin_children >= 0),
  CONSTRAINT system_snapshot_current_nonfamily_children_non_negative
    CHECK (current_nonfamily_children >= 0),
  CONSTRAINT system_snapshot_currently_licensed_providers_non_negative
    CHECK (currently_licensed_providers >= 0),
  CONSTRAINT system_snapshot_currently_active_providers_non_negative
    CHECK (currently_active_providers >= 0),
  CONSTRAINT system_snapshot_high_recruitment_counties_non_negative
    CHECK (high_recruitment_counties >= 0),
  CONSTRAINT system_snapshot_high_retention_providers_non_negative
    CHECK (high_retention_providers >= 0)
);

COMMENT ON TABLE public.system_snapshot IS
  'Statewide headline counts for the reporting-date snapshot.';

-- ---------------------------------------------------------------------------
-- county_metrics
-- ---------------------------------------------------------------------------
CREATE TABLE public.county_metrics (
  county text NOT NULL,
  reporting_date date NOT NULL,
  current_children_in_care integer NOT NULL,
  current_foster_home_children integer NOT NULL,
  current_kin_children integer NOT NULL,
  current_nonfamily_children integer NOT NULL,
  licensed_providers integer NOT NULL,
  active_providers integer NOT NULL,
  inactive_providers integer NOT NULL,
  children_per_active_provider numeric,
  out_of_county_foster_count integer NOT NULL,
  out_of_county_foster_rate numeric,
  expiring_90_days integer NOT NULL,
  expiring_180_days integer NOT NULL,
  high_retention_providers integer NOT NULL,
  medium_retention_providers integer NOT NULL,
  highest_pressure_age_group text,
  recruitment_priority text NOT NULL,
  recruitment_reasons jsonb NOT NULL,

  CONSTRAINT county_metrics_pkey PRIMARY KEY (county, reporting_date),
  CONSTRAINT county_metrics_reporting_date_fkey
    FOREIGN KEY (reporting_date) REFERENCES public.system_snapshot (reporting_date)
    ON DELETE CASCADE,
  CONSTRAINT county_metrics_recruitment_priority_check
    CHECK (recruitment_priority IN ('High', 'Medium', 'Low', 'Limited data')),
  CONSTRAINT county_metrics_highest_pressure_age_group_check
    CHECK (
      highest_pressure_age_group IS NULL
      OR highest_pressure_age_group IN ('0–5', '6–12', '13–17', 'Unknown')
    ),
  CONSTRAINT county_metrics_current_children_in_care_non_negative
    CHECK (current_children_in_care >= 0),
  CONSTRAINT county_metrics_current_foster_home_children_non_negative
    CHECK (current_foster_home_children >= 0),
  CONSTRAINT county_metrics_current_kin_children_non_negative
    CHECK (current_kin_children >= 0),
  CONSTRAINT county_metrics_current_nonfamily_children_non_negative
    CHECK (current_nonfamily_children >= 0),
  CONSTRAINT county_metrics_licensed_providers_non_negative
    CHECK (licensed_providers >= 0),
  CONSTRAINT county_metrics_active_providers_non_negative
    CHECK (active_providers >= 0),
  CONSTRAINT county_metrics_inactive_providers_non_negative
    CHECK (inactive_providers >= 0),
  CONSTRAINT county_metrics_out_of_county_foster_count_non_negative
    CHECK (out_of_county_foster_count >= 0),
  CONSTRAINT county_metrics_expiring_90_days_non_negative
    CHECK (expiring_90_days >= 0),
  CONSTRAINT county_metrics_expiring_180_days_non_negative
    CHECK (expiring_180_days >= 0),
  CONSTRAINT county_metrics_high_retention_providers_non_negative
    CHECK (high_retention_providers >= 0),
  CONSTRAINT county_metrics_medium_retention_providers_non_negative
    CHECK (medium_retention_providers >= 0),
  CONSTRAINT county_metrics_children_per_active_provider_non_negative
    CHECK (children_per_active_provider IS NULL OR children_per_active_provider >= 0),
  CONSTRAINT county_metrics_out_of_county_foster_rate_range
    CHECK (out_of_county_foster_rate IS NULL OR (out_of_county_foster_rate >= 0 AND out_of_county_foster_rate <= 1))
);

COMMENT ON TABLE public.county_metrics IS
  'County-level recruitment planning metrics and contextual placement counts.';
COMMENT ON COLUMN public.county_metrics.recruitment_priority IS
  'Planning priority label, not a proven shortage classification.';
COMMENT ON COLUMN public.county_metrics.recruitment_reasons IS
  'JSON array of readable planning-priority reason strings.';
COMMENT ON COLUMN public.county_metrics.out_of_county_foster_rate IS
  'Share of current foster-home children in the county placed outside their removal county.';

CREATE INDEX county_metrics_recruitment_priority_idx
  ON public.county_metrics (recruitment_priority);

CREATE INDEX county_metrics_children_per_active_provider_desc_idx
  ON public.county_metrics (children_per_active_provider DESC NULLS LAST);

CREATE INDEX county_metrics_out_of_county_foster_rate_desc_idx
  ON public.county_metrics (out_of_county_foster_rate DESC NULLS LAST);

-- ---------------------------------------------------------------------------
-- county_age_metrics
-- ---------------------------------------------------------------------------
CREATE TABLE public.county_age_metrics (
  county text NOT NULL,
  age_group text NOT NULL,
  reporting_date date NOT NULL,
  current_foster_home_children integer NOT NULL,
  matching_licensed_providers integer NOT NULL,
  matching_active_providers integer NOT NULL,
  children_per_matching_active_provider numeric,

  CONSTRAINT county_age_metrics_pkey PRIMARY KEY (county, age_group, reporting_date),
  CONSTRAINT county_age_metrics_county_reporting_date_fkey
    FOREIGN KEY (county, reporting_date)
    REFERENCES public.county_metrics (county, reporting_date)
    ON DELETE CASCADE,
  CONSTRAINT county_age_metrics_age_group_check
    CHECK (age_group IN ('0–5', '6–12', '13–17', 'Unknown')),
  CONSTRAINT county_age_metrics_current_foster_home_children_non_negative
    CHECK (current_foster_home_children >= 0),
  CONSTRAINT county_age_metrics_matching_licensed_providers_non_negative
    CHECK (matching_licensed_providers >= 0),
  CONSTRAINT county_age_metrics_matching_active_providers_non_negative
    CHECK (matching_active_providers >= 0),
  CONSTRAINT county_age_metrics_children_per_matching_active_provider_non_negative
    CHECK (
      children_per_matching_active_provider IS NULL
      OR children_per_matching_active_provider >= 0
    )
);

COMMENT ON TABLE public.county_age_metrics IS
  'County foster-home demand and provider-preference alignment by age group.';
COMMENT ON COLUMN public.county_age_metrics.children_per_matching_active_provider IS
  'Null for Unknown age group rows excluded from age-specific ratios.';

CREATE INDEX county_age_metrics_county_age_group_idx
  ON public.county_age_metrics (county, age_group);

-- ---------------------------------------------------------------------------
-- provider_metrics
-- ---------------------------------------------------------------------------
CREATE TABLE public.provider_metrics (
  provider_id bigint NOT NULL,
  county text NOT NULL,
  reporting_date date NOT NULL,
  license_start_date date NOT NULL,
  license_end_date date NOT NULL,
  days_until_expiration integer NOT NULL,
  currently_has_placement boolean NOT NULL,
  last_completed_placement_end date,
  days_since_last_placement integer,
  total_active_days integer NOT NULL,
  active_days_last_365 integer NOT NULL,
  eligible_licensed_days_last_365 integer NOT NULL,
  engagement_rate_last_365 numeric,
  min_age integer NOT NULL,
  max_age integer NOT NULL,
  outreach_priority text NOT NULL,
  outreach_reasons jsonb NOT NULL,

  CONSTRAINT provider_metrics_pkey PRIMARY KEY (provider_id, reporting_date),
  CONSTRAINT provider_metrics_county_reporting_date_fkey
    FOREIGN KEY (county, reporting_date)
    REFERENCES public.county_metrics (county, reporting_date)
    ON DELETE CASCADE,
  CONSTRAINT provider_metrics_outreach_priority_check
    CHECK (outreach_priority IN ('High', 'Medium', 'Low')),
  CONSTRAINT provider_metrics_min_age_lte_max_age CHECK (min_age <= max_age),
  CONSTRAINT provider_metrics_days_until_expiration_non_negative
    CHECK (days_until_expiration >= 0),
  CONSTRAINT provider_metrics_days_since_last_placement_non_negative
    CHECK (days_since_last_placement IS NULL OR days_since_last_placement >= 0),
  CONSTRAINT provider_metrics_total_active_days_non_negative
    CHECK (total_active_days >= 0),
  CONSTRAINT provider_metrics_active_days_last_365_non_negative
    CHECK (active_days_last_365 >= 0),
  CONSTRAINT provider_metrics_eligible_licensed_days_last_365_non_negative
    CHECK (eligible_licensed_days_last_365 >= 0),
  CONSTRAINT provider_metrics_engagement_rate_last_365_range
    CHECK (
      engagement_rate_last_365 IS NULL
      OR (engagement_rate_last_365 >= 0 AND engagement_rate_last_365 <= 1)
    )
);

COMMENT ON TABLE public.provider_metrics IS
  'Currently licensed provider outreach-priority metrics without child identifiers.';
COMMENT ON COLUMN public.provider_metrics.outreach_priority IS
  'Outreach priority label, not closure risk or non-renewal probability.';
COMMENT ON COLUMN public.provider_metrics.engagement_rate_last_365 IS
  'active_days_last_365 divided by eligible_licensed_days_last_365 in the recent window.';
COMMENT ON COLUMN public.provider_metrics.outreach_reasons IS
  'JSON array of readable outreach reason strings.';

CREATE INDEX provider_metrics_outreach_priority_county_idx
  ON public.provider_metrics (outreach_priority, county);

CREATE INDEX provider_metrics_county_currently_has_placement_idx
  ON public.provider_metrics (county, currently_has_placement);

CREATE INDEX provider_metrics_license_end_date_idx
  ON public.provider_metrics (license_end_date);

CREATE INDEX provider_metrics_days_since_last_placement_idx
  ON public.provider_metrics (days_since_last_placement);

CREATE INDEX provider_metrics_engagement_rate_last_365_idx
  ON public.provider_metrics (engagement_rate_last_365);

CREATE UNIQUE INDEX provider_metrics_provider_id_unique_idx
  ON public.provider_metrics (provider_id);

COMMENT ON INDEX public.provider_metrics_provider_id_unique_idx IS
  'Assessment loads one reporting-date snapshot at a time, enabling activity-period joins on provider_id.';

-- ---------------------------------------------------------------------------
-- provider_activity_periods
-- ---------------------------------------------------------------------------
CREATE TABLE public.provider_activity_periods (
  provider_id bigint NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  active_days integer NOT NULL,
  is_current boolean NOT NULL,

  CONSTRAINT provider_activity_periods_pkey PRIMARY KEY (provider_id, period_start),
  CONSTRAINT provider_activity_periods_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES public.provider_metrics (provider_id)
    ON DELETE CASCADE,
  CONSTRAINT provider_activity_periods_active_days_non_negative
    CHECK (active_days >= 0),
  CONSTRAINT provider_activity_periods_period_range_check
    CHECK (period_start < period_end)
);

COMMENT ON TABLE public.provider_activity_periods IS
  'Merged foster-home placement intervals per provider with no child identifiers.';
COMMENT ON COLUMN public.provider_activity_periods.is_current IS
  'True when the merged interval ends on the reporting date.';

CREATE INDEX provider_activity_periods_provider_id_period_start_idx
  ON public.provider_activity_periods (provider_id, period_start);

-- ---------------------------------------------------------------------------
-- monthly_metrics
-- ---------------------------------------------------------------------------
CREATE TABLE public.monthly_metrics (
  month date NOT NULL,
  new_license_starts integer NOT NULL,
  license_expirations integer NOT NULL,
  active_provider_count integer NOT NULL,
  foster_home_placement_starts integer NOT NULL,

  CONSTRAINT monthly_metrics_pkey PRIMARY KEY (month),
  CONSTRAINT monthly_metrics_new_license_starts_non_negative
    CHECK (new_license_starts >= 0),
  CONSTRAINT monthly_metrics_license_expirations_non_negative
    CHECK (license_expirations >= 0),
  CONSTRAINT monthly_metrics_active_provider_count_non_negative
    CHECK (active_provider_count >= 0),
  CONSTRAINT monthly_metrics_foster_home_placement_starts_non_negative
    CHECK (foster_home_placement_starts >= 0)
);

COMMENT ON TABLE public.monthly_metrics IS
  'Monthly license and foster-home placement activity trends.';
