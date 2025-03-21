// Check if current auth is User or Merchant

const isUser = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            res.status(200).json({
                message: 'Only users can view these details'});
        }
        next();
    }
}

const isMerchant = (role) => {
    return (req, res, next) => {
        // console.log("inside ismerchant:- ",req.user.role);
        if (req.user.role !== role) {
            return res.status(200).json({ message: 'Only merchants can access this resource' });
        }
        next();
    }
}

module.exports = { isUser,isMerchant}