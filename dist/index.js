"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Require the necessary discord.js classes
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class SuperClient extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.commands = new discord_js_1.Collection();
    }
}
// Create a new client instance
const client = new SuperClient({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages],
});
// Function to load all commands from the commands folder
function loadCommands() {
    const commandFiles = fs_1.default
        .readdirSync(path_1.default.join(__dirname, "src/commands"))
        .filter((file) => file.endsWith(".ts"));
    for (const file of commandFiles) {
        const command = require(path_1.default.join(__dirname, "src/commands", file))
            .default;
        client.commands.set(command.data.name, command);
    }
}
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(discord_js_1.Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    loadCommands();
});
// Event: Interaction (Slash Command) received
client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    const commandName = interaction.commandName;
    const command = client.commands.get(commandName);
    if (!command)
        return;
    try {
        yield command.execute(interaction);
    }
    catch (error) {
        console.error("Error executing command:", error);
        yield interaction.reply({
            content: "An error occurred while executing the command.",
            ephemeral: true,
        });
    }
}));
// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
