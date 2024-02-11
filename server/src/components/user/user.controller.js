import User from './user.entities.js';
import stripe from 'stripe';

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  createUser = (req, res) => {
    const user = new User(req.body.email, req.body.password, req.body.age);
    return res.status(201).send(this.userService.addUser(user));
  };

  getUsers = (_, res) => res.status(200).send(this.userService.getUsers());

  getUser = (req, res) => {
    const { id } = req.params;
    return res.status(200).send(this.userService.getUser(id));
  };
 
  createCheckout=async (req, res) => {
    const stripe1 = stripe('sk_test_51Oi7WQSJhdPkRE2ct6BKVCvXO6MuCmqbVbmDlLTrmhuVd9FN1aq5yL7xtEUXEh3R0fHL4QpgEjTDealFK5R0EELS00eeCwTmn7');

    const calculateOrderAmount = (items) => {
      // Replace this constant with a calculation of the order's amount
      // Calculate the order total on the server to prevent
      // people from directly manipulating the amount on the client
      return 50;
    };
    const { items } = req.body;
  
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe1.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "inr",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });
  
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  }
}

export default UserController;
