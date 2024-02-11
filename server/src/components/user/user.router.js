import express from 'express';

class UserRouter {
  constructor(userController) {
    this.userController = userController;
  }

  getRouter() {
    const router = express.Router();
    router.route('/:id').get(this.userController.getUser);
    router.route('/').get(this.userController.getUsers);
    router.route('/').post(this.userController.createUser);
    router.route('/create-payment-intent').post(this.userController.createCheckout );
    return router;
  }
}

export default UserRouter;
