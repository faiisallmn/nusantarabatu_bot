const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  AttachmentBuilder,
  ChannelType,
} = require("discord.js");
const path = require("path");

const ANNOUNCE_MODAL_ID = "announce_modal";
const ANNOUNCE_TITLE_INPUT_ID = "announce_title";
const ANNOUNCE_MESSAGE_INPUT_ID = "announce_message";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Kirim announcement ke channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId(ANNOUNCE_MODAL_ID)
      .setTitle("Buat Announcement");

    const titleInput = new TextInputBuilder()
      .setCustomId(ANNOUNCE_TITLE_INPUT_ID)
      .setLabel("Header")
      .setPlaceholder("Masukkan header announcement")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(256)
      .setRequired(true);

    const messageInput = new TextInputBuilder()
      .setCustomId(ANNOUNCE_MESSAGE_INPUT_ID)
      .setLabel("Isi pesan")
      .setPlaceholder("Masukkan isi announcement")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(4000)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(messageInput),
    );

    await interaction.showModal(modal);
  },

  async handleModalSubmit(interaction) {
    const judul = interaction.fields.getTextInputValue(ANNOUNCE_TITLE_INPUT_ID);
    const pesan = interaction.fields.getTextInputValue(ANNOUNCE_MESSAGE_INPUT_ID);
    const bannerPath = path.join(__dirname, "../../assets/announcement_banner.png");
    const banner = new AttachmentBuilder(bannerPath, { name: "announcement_banner.png" });
    const botAvatar = interaction.client.user.displayAvatarURL({ extension: "png", size: 64 });

    const embed = new EmbedBuilder()
      .setAuthor({ name: "✨ANNOUNCEMENT✨" })
      .setTitle(judul)
      .setDescription(pesan)
      .setColor(0x20a8e0)
      .setImage("attachment://announcement_banner.png")
      .setTimestamp()
      .setFooter({
        text: "Nusantarabatu.id",
        iconURL: botAvatar,
      });

    await interaction.reply({ embeds: [embed], files: [banner] });

    if (interaction.channel?.type === ChannelType.GuildAnnouncement) {
      try {
        const announcementMessage = await interaction.fetchReply();
        await announcementMessage.crosspost();
      } catch (error) {
        console.error("Gagal mem-publish announcement:", error);
        await interaction.followUp({
          content: "⚠️ Announcement berhasil dikirim, tetapi gagal di-publish otomatis. Pastikan bot memiliki izin **Manage Messages**.",
          flags: 64,
        });
      }
    }
  },

  modalId: ANNOUNCE_MODAL_ID,
};
