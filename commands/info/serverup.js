const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverup")
    .setDescription("Kirim notifikasi maintenance selesai")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) => opt.setName("realm").setDescription("Nama realm yang sudah online").setRequired(true))
    .addStringOption((opt) => opt.setName("catatan").setDescription("Catatan tambahan (opsional)").setRequired(false)),

  async execute(interaction) {
    const realm = interaction.options.getString("realm");
    const catatan = interaction.options.getString("catatan") ?? "Tidak ada catatan tambahan.";

    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL(),
      })
      .setTitle("✨ Maintenance Selesai")
      .setDescription(`Proses maintenance telah selesai. Server atau realms yang terdampak kini sudah kembali **Online** dan dapat diakses seperti biasa.`)
      .addFields(
        {
          name: "🗃️ Info",
          value: `\`\`\`Realm : ${realm}\`\`\``,
        },
        {
          name: "📝 Catatan",
          value: catatan,
        },
        {
          name: "\u200b",
          value: "Terima kasih atas kesabaran Anda!",
        }
      )
      .setColor(0x57f287)
      .setTimestamp()
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL(),
      });

    await interaction.reply({ content: "@everyone", embeds: [embed] });
  },
};
