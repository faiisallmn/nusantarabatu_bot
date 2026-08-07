const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const path = require("path");

const WELCOME_CHANNEL_ID = "1513865696814043278"; // ganti ini

module.exports = {
  name: "guildMemberAdd",
  once: false,

  async execute(member, client) {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const canvas = createCanvas(1024, 300);
    const ctx = canvas.getContext("2d");

    // Background
    const background = await loadImage(path.join(__dirname, "../assets/welcome_bg.png"));
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Overlay putih di tengah supaya lebih bersih
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Avatar di tengah atas
    const avatarSize = 110;
    const avatarX = centerX;
    const avatarY = 80;

    // Ring luar navy
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2 + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#1a3a5c";
    ctx.fill();
    ctx.restore();

    // Ring dalam putih
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2 + 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    // Avatar
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();

    // Teks WELCOME
    ctx.textAlign = "center";
    ctx.font = "bold 18px Sans";
    ctx.fillStyle = "#2a5298";
    ctx.fillText(" WELCOME ", centerX, 175);

    // Nama user
    ctx.font = "bold 42px Sans";
    ctx.fillStyle = "#1a3a5c";
    ctx.shadowColor = "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 10;
    ctx.fillText(member.user.username, centerX, 222);
    ctx.shadowBlur = 0;

    // Sub teks
    ctx.font = "17px Sans";
    ctx.fillStyle = "#4a6fa5";
    ctx.fillText(`Member ke-${member.guild.memberCount}  •  ${member.guild.name}`, centerX, 253);

    // Reset textAlign
    ctx.textAlign = "left";

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: "welcome.png" });

    const embed = new EmbedBuilder().setDescription(`Halo <@${member.id}>, selamat datang di **${member.guild.name}**!\nBaca rules dan enjoy! 🎉`).setColor(0x2a5298).setImage("attachment://welcome.png").setTimestamp();

    await channel.send({ embeds: [embed], files: [attachment] });
  },
};
