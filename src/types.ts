/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export type CDNType = string;

export interface CDNNode {
  id: CDNType;
  name: string;
  description: string;
  prefix: string;
  speedTag: string;
  latencyIndicator: 'fast' | 'medium' | 'premium';
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
}

export interface ImageItem {
  name: string;
  path: string; // File path relative to repository root e.g. "img/sample.png"
  downloadUrl: string; // GitHub direct raw URL as safety backup
  cdnUrls: Record<CDNType, string>; // Maps each cdn type to its formatted URL
  size: number;
  sha: string;
}

export interface ApiStatus {
  loading: boolean;
  error: string | null;
  rateLimitLimit: number | null;
  rateLimitRemaining: number | null;
}
