const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Kumpulan command untuk sistem verifikasi cross-server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("setup")
        .setDescription("Kirim panel verifikasi ke channel ini")
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === "setup") {
      const embed = new EmbedBuilder()
        .setTitle("🛡️ Verifikasi Member")
        .setDescription("Selamat datang di server kami!\n\nUntuk membuka kunci channel dan bergabung dengan komunitas, Anda **diwajibkan** untuk bergabung terlebih dahulu ke server Discord **Motion Ime**.\n\nJika Anda sudah bergabung di sana, silakan klik tombol di bawah ini untuk verifikasi.")
        .setColor("#5865F2")
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text: "Sistem Keamanan Cross-Server" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verify_btn")
          .setLabel("Verifikasi Sekarang")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel("Join Motion Ime")
          .setURL("https://discord.com/invite/motionime")
          .setStyle(ButtonStyle.Link)
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: "✅ Panel verifikasi berhasil dikirim!", flags: 64 });
    }
  },
};
