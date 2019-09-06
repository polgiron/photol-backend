import jwt from 'express-jwt';

export const authGuard = jwt({
  secret: process.env.TOKEN_SECRET,
  userProperty: 'payload'
});
