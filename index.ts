// Require the necessary discord.js classes
import {
  Client,
  ClientOptions,
  Collection,
  Events,
  GatewayIntentBits,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

class SuperClient extends Client {
  public commands: Collection<string, any> = new Collection();

  constructor(options: ClientOptions) {
    super(options);
  }
}

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

// Create a new client instance
const client = new SuperClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Function to load all commands from the commands folder
function loadCommands() {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, "src/commands"))
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const command = require(path.join(__dirname, "src/commands", file))
      .default as Command;
    client.commands.set(command.data.name, command);
  }
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  loadCommands();
});

// Event: Interaction (Slash Command) received
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("Error executing command:", error);
    await interaction.reply({
      content: "An error occurred while executing the command.",
      ephemeral: true,
    });
  }
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
