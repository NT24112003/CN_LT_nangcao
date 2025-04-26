const plasList = eventsList.events;

document.addEventListener('DOMContentLoaded', function () {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const accordionContainer = document.getElementById('monthlyPlanAccordion');

    // Tạo một đối tượng để nhóm sự kiện theo tháng (0-11)
    const eventsByMonth = {};
    plasList.forEach(event => {
        const date = new Date(event.startTime);
        const monthIndex = date.getMonth(); // 0 - January
        if (!eventsByMonth[monthIndex]) eventsByMonth[monthIndex] = [];
        eventsByMonth[monthIndex].push(event);
    });


    // Tạo giao diện accordion
    months.forEach((month, index) => {
        const isFirst = index === 0;
        const paddedMonth = (index + 1).toString().padStart(2, '0');

        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        // Tính tổng số sự kiện của tháng
        const events = eventsByMonth[index] || [];
        const eventCount = events.length;


        accordionItem.innerHTML = `
    <h2 class="accordion-header" id="heading${month}">
        <button class="accordion-button w-100 text-start ${isFirst ? '' : 'collapsed'}"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapse${month}"
        aria-expanded="${isFirst}"
        aria-controls="collapse${month}">
    <span class="d-flex w-100 align-items-center">
        <span>${month}</span>
        <span class="badge bg-primary ms-auto ">${eventCount}</span>
    </span>
</button>
    </h2>
    <div id="collapse${month}" 
         class="accordion-collapse collapse ${isFirst ? 'show' : ''}" 
         aria-labelledby="heading${month}" 
         data-bs-parent="#monthlyPlanAccordion">
        <div class="accordion-body">
            <!-- Items will be generated here -->
        </div>
    </div>
`;

        accordionContainer.appendChild(accordionItem);

        const accordionBody = accordionItem.querySelector('.accordion-body');

        // Thêm các sự kiện tương ứng
        if (events.length === 0) {
            accordionBody.innerHTML = `<div class="text-muted">No events this month.</div>`;
        } else {

            // Đếm sự kiện
            const today = new Date();
            let past = 0, upcoming = 0, todayCount = 0;

            events.forEach(event => {
                const eventDate = new Date(event.startTime);
                const eventYMD = eventDate.toISOString().split('T')[0];
                const todayYMD = today.toISOString().split('T')[0];

                if (eventYMD < todayYMD) past++;
                else if (eventYMD > todayYMD) upcoming++;
                else todayCount++;
            });

            const summary = document.createElement('div');
            summary.className = 'mb-2 p-2 rounded bg-light border border-secondary';
            summary.innerHTML = `
      <strong>Summary for ${month}:</strong><br>
      Total: ${events.length} | 
      Past: ${past} | 
      Upcoming: ${upcoming} | 
      Today: ${todayCount}
  `;
            accordionBody.appendChild(summary);

            events.forEach(event => {
                const start = new Date(event.startTime);
                const end = new Date(event.endTime);
                const timeString = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} -> ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
                const dateString = `${start.getDate().toString().padStart(2, '0')}/${paddedMonth}/2025`;

                const itemRow = document.createElement('div');
                itemRow.className = 'row item-row border-bottom ';
                itemRow.style = 'background-color: #7dd3fcb8';
                itemRow.innerHTML = `
                    <div class="col-8">${event.title}</div>
                    <small class="col-4 item-time">${timeString} <br> ${dateString}</small>
                `;
                accordionBody.appendChild(itemRow);
            });
        }
    });
});
