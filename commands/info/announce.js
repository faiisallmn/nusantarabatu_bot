const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Kirim announcement ke channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) => opt.setName("judul").setDescription("Judul announcement").setRequired(true))
    .addStringOption((opt) => opt.setName("pesan").setDescription("Isi pesan").setRequired(true)),

  async execute(interaction) {
    const judul = interaction.options.getString("judul");
    const pesan = interaction.options.getString("pesan");

    const embed = new EmbedBuilder()
      .setTitle(`📢 ${judul}`)
      .setDescription(pesan)
      .setColor(0x5865f2)
      .setTimestamp()
      .setFooter({ text: `Diumumkan oleh ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  },
};
