type ProviderDetailPageProps = {
  params: Promise<{ providerId: string }>;
};

export default async function ProviderDetailPage({
  params,
}: ProviderDetailPageProps) {
  const { providerId } = await params;

  return (
    <section aria-labelledby="provider-heading">
      <h2 id="provider-heading" className="text-2xl font-semibold tracking-tight">
        Provider {providerId}
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Provider detail views will be added in a later phase.
      </p>
    </section>
  );
}
