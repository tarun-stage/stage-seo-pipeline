export interface TVSeriesInput {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  startDate: string;
  endDate?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  dialect?: string;
  genre?: string[];
  actors?: string[];
  director?: string;
  contentRating?: string;
}

export interface TVSeasonInput {
  showId: string;
  seasonNumber: number;
  title?: string;
  numberOfEpisodes?: number;
  startDate?: string;
}

export interface TVEpisodeInput {
  showId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl?: string;
}

/**
 * Generates TVSeries JSON-LD schema for /shows/* pages.
 */
export function generateTVSeries(siteUrl: string, input: TVSeriesInput): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    '@id': `${siteUrl}/shows/${input.id}#series`,
    name: input.title,
    description: input.description,
    image: input.thumbnailUrl,
    startDate: input.startDate,
    url: `${siteUrl}/shows/${input.id}`,
  };

  if (input.endDate) schema.endDate = input.endDate;
  if (input.numberOfSeasons) schema.numberOfSeasons = input.numberOfSeasons;
  if (input.numberOfEpisodes) schema.numberOfEpisodes = input.numberOfEpisodes;
  if (input.dialect) schema.inLanguage = input.dialect;
  if (input.genre?.length) schema.genre = input.genre;
  if (input.contentRating) schema.contentRating = input.contentRating;
  if (input.director) schema.director = { '@type': 'Person', name: input.director };
  if (input.actors?.length) {
    schema.actor = input.actors.map(name => ({ '@type': 'Person', name }));
  }

  return schema;
}

/**
 * Generates TVEpisode JSON-LD schema for individual episode pages.
 */
export function generateTVEpisode(siteUrl: string, input: TVEpisodeInput): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TVEpisode',
    name: input.title,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    uploadDate: input.uploadDate,
    duration: input.duration,
    episodeNumber: input.episodeNumber,
    partOfSeason: {
      '@type': 'TVSeason',
      '@id': `${siteUrl}/shows/${input.showId}/season-${input.seasonNumber}#season`,
      seasonNumber: input.seasonNumber,
    },
    partOfTVSeries: {
      '@type': 'TVSeries',
      '@id': `${siteUrl}/shows/${input.showId}#series`,
    },
  };

  if (input.contentUrl) schema.contentUrl = input.contentUrl;

  return schema;
}
