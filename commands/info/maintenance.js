const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("maintenance")
    .setDescription("Kirim notifikasi maintenance server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) => opt.setName("realm").setDescription("Nama realm (contoh: Tycoon, Survival)").setRequired(true))
    .addStringOption((opt) => opt.setName("waktu").setDescription("Waktu maintenance (contoh: 18:00 - 18:30)").setRequired(true))
    .addStringOption((opt) => opt.setName("alasan").setDescription("Alasan singkat (contoh: Update & Fix Spawner)").setRequired(true))
    .addStringOption((opt) => opt.setName("detail").setDescription("Detail pekerjaan (contoh: Repair broken Spawner)").setRequired(true)),

  async execute(interaction) {
    const realm = interaction.options.getString("realm");
    const waktu = interaction.options.getString("waktu");
    const alasan = interaction.options.getString("alasan");
    const detail = interaction.options.getString("detail");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL(),
      })
      .setTitle("⚠️ Pemberitahuan Maintenance Server")
      .setDescription(`Kami akan melakukan **Maintenance** untuk melakukan **adjustment terhadap server**, yang akan berdampak pada akses server selama periode tersebut.`)
      .addFields(
        {
          name: "🗃️ Maintenance Information",
          value: ["```", `Realm   : ${realm}`, `Time    : ${waktu}`, `Reason  : ${alasan}`, "```"].join("\n"),
        },
        {
          name: "🔧 Maintenance Details",
          value: `\`\`\`${detail}\`\`\``,
        },
        {
          name: "\u200b",
          value: `Selama proses maintenance berlangsung, **Realms tidak dapat diakses**. Kami mohon maaf atas ketidaknyamanan ini dan akan berusaha semaksimal mungkin untuk menyelesaikan proses maintenance secepatnya.\n\nTerima kasih atas pengertiannya. ❤️`,
        }
      )
      .setColor(0xffa500)
      .setTimestamp()
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL(),
      });

    await interaction.reply({ content: "@everyone", embeds: [embed] });
  },
};
