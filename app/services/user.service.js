const userService = {

  users: [],

  addUser(socket) {
    userService.users.push({ id: socket.id });
  },

  removeUser(socket) {
    userService.users.splice(userService.users.findIndex((user) => user.id === socket.id), 1);
  },

  getCount() {
    return userService.users.length;
  },

};

module.exports = userService;
