const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Event = require('../models/eventModel');

// Thiết lập transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: 'a3556ab6fd226a',
        pass: '059c16de930cf7'
    }
});

// Cron chạy mỗi phút
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const nowUTC = new Date(now.toISOString());

        console.log(`⏰ [CRON] Đang kiểm tra sự kiện lúc ${nowUTC.toISOString()}`);

        const events = await Event.aggregate([
            { $unwind: "$events" },
            {
                $match: {
                    "events.reminderEnabled": true,
                    "events.reminderSent": { $ne: true },
                    "events.startTime": {
                        $gte: new Date(nowUTC.getTime() - 60000),
                        $lte: new Date(nowUTC.getTime() + 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    email: 1,
                    event: "$events"
                }
            }
        ]);

        console.log(`🔍 Tìm thấy ${events.length} sự kiện cần kiểm tra gửi nhắc nhở.`);

        for (const doc of events) {
            const event = doc.event;
            const userEmail = doc.email;

            console.log(`📅 Kiểm tra sự kiện: "${event.title}" của ${userEmail}`);

            const reminderTime = new Date(new Date(event.startTime).getTime() - event.reminderMinutes * 60000);

            console.log(`🕒 Thời gian cần gửi nhắc: ${reminderTime.toISOString()}`);
            console.log(`🕒 Thời gian hiện tại UTC: ${nowUTC.toISOString()}`);

            if (Math.abs(reminderTime - nowUTC) < 60000) {
                console.log(`📨 Đang gửi nhắc nhở tới ${event.reminderEmail || userEmail}`);

                await transporter.sendMail({
                    from: '"TOEIC Reminder" <noreply@yourapp.com>',
                    to: event.reminderEmail || userEmail,
                    subject: `🔔 Nhắc nhở: ${event.title}`,
                    html: `
                        <h2>🔔 Nhắc nhở sự kiện sắp diễn ra!</h2>
                        <p><strong>Tiêu đề:</strong> ${event.title}</p>
                        <p><strong>Mô tả:</strong> ${event.description || 'Không có mô tả'}</p>
                        <p><strong>Thời gian bắt đầu:</strong> ${new Date(event.startTime).toLocaleString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            dateStyle: 'short',
                            timeStyle: 'short'
                        })}</p>
                        <p><strong>Thời gian kết thúc:</strong> ${new Date(event.endTime).toLocaleString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            dateStyle: 'short',
                            timeStyle: 'short'
                        })}</p>
                        <p><a href="http://localhost:3000/home">➡ Xem sự kiện</a></p>
                    `
                });

                console.log(`✅ Đã gửi email nhắc nhở: ${event.title}`);

                const updateResult = await Event.updateOne(
                    { email: userEmail, "events.id": event.id },
                    { $set: { "events.$.reminderSent": true } }
                );

                console.log(`📌 Đã cập nhật trạng thái reminderSent:`, updateResult.modifiedCount);
            } else { 
                console.log(`⌛ Chưa đến thời điểm gửi nhắc sự kiện "${event.title}".`);
            }
        }
    } catch (err) {
        console.error('❌ Lỗi khi gửi nhắc nhở:', err);
    }
});
