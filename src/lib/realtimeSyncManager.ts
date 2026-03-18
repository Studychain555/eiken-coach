import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SyncConfig {
  userId: string;
  table: string;
  onUpdate: (data: any) => void;
  onError?: (error: Error) => void;
  filter?: string; // PostgREST filter e.g., "user_id=eq.123"
}

interface SyncQueue {
  id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: Record<string, any>;
  timestamp: number;
  retries: number;
}

class RealtimeSyncManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private syncQueues: Map<string, SyncQueue[]> = new Map();
  private isOnline = true;

  constructor() {
    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processAllQueues();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  /**
   * Subscribe to real-time updates for a specific table
   */
  public subscribe(config: SyncConfig): () => void {
    const channelKey = `${config.table}:${config.userId}`;

    // Create channel
    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload: any) => {
          try {
            config.onUpdate(payload.new || payload.old);
          } catch (error) {
            config.onError?.(
              error instanceof Error
                ? error
                : new Error('Failed to process update')
            );
          }
        }
      )
      .subscribe();

    this.channels.set(channelKey, channel);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channelKey);
    };
  }

  /**
   * Unsubscribe from real-time updates
   */
  public unsubscribe(channelKey: string): void {
    const channel = this.channels.get(channelKey);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelKey);
    }
  }

  /**
   * Queue a data change for offline-first sync
   */
  public queueChange(
    table: string,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    data: Record<string, any>
  ): void {
    if (!this.syncQueues.has(table)) {
      this.syncQueues.set(table, []);
    }

    const queue = this.syncQueues.get(table)!;
    queue.push({
      id: `${table}:${Date.now()}:${Math.random()}`,
      action,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
    });

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processQueue(table);
    }
  }

  /**
   * Process queue for a specific table
   */
  private async processQueue(table: string): Promise<void> {
    const queue = this.syncQueues.get(table);
    if (!queue || queue.length === 0) return;

    const items = [...queue];
    queue.length = 0; // Clear queue

    for (const item of items) {
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error(`[RealtimeSync] Failed to sync ${item.id}:`, error);

        // Re-queue with backoff
        item.retries++;
        if (item.retries < 3) {
          queue.push(item);
        }
      }
    }
  }

  /**
   * Process all queued items
   */
  private async processAllQueues(): Promise<void> {
    for (const table of this.syncQueues.keys()) {
      await this.processQueue(table);
    }
  }

  /**
   * Sync a single item to Supabase
   */
  private async syncItem(item: SyncQueue): Promise<void> {
    switch (item.action) {
      case 'INSERT':
        await supabase.from(item.table).insert(item.data);
        break;

      case 'UPDATE':
        const { id, ...updateData } = item.data;
        await supabase.from(item.table).update(updateData).eq('id', id);
        break;

      case 'DELETE':
        await supabase.from(item.table).delete().eq('id', item.data.id);
        break;
    }
  }

  /**
   * Get queue status
   */
  public getQueueStatus(): Record<string, number> {
    const status: Record<string, number> = {};
    for (const [table, queue] of this.syncQueues.entries()) {
      status[table] = queue.length;
    }
    return status;
  }

  /**
   * Check if online
   */
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Clear all queues (for testing)
   */
  public clearAllQueues(): void {
    this.syncQueues.clear();
  }
}

export const realtimeSyncManager = new RealtimeSyncManager();
