const crypto = require('crypto');

/**
 * Generate PayU Signature using RSA Private Key
 * For newer PayU Merchant Web Checkout (V2)
 */
const generateSignature = (payload, privateKey) => {
    try {
        // payload usually contains key|txnid|amount|productinfo|firstname|email|...
        const sign = crypto.createSign('SHA256');
        sign.update(payload);
        return sign.sign(privateKey, 'base64');
    } catch (error) {
        console.error('Error generating PayU signature:', error);
        throw error;
    }
};

/**
 * Generate SHA512 Hash (Classic PayU)
 * hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 */
const generateHash = (data, salt) => {
    const { key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 } = data;
    
    // PayU Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    // 17 fields = 16 pipes
    const hashFields = [
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        udf1 || '',
        udf2 || '',
        udf3 || '',
        udf4 || '',
        udf5 || '',
        '', // udf6 slot
        '', // udf7 slot
        '', // udf8 slot
        '', // udf9 slot
        '', // udf10 slot
        salt
    ];

    const hashString = hashFields.join('|');
    console.log(`[PayU FINAL HASH STRING] ${hashString}`);

    return crypto.createHash('sha512').update(hashString).digest('hex');
};

module.exports = {
    generateSignature,
    generateHash
};
