module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let payload = req.body || {};
    if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch(e) {}
    }

    const tracking_no = payload.tracking_no || payload.waybill || payload.waybill_id || req.query?.tracking_no || 'BE4542289';
    const status = payload.status || payload.current_status || 'Delivered';

    return res.status(200).json({
        status: 200,
        success: true,
        message: "Trans Express Webhook endpoint active & ready on CodFlow OMS",
        tracking_no,
        status
    });
};
