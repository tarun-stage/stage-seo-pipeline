/**
 * Generates Organization + WebSite JSON-LD for the homepage.
 * Organization schema = Knowledge Graph entity for Stage.
 * WebSite with SearchAction = Sitelinks search box in Google.
 */
export function generateOrganizationAndWebsite(siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Stage',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
          width: 512,
          height: 512,
        },
        sameAs: [
          'https://play.google.com/store/apps/details?id=com.stage.app',
          'https://apps.apple.com/in/app/stage-regional-ott/id1234567890',
        ],
        description:
          "India's premier regional language OTT platform for Haryanvi, Rajasthani, Bhojpuri & Gujarati content.",
        areaServed: 'IN',
        knowsLanguage: ['hi', 'raj', 'bho', 'gu'],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Stage',
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

/**
 * Generates BreadcrumbList JSON-LD for navigation.
 * Add to every page for navigation rich results.
 */
export function generateBreadcrumbs(
  items: Array<{ name: string; url?: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

/**
 * Generates Speakable schema to improve voice/AI citation precision.
 * Mark H1 and intro paragraph as speakable content.
 */
export function generateSpeakable(siteUrl: string, pageUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.page-intro', '[data-speakable]'],
    },
    url: `${siteUrl}${pageUrl}`,
  };
}
