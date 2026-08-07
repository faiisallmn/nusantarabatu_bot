const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban member dari server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) => opt.setName("target").setDescription("Member yang mau di-ban").setRequired(true))
    .addStringOption((opt) => opt.setName("reason").setDescription("Alasan ban").setRequired(false))
    .addIntegerOption((opt) => opt.setName("hapus_pesan").setDescription("Hapus pesan berapa hari ke belakang (0-7)").setRequired(false).setMinValue(0).setMaxValue(7)),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason = interaction.options.getString("reason") ?? "Tidak ada alasan";
    const deleteMessageDays = interaction.options.getInteger("hapus_pesan") ?? 0;

    if (!target.bannable) {
      return interaction.reply({
        content: "❌ Gua tidak bisa ban member ini (role terlalu tinggi).",
        ephemeral: true,
      });
    }

    await target.ban({ reason, deleteMessageSeconds: deleteMessageDays * 86400 });

    const embed = new EmbedBuilder()
      .setTitle("🔨 Member Banned")
      .addFields(
        { name: "Member", value: `${target.user.tag}`, inline: true },
        { name: "Oleh", value: `${interaction.user.tag}`, inline: true },
        { name: "Alasan", value: reason },
        { name: "Pesan dihapus", value: `${deleteMessageDays} hari` }
      )
      .setColor(0xff0000)
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
