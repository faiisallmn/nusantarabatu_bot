const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Kumpulan command untuk sistem select role")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("setup")
        .setDescription("Kirim panel select role untuk Game Modes")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("notification")
        .setDescription("Kirim panel select role untuk Notifikasi")
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === "setup") {
      const bannerPath = path.join(__dirname, "../../assets/gamemode_banner.png");
      const attachment = new AttachmentBuilder(bannerPath);

      const embed = new EmbedBuilder()
        .setTitle("Games Catalog")
        .setDescription("Silahkan pilih roles sesuai dengan keinginan kamu untuk mengakses channel yang tersedia dibawah sini!\n\n🌍 | **Survival Earth**\n🔒 | **Coming Soon**")
        .setColor("#2b2d31")
        .setImage("attachment://gamemode_banner.png");

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

      await interaction.channel.send({ embeds: [embed], components: [row], files: [attachment] });
      await interaction.reply({ content: "✅ Panel select role (Game Mode) berhasil dikirim!", flags: 64 });
    } 
    
    else if (interaction.options.getSubcommand() === "notification") {
      const bannerPath = path.join(__dirname, "../../assets/notification_banner.png");
      const attachment = new AttachmentBuilder(bannerPath);

      const embed = new EmbedBuilder()
        .setTitle("Notification Roles")
        .setDescription("Silahkan pilih role notifikasi agar kamu tidak ketinggalan update terbaru dari kami!\n\n📱 | **Social Media**")
        .setColor("#2b2d31")
        .setImage("attachment://notification_banner.png");

      const select = new StringSelectMenuBuilder()
        .setCustomId("role_select_notif")
        .setPlaceholder("Click menu ini untuk memilih role notifikasi!")
        .setMinValues(0)
        .setMaxValues(1)
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Social Media Notification")
            .setValue("role_notif_social")
            .setEmoji("📱")
            .setDescription("Ping saat ada update di sosial media kami")
        );

      const row = new ActionRowBuilder().addComponents(select);

      await interaction.channel.send({ embeds: [embed], components: [row], files: [attachment] });
      await interaction.reply({ content: "✅ Panel select role (Notification) berhasil dikirim!", flags: 64 });
    }
  },
};
