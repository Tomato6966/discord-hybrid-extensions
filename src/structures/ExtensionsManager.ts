import { ClusterManager } from "discord-hybrid-sharding";
import { Utils } from "./Utils";

export class ExtensionsManager {
    public utils:Utils;
    private manager:ClusterManager;
    /**
     * @param manager The Cluster Client of the Bot Client (provide it, even if it's assigned to the bot client)
     */
    constructor(manager:ClusterManager) {
        // if(!(manager instanceof ClusterManager)) throw new Error("Provided Manager is not a valid ClusterManager");
        this.manager = manager;
        this.utils = new Utils(this.cluster.broadcastEval, this.manager.totalShards)
    }
}
