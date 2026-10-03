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

    const waybill_id = payload.waybill_id || payload.waybill_no || req.query?.waybill_id || '';
    const status = payload.current_status || payload.delivery_status || payload.status || 'Delivered';
    const time = payload.last_update_time || new Date().toISOString().slice(0, 19).replace('T', ' ');

    return res.status(200).json({
        status: "success",
        code: 200,
        success: true,
        message: "Fardar Express Webhook endpoint active & ready on CodFlow OMS",
        waybill_id: waybill_id || "API5173879",
        current_status: status,
        last_update_time: time
    });
};
