
sh.addShard("rs0/mongo1:27017,mongo2:27017,mongo3:27017");
sh.enableSharding("restaurantes");
sh.shardCollection("restaurantes.reservas", { idReserva: 1 });
