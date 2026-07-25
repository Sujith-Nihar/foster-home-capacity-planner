export const BENCHMARK_ROUTE_GROUPS = {
  core: ["/", "/recruitment", "/retention", "/methodology"],
  counties: [
    "/recruitment/Cook",
    "/recruitment/Champaign",
    "/recruitment/DeKalb",
    "/recruitment/Alexander",
  ],
  providers: [
    "/providers/500001",
    "/providers/500021",
    "/providers/500024",
  ],
  notFound: ["/recruitment/NotARealCounty", "/providers/999999999"],
};

export const BENCHMARK_ROUTES = [
  ...BENCHMARK_ROUTE_GROUPS.core,
  ...BENCHMARK_ROUTE_GROUPS.counties,
  ...BENCHMARK_ROUTE_GROUPS.providers,
  ...BENCHMARK_ROUTE_GROUPS.notFound,
];
