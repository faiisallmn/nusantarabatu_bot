const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Kumpulan command untuk sistem select role")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("setup")
        .setDescription("Kirim panel select role ke channel ini")
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === "setup") {
      const embed = new EmbedBuilder()
        .setTitle("Games Catalog")
        .setDescription("Silahkan pilih roles sesuai dengan keinginan kamu untuk mengakses channel yang tersedia dibawah sini!\n\n🌍 | **Survival Earth**\n🔒 | **Coming Soon**")
        .setColor("#2b2d31")
        .setImage("https://i.imgur.com/KzR3F9z.png"); // Placeholder image, bisa diganti

      const select = new StringSelectMenuBuilder()
        .setCustomId("role_select_menu")
        .setPlaceholder("Click menu ini untuk memilih roles!")
        .setMinValues(0)
        .setMaxValues(2)
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Survival Earth")
            .setValue("role_survival_earth")
            .setEmoji("🌍")
            .setDescription("Akses channel Survival Earth"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Coming Soon")
            .setValue("role_coming_soon")
            .setEmoji("🔒")
            .setDescription("Akses channel rahasia yang akan datang")
        );

      const row = new ActionRowBuilder().addComponents(select);

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: "✅ Panel select role berhasil dikirim!", flags: 64 });
    }
  },
};
