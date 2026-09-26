import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized access token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired access token' });
    }
};

export default authenticate;