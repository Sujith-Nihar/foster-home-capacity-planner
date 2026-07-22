type CountyDetailPageProps = {
  params: Promise<{ county: string }>;
};

export default async function CountyDetailPage({ params }: CountyDetailPageProps) {
  const { county } = await params;

  return (
    <section aria-labelledby="county-heading">
      <h2 id="county-heading" className="text-2xl font-semibold tracking-tight">
        {decodeURIComponent(county)}
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        County detail views will be added in a later phase.
      </p>
    </section>
  );
}
