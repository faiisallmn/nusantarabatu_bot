const { EmbedBuilder } = require("discord.js");

async function handleVerifyInteraction(interaction) {
  const { customId, user, guild, client } = interaction;

  if (customId === "verify_btn") {
    await interaction.deferReply({ flags: 64 }); // Ephemeral reply

    const targetServerId = process.env.MOTION_IME_SERVER_ID;
    const verifiedRoleId = process.env.VERIFIED_ROLE_ID;

    if (!targetServerId || targetServerId === "masukkan_id_server_motion_ime_disini") {
      return interaction.editReply({ content: "❌ Sistem belum dikonfigurasi oleh Admin (ID Server Motion Ime belum diisi)." });
    }

    if (!verifiedRoleId || verifiedRoleId === "masukkan_id_role_verified_disini") {
      return interaction.editReply({ content: "❌ Sistem belum dikonfigurasi oleh Admin (ID Role Verified belum diisi)." });
    }

    try {
      // 1. Dapatkan object Server Motion Ime
      const targetGuild = await client.guilds.fetch(targetServerId).catch(() => null);
      
      if (!targetGuild) {
        return interaction.editReply({ content: "❌ Bot belum diundang ke server Motion Ime! Silakan hubungi admin untuk mengundang bot ini ke sana." });
      }

      // 2. Cek apakah user ada di server Motion Ime
      const memberInTarget = await targetGuild.members.fetch(user.id).catch(() => null);

      if (!memberInTarget) {
        const embed = new EmbedBuilder()
          .setTitle("❌ Verifikasi Gagal")
          .setDescription("Anda belum bergabung dengan server **Motion Ime**.\n\nSilakan bergabung terlebih dahulu melalui link berikut: https://discord.com/invite/motionime\n\nSetelah bergabung, klik tombol verifikasi lagi.")
          .setColor("#ff0000");

        return interaction.editReply({ embeds: [embed] });
      }

      // 3. Berikan role verified di server ini
      const memberInCurrent = await guild.members.fetch(user.id).catch(() => null);
      
      if (memberInCurrent) {
        await memberInCurrent.roles.add(verifiedRoleId);
        
        const successEmbed = new EmbedBuilder()
          .setTitle("✅ Verifikasi Berhasil")
          .setDescription("Terima kasih telah bergabung di Motion Ime! Anda sekarang memiliki akses ke semua channel di server ini.")
          .setColor("#00ff00");
          
        return interaction.editReply({ embeds: [successEmbed] });
      }

    } catch (error) {
      console.error("Error during cross-server verification:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan pada sistem saat proses verifikasi. Coba lagi nanti." });
    }
  }
}

module.exports = { handleVerifyInteraction };
