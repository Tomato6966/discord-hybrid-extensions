import { EventEmitter } from "node:events";
import { ClusterManager } from "discord-hybrid-sharding";
import { Utils, ExtensionsManagerOptions } from "./Utils";

class ManagerCache {
    guildCount: number;
    userCount: number;
    guildIds: string[];
    guilds: unknown;
    userIds: string[];   
    constructor() { }
}

export class ExtensionsManager extends EventEmitter {
    public utils:Utils;
    public cache = new ManagerCache();
    public options:ExtensionsManagerOptions;
    private manager:ClusterManager;
    private messagesPrefix: "Ext_Man_";
    /**
     * @param manager The Cluster Client of the Bot Client (provide it, even if it's assigned to the bot client)
     */
    constructor(manager:ClusterManager, options:ExtensionsManagerOptions) {
        this.options = options;
        // if(!(manager instanceof ClusterManager)) throw new Error("Provided Manager is not a valid ClusterManager");
        this.manager = manager;
        this.utils = new Utils(this.cluster.broadcastEval, this.manager.totalShards)
        
    }

    private listenToEvents() {
        return this.manager.on('clusterCreate', cluster => {
            const clusterAmount = Math.ceil(Number(this.manager.totalShards) / Number(this.manager.shardsPerClusters));
            cluster.on("message", async (msg:any) => {
                if(msg.respondBack) {
                    return msg.reply({
                        data: msg.respondBack
                    })
                }
                if(msg.isClientReady) {
                    const guilds = msg.guildDatas?.length ? msg.guildDatas : 
                        await this.manager.broadcastEval((c:BotClient) => {
                            c.guilds?.cache?.map(x => c.utils.manager.formatGuild(x, true, false, false, true))
                        }, { 
                            timeout: 5000,
                            cluster: cluster.id,
                        }).then((r:any) => r.flat()).catch(console.warn).catch(e => {
                            console.error(e, `Script: "formatted all guilds"`)
                            return []
                        });
                    for(const guild of (guilds || []).flat()) {
                        if(guild?.id) this.manager.cache.guilds.set(guild.id, guild); 
                    }
                    if(msg.commands?.length) {
                        this.manager.cache.commands = msg.commands;
                    }
                    if(msg.events?.length) {
                        this.manager.cache.events = msg.events;
                    }
                    if((++clientReadyCounter) == clusterAmount) readyManagerEvent(this);
                    else this.manager.logger.error(" --- NOT ALL CLUSTERS READY YET --- ")
                }
                if(msg.getClusterPing && msg._type === messageType.CUSTOM_REQUEST) {
                    return msg.reply({ message: "PONG" }).catch(() => null);
                }
                if(msg.isClusterStats) {
                    this.manager.cache.clusterStatus = { 
                        totalClusters: this.manager.totalClusters, 
                        totalShards: this.manager.totalShards,  
                        data: this.manager.cache.clusterStatus.data,
                    };
                    const clusterIndex = this.manager.cache.clusterStatus.data.findIndex(c => c.cluster == msg.status?.cluster ?? cluster.id);
                    if(clusterIndex >= 0) this.manager.cache.clusterStatus.data[clusterIndex] = msg.status;
                    else this.manager.cache.clusterStatus.data.push(msg.status);
                    this.manager.cache.clusterStatus.data = this.manager.cache.clusterStatus.data.sort((a,b) => a.cluster - b.cluster);
                }
            })
        });
    }
}
