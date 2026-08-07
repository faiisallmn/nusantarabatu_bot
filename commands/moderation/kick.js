const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick member dari server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) => opt.setName("target").setDescription("Member yang mau di-kick").setRequired(true))
    .addStringOption((opt) => opt.setName("reason").setDescription("Alasan kick").setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason = interaction.options.getString("reason") ?? "Tidak ada alasan";

    // Cek apakah target bisa di-kick
    if (!target.kickable) {
      return interaction.reply({
        content: "❌ Gua tidak bisa kick member ini (role terlalu tinggi).",
        ephemeral: true,
      });
    }

    await target.kick(reason);

    const embed = new EmbedBuilder()
      .setTitle("👢 Member Kicked")
      .addFields({ name: "Member", value: `${target.user.tag}`, inline: true }, { name: "Oleh", value: `${interaction.user.tag}`, inline: true }, { name: "Alasan", value: reason })
      .setColor(0xffa500)
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
