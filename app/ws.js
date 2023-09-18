const debugSocket = require('debug')('app:socket');
const userService = require('./services/user.service');

module.exports = (wsServer) => {
  wsServer.on('connection', (socket) => {
    userService.addUser(socket);

    debugSocket(`Un utilisateur vient de se connecter avec l'id: ${socket.id}, il y a actuellement ${userService.getCount()} utilisateur(s) connecté(s)`);

    socket.on('disconnect', () => {
      userService.removeUser(socket);
      debugSocket(`Un utilisateur vient de se déconnecter avec l'id: ${socket.id}, il y a actuellement ${userService.getCount()} utilisateur(s) connecté(s)`);
      socket.broadcast.emit('userDisconnected', { userId: socket.id });
    });

    socket.emit(
      'serverMessage',
      `Bienvenue sur le serveur de O'drawing, je vous ai attribué l'identifiant suivant : ${socket.id}`,
    );

    socket.on('draw', (data) => {
      // Ici on se retrouve a ne servir QUE d'intermédiaire entre les clients
      // On transmet la portion de dessin aux autres utilisateurs

      // on y rajoute au passage l'id de l'utilisateur
      socket.broadcast.emit('draw', { ...data, userId: socket.id });
      // debugSocket(`L'utilisateur ${socket.id} vient de dessiner : ${JSON.stringify(data)}`);
    });

    socket.on('mouseMove', ({ x, y }) => {
      socket.broadcast.emit('mouseMove', { userId: socket.id, x, y });
    });
  });
};
