import jwt from 'jsonwebtoken';

export const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

export const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });

export const sendTokenResponse = (user, statusCode, res) => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('accessToken',  accessToken,  { ...cookieOpts, maxAge: 7  * 24 * 60 * 60 * 1000 })
    .cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 })
    .json({
      success: true,
      accessToken,
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
      },
    });
};
