const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Kirim notifikasi update realm")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) => opt.setName("realm").setDescription("Nama realm (contoh: Tycoon, Survival-1)").setRequired(true))
    .addStringOption((opt) => opt.setName("role").setDescription("Role yang di-ping (contoh: @Semi-Vanilla)").setRequired(true))
    .addStringOption((opt) => opt.setName("changes").setDescription("Perubahan, pisah dengan | (contoh: Fixed bug|Added feature)").setRequired(true))
    .addStringOption((opt) => opt.setName("note").setDescription("Catatan tambahan (opsional)").setRequired(false)),

  async execute(interaction) {
    const realm = interaction.options.getString("realm");
    const role = interaction.options.getString("role");
    const changes = interaction.options.getString("changes");
    const note = interaction.options.getString("note");

    // Split changes by | jadi bullet list
    const changeList = changes
      .split("|")
      .map((c) => `• ${c.trim()}`)
      .join("\n");

    let description = `**Changes:**\n${changeList}`;
    if (note) {
      description += `\n**Note:**\n${note}`;
    }

    const embed = new EmbedBuilder()
      .setTitle("🗃️ Realm: " + realm)
      .setDescription(description)
      .setColor(0xe67e22)
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL(),
      });

    await interaction.reply({
      content: `📢 — **New Update!**\n${role}`,
      embeds: [embed],
    });
  },
};
