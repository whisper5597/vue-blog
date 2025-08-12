type SummarizerType = 'tldr' // Summary should be short and to the point, providing a quick overview of the input, suitable for a busy reader.
  | 'teaser' // Summary should focus on the most interesting or intriguing parts of the input, designed to draw the reader in to read more.
  | 'key-points'  // Summary should extract the most important points from the input, presented as a bulleted list.
  | 'headline'; // Summary should effectively contain the main point of the input in a single sentence, in the format of an article headline.

interface DownloadProgressEvent {
  type: 'downloadprogress';
  loaded: number;
  total?: number;
}

interface SummarizerMonitorTarget {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: DownloadProgressEvent) => void
  ): void;
  removeEventListener?(
    type: 'downloadprogress',
    listener: (event: DownloadProgressEvent) => void
  ): void;
}

interface Summarizer {
  availability: () => Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  create: (options: {
    sharedContext?: string;
    type?: SummarizerType,
    format?: 'markdown' | 'plain-text',
    length?: 'short' | 'medium' | 'long',
    monitor?: (target: SummarizerMonitorTarget) => void
  }) => Promise<SummarizerInstance>;

}

export interface SummarizerInstance {
  summarize: (text: string, options?: {
    context?: string;
  }) => Promise<string>;
  summarizeStreaming: (text: string, options?: {
    context?: string;
  }) => Promise<string>;
}

declare global {
  interface Window {
    Summarizer: Summarizer;
  }
}