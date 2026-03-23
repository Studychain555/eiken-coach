/**
 * Conflict Resolution Strategies for Offline-First Data Sync
 */

export type ConflictResolutionStrategy = 'last-write-wins' | 'client-wins' | 'server-wins' | 'merge';

export interface ConflictResolutionConfig {
  strategy: ConflictResolutionStrategy;
  customMergeHandler?: (local: any, remote: any, field: string) => any;
}

interface VersionedData {
  version: number;
  lastModified: number;
  data: Record<string, any>;
}

export class ConflictResolver {
  /**
   * Resolve conflict using Last-Write-Wins strategy
   * Keep data with the most recent timestamp
   */
  static resolveWithLastWriteWins(
    local: VersionedData,
    remote: VersionedData
  ): VersionedData {
    return local.lastModified > remote.lastModified ? local : remote;
  }

  /**
   * Resolve conflict using Client-Wins strategy
   * Always prefer local (client) version
   */
  static resolveWithClientWins(
    local: VersionedData,
    _remote: VersionedData
  ): VersionedData {
    return {
      ...local,
      lastModified: Date.now(),
      version: local.version + 1,
    };
  }

  /**
   * Resolve conflict using Server-Wins strategy
   * Always prefer remote (server) version
   */
  static resolveWithServerWins(
    _local: VersionedData,
    remote: VersionedData
  ): VersionedData {
    return remote;
  }

  /**
   * Resolve conflict using intelligent Merge strategy
   * Merge changes field by field
   */
  static resolveWithMerge(
    local: VersionedData,
    remote: VersionedData,
    customMergeHandler?: (local: any, remote: any, field: string) => any
  ): VersionedData {
    const merged: Record<string, any> = {};

    // Get all unique keys
    const allKeys = new Set([
      ...Object.keys(local.data),
      ...Object.keys(remote.data),
    ]);

    for (const key of allKeys) {
      const localValue = local.data[key];
      const remoteValue = remote.data[key];

      if (localValue === undefined) {
        merged[key] = remoteValue;
      } else if (remoteValue === undefined) {
        merged[key] = localValue;
      } else if (localValue === remoteValue) {
        merged[key] = localValue;
      } else {
        // Field has different values - use custom handler or default
        if (customMergeHandler) {
          merged[key] = customMergeHandler(localValue, remoteValue, key);
        } else {
          // Default: use server value with warning
          console.warn(
            `[ConflictResolver] Cannot auto-merge field "${key}". Using server value.`
          );
          merged[key] = remoteValue;
        }
      }
    }

    return {
      version: Math.max(local.version, remote.version) + 1,
      lastModified: Date.now(),
      data: merged,
    };
  }

  /**
   * Resolve a conflict using the specified strategy
   */
  static resolve(
    local: VersionedData,
    remote: VersionedData,
    config: ConflictResolutionConfig
  ): VersionedData {
    switch (config.strategy) {
      case 'last-write-wins':
        return this.resolveWithLastWriteWins(local, remote);

      case 'client-wins':
        return this.resolveWithClientWins(local, remote);

      case 'server-wins':
        return this.resolveWithServerWins(local, remote);

      case 'merge':
        return this.resolveWithMerge(
          local,
          remote,
          config.customMergeHandler
        );

      default:
        throw new Error(`Unknown conflict resolution strategy: ${config.strategy}`);
    }
  }

  /**
   * Detect if a conflict exists
   */
  static hasConflict(local: VersionedData, remote: VersionedData): boolean {
    // Conflicts occur when both versions have been modified independently
    return (
      local.version !== remote.version &&
      local.lastModified !== remote.lastModified
    );
  }

  /**
   * Create a version wrapper for data
   */
  static createVersionedData(
    data: Record<string, any>,
    version: number = 1
  ): VersionedData {
    return {
      version,
      lastModified: Date.now(),
      data,
    };
  }
}

/**
 * Custom merge handlers for specific data types
 */
export const MergeHandlers = {
  /**
   * For arrays: merge unique items (union)
   */
  mergeArrays: (local: any[], remote: any[]): any[] => {
    const merged = new Map();

    local.forEach((item) => {
      const key = item.id || JSON.stringify(item);
      merged.set(key, item);
    });

    remote.forEach((item) => {
      const key = item.id || JSON.stringify(item);
      merged.set(key, item);
    });

    return Array.from(merged.values());
  },

  /**
   * For objects: deep merge (server wins on conflict)
   */
  mergeObjects: (local: Record<string, any>, remote: Record<string, any>) => {
    return {
      ...local,
      ...remote,
    };
  },

  /**
   * For strings: use longer string (more complete)
   */
  mergeStrings: (local: string, remote: string): string => {
    return local.length >= remote.length ? local : remote;
  },

  /**
   * For numbers: use average
   */
  mergeNumbers: (local: number, remote: number): number => {
    return Math.round((local + remote) / 2);
  },

  /**
   * For booleans: use true if either is true
   */
  mergeBooleans: (local: boolean, remote: boolean): boolean => {
    return local || remote;
  },
};
