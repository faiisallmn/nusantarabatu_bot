const { checkAutoDeleteTickets } = require("../utils/ticketHandler");

module.exports = {
  name: "clientReady",
  once: true,

  execute(client) {
    console.log(`✅ Bot online sebagai ${client.user.tag}`);
    client.user.setActivity("", { type: 3 });

    // Jalankan cek auto-delete pertama kali saat bot nyala
    checkAutoDeleteTickets(client);

    // Lalu jadwalkan berjalan setiap 1 jam (3600000 ms)
    setInterval(() => {
      checkAutoDeleteTickets(client);
    }, 60 * 60 * 1000);
  },
};
