const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

const UPDATE_MODAL_ID = "update_modal";
const UPDATE_REALM_INPUT_ID = "update_realm";
const UPDATE_ROLE_INPUT_ID = "update_role";
const UPDATE_CHANGES_INPUT_ID = "update_changes";

function findRole(interaction, roleInput) {
  const cleanInput = roleInput.trim();
  const mentionMatch = cleanInput.match(/^<@&(\d+)>$/);
  const roleId = mentionMatch ? mentionMatch[1] : /^\d+$/.test(cleanInput) ? cleanInput : null;

  if (roleId) {
    return interaction.guild.roles.cache.get(roleId) ?? null;
  }

  const roleName = cleanInput.replace(/^@/, "").toLowerCase();
  return interaction.guild.roles.cache.find((role) => role.name.toLowerCase() === roleName) ?? null;
}

function formatChanges(changes) {
  const items = changes
    .split(/\||\r?\n/)
    .map((change) => change.trim())
    .filter(Boolean);

  const formatted = items.map((change) => `• ${change}`).join("\n");
  return formatted.length > 3900 ? `${formatted.slice(0, 3897)}...` : formatted;
}

module.exports = {
  data: new SlashCommandBuilder().setName("update").setDescription("Kirim notifikasi update realm").setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId(UPDATE_MODAL_ID).setTitle("Buat Update Realm");

    const realmInput = new TextInputBuilder().setCustomId(UPDATE_REALM_INPUT_ID).setLabel("Nama Realms").setPlaceholder("Contoh: Survival, Skyblock, atau Tycoon").setStyle(TextInputStyle.Short).setMaxLength(100).setRequired(true);

    const roleInput = new TextInputBuilder()
      .setCustomId(UPDATE_ROLE_INPUT_ID)
      .setLabel("Role yang ingin di-tag")
      .setPlaceholder("Mention role, ID role, atau nama role")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);

    const changesInput = new TextInputBuilder()
      .setCustomId(UPDATE_CHANGES_INPUT_ID)
      .setLabel("Perubahan")
      .setPlaceholder("Tulis perubahan. Pisahkan dengan | atau baris baru")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(3900)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(realmInput), new ActionRowBuilder().addComponents(roleInput), new ActionRowBuilder().addComponents(changesInput));

    await interaction.showModal(modal);
  },

  async handleModalSubmit(interaction) {
    const realm = interaction.fields.getTextInputValue(UPDATE_REALM_INPUT_ID).trim();
    const roleInput = interaction.fields.getTextInputValue(UPDATE_ROLE_INPUT_ID).trim();
    const changes = interaction.fields.getTextInputValue(UPDATE_CHANGES_INPUT_ID);
    const role = findRole(interaction, roleInput);
    const roleMention = role ? `<@&${role.id}>` : roleInput;
    const botAvatar = interaction.client.user.displayAvatarURL({ extension: "png", size: 64 });
    const embed = new EmbedBuilder()
      .setTitle("📢 REALM UPDATE")
      .setDescription(`» **${realm}**\n\n### 📋 Changelog\n${formatChanges(changes)}`)
      .setColor(0x2ecc71)
      .setTimestamp()
      .setFooter({
        text: "Nusantarabatu.id",
        iconURL: botAvatar,
      });

    await interaction.reply({
      content: `# 🚨 UPDATE TERBARU!\n${roleMention} — mohon periksa changelog di bawah.`,
      embeds: [embed],
      allowedMentions: role ? { roles: [role.id] } : { parse: [] },
    });
  },

  modalId: UPDATE_MODAL_ID,
};
