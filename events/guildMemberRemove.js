const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const path = require("path");

const LEAVE_CHANNEL_ID = "1513865696814043278"; // ganti ini

module.exports = {
  name: "guildMemberRemove",
  once: false,

  async execute(member, client) {
    const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
    if (!channel) return;

    const canvas = createCanvas(1024, 300);
    const ctx = canvas.getContext("2d");

    // Background sama
    const background = await loadImage(path.join(__dirname, "../assets/welcome_bg.png"));
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Overlay merah muda tipis
    ctx.fillStyle = "rgba(255, 210, 210, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;

    // Avatar di tengah atas
    const avatarSize = 110;
    const avatarX = centerX;
    const avatarY = 80;

    // Ring luar merah gelap
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2 + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#8b1a1a";
    ctx.fill();
    ctx.restore();

    // Ring dalam putih
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2 + 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    // Avatar grayscale
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const avatar = await loadImage(avatarURL);

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.filter = "grayscale(60%)";
    ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
    ctx.filter = "none";
    ctx.restore();

    // Teks GOODBYE
    ctx.textAlign = "center";
    ctx.font = "bold 18px Sans";
    ctx.fillStyle = "#8b1a1a";
    ctx.fillText(" GOODBYE ", centerX, 175);

    // Nama user
    ctx.font = "bold 42px Sans";
    ctx.fillStyle = "#5a1010";
    ctx.shadowColor = "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 10;
    ctx.fillText(member.user.username, centerX, 222);
    ctx.shadowBlur = 0;

    // Sub teks
    ctx.font = "17px Sans";
    ctx.fillStyle = "#8b4a4a";
    ctx.fillText("Sampai Jumpa lagi !!", centerX, 253);

    ctx.textAlign = "left";

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: "goodbye.png" });

    const embed = new EmbedBuilder().setDescription(`**${member.user.username}** telah meninggalkan server. Sampai jumpa! 👋`).setColor(0x8b1a1a).setImage("attachment://goodbye.png").setTimestamp();

    await channel.send({ embeds: [embed], files: [attachment] });
  },
};
