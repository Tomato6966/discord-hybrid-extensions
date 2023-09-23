# discord-hybrid-extensions

This Package is a middleware package, to enable/disable several discord-hybrid-extensions Easily

# Setting up

First, add the module into your project (into your shard/cluster file).
Filename: `Cluster.js`

```js
// Typescript: import { ClusterManager } from 'discord-hybrid-sharding'
const { ClusterManager } = require('discord-hybrid-sharding');
// Typescript: import { ExtensionsManager } from 'discord-hybrid-extensions'
const { ExtensionsManager } = require('discord-hybrid-extensions');

const manager = new ClusterManager(`${__dirname}/bot.js`, {
    totalShards: 7, // or 'auto'
    /// Check below for more options
    shardsPerClusters: 2,
    // totalClusters: 7,
    mode: 'process', // you can also choose "worker"
    token: 'YOUR_TOKEN',
});

// assign the clusterExtensions somewhere somehow, and provide the ClusterManager to it.
manager.clusterExtensions = new ExtensionsManager(manager);

manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });
```

After that, insert the code below into your `bot.js` file

```js
// Typescript: import { ClusterClient, getInfo } from 'discord-hybrid-sharding'
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');
// Typescript: import { ExtensionsClient } from 'discord-hybrid-extensions'
const { ExtensionsClient } = require('discord-hybrid-extensions');
const Discord = require('discord.js');

const client = new Discord.Client({
    shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
    shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
});

client.cluster = new ClusterClient(client); // initialize the Client, so we access the .broadcastEval()

// assign the clusterExtensions somewhere somehow, and provide the ClusterClient to it.
client.clusterExtensions = new ExtensionsClient(client.cluster);
// ! IMPORTANT : Bind the raw event to the clusterExtensions CLIENT
client.on("raw", data => client.clusterExtensions.bindRawEvent(data));

client.login('YOUR_TOKEN');
```