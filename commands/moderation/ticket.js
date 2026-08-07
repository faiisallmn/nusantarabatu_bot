const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Setup sistem tiket.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Kirim panel tiket ke channel ini.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("Lihat log transkrip tiket.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("ID Tiket (misal: A9F3K2)")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "setup") {
      const embed = new EmbedBuilder()
        .setTitle("📩 Layanan Bantuan / Ticket")
        .setDescription(
          "Klik tombol di bawah ini untuk membuka tiket baru.\nMohon gunakan tiket dengan bijak dan jelaskan keperluan Anda dengan detail."
        )
        .setColor("#0099ff")
        .setFooter({ text: "Ticket System Ting Dong" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_open_btn")
          .setLabel("Buka Ticket")
          .setEmoji("📩")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: "✅ Panel tiket berhasil dikirim!", flags: 64 });
    } else if (subcommand === "view") {
      const ticketId = interaction.options.getString("id").toUpperCase();
      const filePath = path.join(__dirname, "../../transcripts", `${ticketId}.html`);

      if (!fs.existsSync(filePath)) {
        return interaction.reply({ content: `❌ Transkrip untuk tiket ID **${ticketId}** tidak ditemukan.`, flags: 64 });
      }

      await interaction.reply({
        content: `📑 Berikut adalah transkrip untuk tiket **${ticketId}**. (Unduh file ini dan buka di browser)`,
        files: [filePath],
        flags: 64,
      });
    }
  },
};
