function openEventListModal(cell, events) {
  const date = cell.dataset.date;
  document.getElementById('eventDate').value = date;

  const container = document.getElementById('eventListContainer');
  if (!container) return;

  container.innerHTML = '';

  if (!events || events.length === 0) {
    container.innerHTML = '<p class="text-muted">Không có sự kiện.</p>';
  } else {
    events.forEach(event => {
      const div = document.createElement('div');
      div.classList.add('mb-2');
      div.innerHTML = `
        <strong>${event.title}</strong><br>
        <small>${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
               ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
        <p class="mb-1">${event.description || ''}</p>
        <hr/>
      `;
      container.appendChild(div);
    });
  }

  const modal = new bootstrap.Modal(document.getElementById('eventListModal'));
  modal.show();
}

function openEventModal() {
  const modal = new bootstrap.Modal(document.getElementById('eventModal'));
  modal.show();
}
