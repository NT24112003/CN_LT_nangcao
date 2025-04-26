const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Event = require('../models/eventModel');

// Thiết lập transporter cho email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ldhl20012003@gmail.com', // Địa chỉ email của bạn
        pass: 'wwcv fzfc rnmy jwcq'    // Mật khẩu ứng dụng (App Password)
    }
});

// Cron job chạy mỗi phút
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

        console.log(`⏰ [CRON] Kiểm tra sự kiện từ ${now.toISOString()} đến ${twelveHoursLater.toISOString()}`);

        // Tìm các sự kiện cần gửi nhắc nhở
        const events = await Event.aggregate([
            { $unwind: "$events" },
            {
                $match: {
                    "events.reminderEnabled": true,
                    "events.reminderSent": false,
                    "events.startTime": {
                        $gte: now,
                        $lte: twelveHoursLater
                    }
                }
            },
            {
                $project: {
                    email: 1,
                    event: "$events"
                }
            }
        ]);

        console.log(`🔍 Tìm thấy ${events.length} sự kiện cần nhắc nhở.`);

        for (const doc of events) {
            const event = doc.event;
            const userEmail = event.reminderEmail || doc.email;

            console.log(`📅 Gửi nhắc nhở cho sự kiện: "${event.title}" tới ${userEmail}`);

            // Gửi email
            await transporter.sendMail({
                from: '"Event Reminder" <noreply@yourapp.com>',
                to: userEmail,
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
                `
            });

            console.log(`✅ Đã gửi email nhắc nhở cho sự kiện "${event.title}".`);

            // Cập nhật trạng thái reminderSent
            await Event.updateOne(
                { email: doc.email, "events.id": event.id },
                { $set: { "events.$.reminderSent": true } }
            );
        }
    } catch (err) {
        console.error('❌ Lỗi khi gửi nhắc nhở:', err);
    }
});
