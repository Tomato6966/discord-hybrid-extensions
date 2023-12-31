export interface getInfoType {
    SHARD_LIST: number[];
    TOTAL_SHARDS: number;
    LAST_SHARD_ID: number;
    FIRST_SHARD_ID: number;
    CLUSTER_COUNT: number;
    MAINTENANCE?: string;
    CLUSTER_QUEUE_MODE?: 'auto' | string | undefined;
    CLUSTER: number;
    CLUSTER_MANAGER_MODE: 'process' | 'worker';
}; 

export interface ExtensionsManagerOptions {
    cache?: {
        saveGuilds?: "complete" | "slim" | "slimmest" | "no";
        saveGuildIds?: boolean;
        saveGuildCount?: boolean;
        saveUsers?: "complete" | "slim" | "slimmest" | "no";
        saveUserIds?: boolean;
        saveUserCount?: boolean;
    }
}