const { 
  ActionRowBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ChannelType, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  AttachmentBuilder
} = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");
const fs = require("fs");
const path = require("path");

async function handleTicketInteraction(interaction) {
  const { customId, guild, user } = interaction;

  // 1. Tombol Buka Ticket (menampilkan Modal)
  if (customId === "ticket_open_btn") {
    const modal = new ModalBuilder()
      .setCustomId("ticket_modal")
      .setTitle("Buka Ticket Baru");

    const nameInput = new TextInputBuilder()
      .setCustomId("ticket_name")
      .setLabel("Nama")
      .setPlaceholder("Masukkan nama / in-game name Anda")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);

    const platformInput = new TextInputBuilder()
      .setCustomId("ticket_platform")
      .setLabel("Versi Minecraft")
      .setPlaceholder("Ketik: Java atau Bedrock")
      .setValue("Java")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20)
      .setRequired(true);

    const messageInput = new TextInputBuilder()
      .setCustomId("ticket_message")
      .setLabel("Alasan membuka ticket")
      .setPlaceholder("Jelaskan masalah atau keperluan Anda secara detail")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(3900)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(platformInput),
      new ActionRowBuilder().addComponents(messageInput),
    );

    await interaction.showModal(modal);
    return;
  }

  // 2. Submit Modal (Membuat channel tiket)
  if (customId === "ticket_modal" && interaction.isModalSubmit()) {
    await interaction.deferReply({ flags: 64 });
    
    const name = interaction.fields.getTextInputValue("ticket_name");
    const rawPlatform = interaction.fields.getTextInputValue("ticket_platform");
    const message = interaction.fields.getTextInputValue("ticket_message");

    // Normalisasi versi Minecraft: terima "java", "bedrock", "be", "pe", dll.
    const normalized = rawPlatform.toLowerCase().trim();
    const platform = normalized.includes("bedrock") || normalized === "be" || normalized === "pe"
      ? "Bedrock Edition"
      : "Java Edition";
    const categoryId = process.env.TICKET_CATEGORY_ID;
    const adminRoleId = process.env.ADMIN_ROLE_ID;
    const guardianRoleId = process.env.GUARDIAN_ROLE_ID;

    // Cek apakah user sudah punya tiket yang AKTIF (abaikan yang sudah diarsipkan)
    const existingChannel = guild.channels.cache.find(c => {
      if (c.name.startsWith(`ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}-`)) {
        // Jika topic mengandung "|", berarti tiket sudah diarsipkan/ditutup sementara
        if (c.topic && c.topic.includes("|")) return false;
        return true; // Tiket masih aktif
      }
      return false;
    });

    if (existingChannel) {
      return interaction.editReply({ content: `❌ Anda sudah memiliki tiket yang sedang aktif.` });
    }

    // Generate Ticket ID
    const ticketId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const channelName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${ticketId}`;

    try {
      const permissionOverwrites = [
        {
          id: guild.id, // @everyone
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id, // User yang membuat tiket
          allow: [
            PermissionFlagsBits.ViewChannel, 
            PermissionFlagsBits.SendMessages, 
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.MentionEveryone // Agar bisa tag role
          ],
        },
      ];

      // Tambahkan role Admin jika diset di .env
      if (adminRoleId && adminRoleId !== "masukkan_id_role_admin_disini") {
        permissionOverwrites.push({
          id: adminRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel, 
            PermissionFlagsBits.SendMessages, 
            PermissionFlagsBits.ReadMessageHistory, 
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AddReactions
          ],
        });
      }

      // Tambahkan role Guardian jika diset di .env
      if (guardianRoleId && guardianRoleId !== "masukkan_id_role_guardian_disini") {
        permissionOverwrites.push({
          id: guardianRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel, 
            PermissionFlagsBits.SendMessages, 
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AddReactions
          ],
        });
      }

      let validCategoryId = null;
      if (categoryId && categoryId !== "masukkan_id_kategori_disini") {
        const categoryChannel = guild.channels.cache.get(categoryId);
        if (categoryChannel && categoryChannel.type === ChannelType.GuildCategory) {
          validCategoryId = categoryId;
        } else {
          console.warn(`⚠️ TICKET_CATEGORY_ID (${categoryId}) bukan merupakan Kategori yang valid. Tiket akan dibuat tanpa kategori.`);
        }
      }

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: validCategoryId,
        topic: user.id, // Menyimpan ID pembuat tiket untuk fitur Reopen
        permissionOverwrites: permissionOverwrites,
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Tiket Baru: ${user.username}`)
        .setDescription(
          `Halo ${user}!\n` +
          `Tim <@&${adminRoleId}> / <@&${guardianRoleId}> akan segera merespons tiket Anda.\n\n` +
          `**📝 Alasan membuka ticket:**\n${message}`
        )
        .addFields(
          { name: "👤 Nama", value: name, inline: true },
          { name: "🎮 Versi Minecraft", value: platform, inline: true },
        )
        .setColor("#00ff00")
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close_btn")
          .setLabel("Tutup Ticket")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ content: `${user}`, embeds: [embed], components: [row] });
      await interaction.editReply({ content: `✅ Tiket berhasil dibuat di ${ticketChannel}` });

    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: "❌ Terjadi kesalahan saat membuat tiket." });
    }
    return;
  }

  // 3. Tombol Tutup Ticket (Konfirmasi)
  if (customId === "ticket_close_btn") {
    const embed = new EmbedBuilder()
      .setTitle("🔒 Konfirmasi Tutup Tiket")
      .setDescription("Apakah Anda yakin ingin menutup tiket ini? Tiket akan disembunyikan dari pengguna sebelum dihapus secara permanen.")
      .setColor("#ff0000");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_confirm_close_btn")
        .setLabel("Ya, Tutup")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("ticket_cancel_close_btn")
        .setLabel("Batal")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
    return;
  }

  // 4. Batal Tutup Tiket
  if (customId === "ticket_cancel_close_btn") {
    await interaction.message.delete();
    await interaction.reply({ content: "✅ Pembatalan berhasil.", flags: 64 });
    return;
  }

  // 5. Konfirmasi Tutup Tiket (Arsip & Sembunyikan dari User)
  if (customId === "ticket_confirm_close_btn") {
    await interaction.deferUpdate();
    
    const channel = interaction.channel;
    let ticketCreatorId = channel.topic;

    if (ticketCreatorId && ticketCreatorId.includes("|")) {
      ticketCreatorId = ticketCreatorId.split("|")[0];
    }

    if (ticketCreatorId) {
      await channel.permissionOverwrites.edit(ticketCreatorId, {
        ViewChannel: false
      }).catch(console.error);

      // Tambahkan timestamp saat ini ke topic
      await channel.setTopic(`${ticketCreatorId}|${Date.now()}`).catch(console.error);
    }

    const embed = new EmbedBuilder()
      .setTitle("🔒 Tiket Ditutup")
      .setDescription(`Tiket ini telah ditutup oleh ${user}.\nSilakan pilih untuk membuka kembali tiket ini atau menghapusnya secara permanen.`)
      .setColor("#ffff00");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_reopen_btn")
        .setLabel("Buka Kembali")
        .setEmoji("🔓")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("ticket_delete_btn")
        .setLabel("Hapus Permanen")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger)
    );

    // Hapus pesan konfirmasi sebelumnya
    await interaction.message.delete().catch(() => {});
    await channel.send({ embeds: [embed], components: [row] });
    return;
  }

  // 6. Buka Kembali Tiket (Reopen)
  if (customId === "ticket_reopen_btn") {
    await interaction.deferUpdate();

    const channel = interaction.channel;
    let ticketCreatorId = channel.topic;

    if (ticketCreatorId && ticketCreatorId.includes("|")) {
      ticketCreatorId = ticketCreatorId.split("|")[0];
    }

    if (ticketCreatorId) {
      await channel.permissionOverwrites.edit(ticketCreatorId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        AttachFiles: true,
        EmbedLinks: true,
        AddReactions: true,
        MentionEveryone: true // Agar bisa tag role
      }).catch(console.error);

      // Kembalikan topic ke aslinya (tanpa timestamp)
      await channel.setTopic(ticketCreatorId).catch(console.error);
    }

    const embed = new EmbedBuilder()
      .setTitle("🔓 Tiket Dibuka Kembali")
      .setDescription(`Tiket ini telah dibuka kembali oleh ${user}.`)
      .setColor("#00ff00");

    await interaction.message.delete().catch(() => {});
    await channel.send({ content: ticketCreatorId ? `<@${ticketCreatorId}>` : "", embeds: [embed] });
    return;
  }

  // 7. Hapus Permanen (Transkrip & Delete Channel)
  if (customId === "ticket_delete_btn") {
    await interaction.reply({ content: "⏳ Menyimpan transkrip dan menghapus tiket dalam 5 detik..." });
    
    try {
      const channel = interaction.channel;
      // Ekstrak ID tiket dari nama channel (misal: ticket-faiisallmn-A9F3K2 -> A9F3K2)
      const parts = channel.name.split("-");
      const ticketId = parts[parts.length - 1].toUpperCase();

      const htmlContent = await discordTranscripts.createTranscript(channel, {
        limit: -1,
        returnType: 'string', 
        saveImages: true, 
        poweredBy: false
      });

      // Simpan file secara lokal
      const transcriptsDir = path.join(__dirname, "../transcripts");
      if (!fs.existsSync(transcriptsDir)) {
        fs.mkdirSync(transcriptsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(transcriptsDir, `${ticketId}.html`), htmlContent);

      const logsChannelId = process.env.TICKET_LOGS_CHANNEL_ID;
      if (logsChannelId && logsChannelId !== "masukkan_id_channel_log_tiket_disini") {
        const logsChannel = guild.channels.cache.get(logsChannelId);
        if (logsChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("📑 Tiket Dihapus Permanen")
            .addFields(
              { name: "Ticket ID", value: `**${ticketId}**`, inline: true },
              { name: "Channel", value: channel.name, inline: true },
              { name: "Dihapus Oleh", value: `${user.tag}`, inline: true },
              { name: "Akses Transkrip", value: `Gunakan command \`/ticket view id:${ticketId}\` untuk melihat log riwayat.`}
            )
            .setColor("#ff0000")
            .setTimestamp();
            
          await logsChannel.send({ embeds: [logEmbed] });
        }
      } else {
        // Jika tidak ada channel logs, kirim info ke user via DM
        await user.send({ content: `📑 Tiket (${channel.name}) telah dihapus. Ticket ID: **${ticketId}**` }).catch(() => {});
      }

      setTimeout(async () => {
        await channel.delete().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: "❌ Gagal menyimpan transkrip, tetapi channel akan tetap dihapus..." });
      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 5000);
    }
  }
}

async function checkAutoDeleteTickets(client) {
  const TICKET_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000; // 3 hari
  
  for (const guild of client.guilds.cache.values()) {
    const channels = guild.channels.cache.filter(c => c.name.startsWith("ticket-"));
    
    for (const channel of channels.values()) {
      const topic = channel.topic;
      if (topic && topic.includes("|")) {
        const parts = topic.split("|");
        const timestamp = parseInt(parts[1], 10);
        
        if (!isNaN(timestamp) && (Date.now() - timestamp > TICKET_EXPIRY_MS)) {
          console.log(`[Auto-Delete] Menghapus tiket ${channel.name} karena sudah 3 hari diarsipkan.`);
          
          try {
            const nameParts = channel.name.split("-");
            const ticketId = nameParts[nameParts.length - 1].toUpperCase();

            const htmlContent = await discordTranscripts.createTranscript(channel, {
              limit: -1,
              returnType: 'string', 
              saveImages: true, 
              poweredBy: false
            });

            const transcriptsDir = path.join(__dirname, "../transcripts");
            if (!fs.existsSync(transcriptsDir)) {
              fs.mkdirSync(transcriptsDir, { recursive: true });
            }
            fs.writeFileSync(path.join(transcriptsDir, `${ticketId}.html`), htmlContent);

            const logsChannelId = process.env.TICKET_LOGS_CHANNEL_ID;
            if (logsChannelId && logsChannelId !== "masukkan_id_channel_log_tiket_disini") {
              const logsChannel = guild.channels.cache.get(logsChannelId);
              if (logsChannel) {
                const logEmbed = new EmbedBuilder()
                  .setTitle("📑 Tiket Dihapus Otomatis (3 Hari)")
                  .addFields(
                    { name: "Ticket ID", value: `**${ticketId}**`, inline: true },
                    { name: "Channel", value: channel.name, inline: true },
                    { name: "Dihapus Oleh", value: `Sistem (Auto-Delete)`, inline: true },
                    { name: "Akses Transkrip", value: `Gunakan command \`/ticket view id:${ticketId}\` untuk melihat log riwayat.`}
                  )
                  .setColor("#ff0000")
                  .setTimestamp();
                  
                await logsChannel.send({ embeds: [logEmbed] });
              }
            }

            await channel.delete().catch(() => {});
          } catch (err) {
            console.error(`Gagal menghapus tiket otomatis ${channel.name}:`, err);
          }
        }
      }
    }
  }
}

module.exports = { handleTicketInteraction, checkAutoDeleteTickets };
