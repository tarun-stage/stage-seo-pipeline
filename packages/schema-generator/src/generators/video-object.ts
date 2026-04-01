export interface VideoObjectInput {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;        // ISO 8601
  duration: string;          // ISO 8601 duration e.g. PT1H30M
  contentUrl?: string;
  embedUrl?: string;
  dialect?: string;          // hi, ta, te, etc.
  genre?: string[];
  actors?: string[];
  director?: string;
  contentRating?: string;    // U, UA, A
  requiresSubscription?: boolean;
}

/**
 * Generates VideoObject JSON-LD schema for /watch/* pages.
 * Required for Google "Watch on Stage" rich result button.
 */
export function generateVideoObject(siteUrl: string, input: VideoObjectInput): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${siteUrl}/watch/${input.id}#video`,
    name: input.title,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    uploadDate: input.uploadDate,
    duration: input.duration,
    publisher: {
      '@type': 'Organization',
      name: 'Stage',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    potentialAction: {
      '@type': 'WatchAction',
      target: `${siteUrl}/watch/${input.id}`,
    },
  };

  if (input.contentUrl) schema.contentUrl = input.contentUrl;
  if (input.embedUrl) schema.embedUrl = input.embedUrl;
  if (input.dialect) schema.inLanguage = input.dialect;
  if (input.genre?.length) schema.genre = input.genre;
  if (input.director) schema.director = { '@type': 'Person', name: input.director };
  if (input.actors?.length) {
    schema.actor = input.actors.map(name => ({ '@type': 'Person', name }));
  }
  if (input.contentRating) schema.contentRating = input.contentRating;
  if (input.requiresSubscription !== undefined) {
    schema.requiresSubscription = input.requiresSubscription;
  }

  return schema;
}

/** Generates the <script> tag string to inject into HTML. */
export function videoObjectToScript(schema: object): string {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}
