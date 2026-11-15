async function handleRoleSelectInteraction(interaction) {
  if (interaction.customId === "role_select_menu" || interaction.customId === "role_select_notif") {
    await interaction.deferReply({ flags: 64 });

    const selectedValues = interaction.values;
    const member = interaction.member;

    let roleMap = {};

    if (interaction.customId === "role_select_menu") {
      roleMap = {
        role_survival_earth: process.env.ROLE_SURVIVAL_EARTH,
        role_oneblock: process.env.ROLE_ONEBLOCK
      };
    } else if (interaction.customId === "role_select_notif") {
      roleMap = {
        role_notif_social: process.env.ROLE_NOTIF_SOCIAL,
      };
    }

    let addedRoles = [];
    let removedRoles = [];
    let errors = [];

    for (const [key, roleId] of Object.entries(roleMap)) {
      if (!roleId || roleId.includes("masukkan_id_role_")) {
        continue; // Role belum di set di .env
      }

      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        errors.push(`Role untuk ${key} tidak ditemukan di server.`);
        continue;
      }

      try {
        if (selectedValues.includes(key)) {
          if (!member.roles.cache.has(roleId)) {
            await member.roles.add(role);
            addedRoles.push(role.name);
          }
        } else {
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            removedRoles.push(role.name);
          }
        }
      } catch (error) {
        console.error(`Gagal mengubah role ${role.name}:`, error);
        errors.push(`Gagal mengubah role ${role.name} (mungkin bot butuh permission lebih tinggi).`);
      }
    }

    let responseMsg = "**Roles telah diperbarui!**\n";
    if (addedRoles.length > 0) responseMsg += `✅ Ditambahkan: ${addedRoles.join(", ")}\n`;
    if (removedRoles.length > 0) responseMsg += `❌ Dihapus: ${removedRoles.join(", ")}\n`;
    if (addedRoles.length === 0 && removedRoles.length === 0) responseMsg += "Tidak ada perubahan role.";

    if (errors.length > 0) {
      responseMsg += `\n⚠️ **Peringatan:**\n${errors.join("\n")}`;
    }

    await interaction.editReply({ content: responseMsg });
  }
}

module.exports = { handleRoleSelectInteraction };
