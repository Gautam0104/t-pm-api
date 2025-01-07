module.exports = (req, res, next) => {
    if (req.session && req.session.cookie) {
        const now = new Date();
        if (req.session.cookie.expires && new Date(req.session.cookie.expires) < now) {
            req.session.destroy();
            return res.status(401).send('Session expired.');
        }
    }
    next();
};
