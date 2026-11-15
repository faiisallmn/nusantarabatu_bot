const { handleTicketInteraction } = require("../utils/ticketHandler");
const { handleVerifyInteraction } = require("../utils/verifyHandler");

module.exports = {
  name: "interactionCreate",
  once: false,

  async execute(interaction, client) {
    // 1. Menangani Interaksi Slash Command
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({
          content: "❌ Command tidak ditemukan.",
          flags: 64,
        });
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error saat menjalankan /${interaction.commandName}:`, error);

        const msg = { content: "❌ Terjadi error saat menjalankan command ini.", flags: 64 };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
    }
    
    // 2. Menangani Interaksi Button dan Modal
    if (interaction.isButton() || interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("ticket_")) {
        await handleTicketInteraction(interaction);
      } else if (interaction.customId.startsWith("verify_")) {
        await handleVerifyInteraction(interaction);
      } else if (interaction.isModalSubmit() && interaction.customId === "announce_modal") {
        const announceCommand = client.commands.get("announce");
        await announceCommand.handleModalSubmit(interaction);
      } else if (interaction.isModalSubmit() && interaction.customId === "update_modal") {
        const updateCommand = client.commands.get("update");
        await updateCommand.handleModalSubmit(interaction);
      }
    }

    // 3. Menangani Interaksi Select Menu
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "role_select_menu" || interaction.customId === "role_select_notif") {
        const { handleRoleSelectInteraction } = require("../utils/roleHandler");
        await handleRoleSelectInteraction(interaction);
      }
    }
  },
};
