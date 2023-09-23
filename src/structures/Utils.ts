export function shardIdForGuildId(guildId: string, shardCount: number) {
    const shard = Number(BigInt(guildId) >> 22n) % shardCount;
    if (shard < 0) throw new Error(`Shard couldn't be calculated correctly, for the guildId ${guildId} and the ShardAmount ${shardCount}`);
    return shard;
}

export class Utils {
    private totalShards: number = 0;
    private broadcastEval: Function;
    /**
     * Utils for the ExtensionsClient
     * @param broadcastEval 
     * @param totalShards 
     */
    constructor(broadcastEval: Function, totalShards: number) {
        if (typeof totalShards !== "number" || isNaN(totalShards) || totalShards <= 0) throw new Error("totalShards must be a positive number of at least 1");
        if (typeof broadcastEval !== "function") throw new Error("Broadcast Eval must be a valid function");
        this.totalShards = totalShards;
        this.broadcastEval = broadcastEval;
    }
    /**
     * Get the ClusterId based of the ShardId
     * @param {number} shardId
     * @return {number} ClusterId
     */
    clusterIdOfShardId(shardId) {
        if (typeof shardId === "undefined" || typeof shardId !== "number" || isNaN(shardId)) throw new Error("No valid ShardId Provided")
        if (Number(shardId) > this.totalShards) throw new Error("Provided ShardId, is bigger than all Shard Ids");
        const middlePart = Number(shardId) === 0 ? 0 : Number(shardId) / Math.ceil(this.totalShards / this.totalClusters);
        return Number(shardId) === 0 ? 0 : (Math.ceil(middlePart) - (middlePart % 1 !== 0 ? 1 : 0));
    }
    /**
     * Get the ClusterId based of the GuildId
     * @param {number} guildId
     * @return {number} ClusterId
     */
    clusterIdOfGuildId(guildId) {
        if (!guildId || !/^(?<id>\d{17,20})$/.test(guildId)) throw new Error("Provided GuildId, is not a valid GuildId");
        return this.clusterIdOfShardId(this.shardIdOfGuildId(guildId));
    }
    /**
     * Get the shardId based of the GuildId
     * @param {number} guildId
     * @return {number} ClusterId
     */
    shardIdOfGuildId(guildId) {
        if (!guildId || !/^(?<id>\d{17,20})$/.test(guildId)) throw new Error("Provided GuildId, is not a valid GuildId");
        return ShardClientUtil.shardIdForGuildId(guildId, this.totalShards);
    }
    /**
     * execute a script on a specific cluster, just if you have the Guild
     * @param {(client:any, context:unknown) => any} callBackFunction 
     * @param {number | { guildId: number, timeout: number }} guildId 
     * @param {{ timeout: number }} [options] optional hybrid options 
     * @returns {Promise<any>} broadcast of that callBackFunction
     */
    async evalOnGuild(callBackFunction, guildId, options = {}) {
        const guildID = typeof guildId === "string" ? guildId : typeof guildId === "object" ? guildId?.guildId : null;
        if (!guildID || !/^(?<id>\d{17,20})$/.test(guildID)) throw new Error("Provided GuildId, is not a valid GuildId");
        if (typeof options !== "object") throw new Error("Provided Options, must be an object!");
        // set the cluster
        options.cluster = this.clusterIdOfGuildId(guildID);
        // if guildId === options, than add the options to options, without having guildId or cluster in there.
        if (typeof guildId === "object") {
            for (const [k, v] of Object.entries(guildID)) {
                if (!["guildId", "cluster"].includes(k) && !options[k]) options[k] = v;
            }
        }
        return await this.broadcastEval(callBackFunction, options).then(v => v[0]);
    }
}