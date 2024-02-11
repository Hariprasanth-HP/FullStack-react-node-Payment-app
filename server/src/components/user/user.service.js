class UserService {
  constructor() {
    this.users = [];
  }
  addUser = (user) => {
    this.users.push(user);
    return user;
  };

  getUsers = () => {
console.log(this.users);
    
    return this.users};

  getUser = (id) => {

    const user = this.users.find((u) => u.id === id);
    return user;
  };
}

export default UserService;
