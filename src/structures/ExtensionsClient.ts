import { ClusterClient } from "discord-hybrid-sharding";
import { Utils } from "./Utils";

export class ExtensionsClient {
    public utils:Utils;
    private cluster:ClusterClient;
    /**
     * @param cluster The Cluster Client of the Bot Client (provide it, even if it's assigned to the bot client)
     */
    constructor(cluster:ClusterClient) {
        // if(!(cluster instanceof ClusterClient)) throw new Error("Provided Cluster is not a valid ClusterClient");
        this.cluster = cluster;
        this.utils = new Utils(this.cluster.broadcastEval, this.cluster.info.TOTAL_SHARDS)
    }
}