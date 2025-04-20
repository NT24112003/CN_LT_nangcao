
document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    let dmSelectedMonth = today.getMonth();
    let dmSelectedYear = today.getFullYear();
    
    // Generate year table
    dmGenerateYearTable();
    
    // Update date display initially
    dmUpdateDateDisplay();
    
    // Set current month as selected
    const currentMonthElement = document.querySelector(`.dm-month-item[data-dm-month="${dmSelectedMonth}"]`);
    if (currentMonthElement) {
        currentMonthElement.classList.add('dm-selected-item');
    }
    
    // Month selection
    const dmMonthItems = document.querySelectorAll('.dm-month-item');
    dmMonthItems.forEach(cell => {
        cell.addEventListener('click', function () {
            dmMonthItems.forEach(c => c.classList.remove('dm-selected-item'));
            this.classList.add('dm-selected-item');
            dmSelectedMonth = parseInt(this.dataset.dmMonth);
        });
    });
    
    // Year tab click - ensure table is updated
    document.getElementById('dm-year-tab').addEventListener('click', function () {
        dmGenerateYearTable();
    });
    
    document.getElementById('dm-today-btn').addEventListener('click', function () {
        const now = new Date();
        dmSelectedMonth = now.getMonth();
        dmSelectedYear = now.getFullYear();
        
        // Update UI
        dmMonthItems.forEach(cell => {
            cell.classList.remove('dm-selected-item');
            if (parseInt(cell.dataset.dmMonth) === dmSelectedMonth) {
                cell.classList.add('dm-selected-item');
            }
        });
        
        dmGenerateYearTable();
    });
    
    // Confirm button action
    document.getElementById('dm-confirm-btn').addEventListener('click', function () {
        dmUpdateDateDisplay();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('dmDateModal'));
        modal.hide();
    });
    
    // Update date display in header
    function dmUpdateDateDisplay() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.querySelector('.dm-date-display').textContent = `${monthNames[dmSelectedMonth]} ${dmSelectedYear}`;
        submitDate(dmSelectedMonth + 1, dmSelectedYear);
        window.getSelectedDate = function () {
            return {
                month: dmSelectedMonth,
                year: dmSelectedYear
            };
        }
        

    }
    
    // Generate year table dynamically
    function dmGenerateYearTable() {
        const dmYearTable = document.querySelector('#dm-year-table tbody');
        dmYearTable.innerHTML = ''; // Clear existing content
        
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5; // 5 years before current year
        
        let yearIndex = 0;
        let currentRow;
        
        // Create years (5 before current, current, and 6 after)
        for (let year = startYear; year <= currentYear + 6; year++) {
            if (yearIndex % 4 === 0) {
                currentRow = document.createElement('tr');
                dmYearTable.appendChild(currentRow);
            }
            
            const cell = document.createElement('td');
            cell.className = 'dm-year-item';
            cell.setAttribute('data-dm-year', year);
            cell.textContent = year;
            
            if (year === dmSelectedYear) {
                cell.classList.add('dm-selected-item');
            }
            
            cell.addEventListener('click', function () {
                document.querySelectorAll('.dm-year-item').forEach(c => c.classList.remove('dm-selected-item'));
                this.classList.add('dm-selected-item');
                dmSelectedYear = parseInt(this.dataset.dmYear);
            });
            
            currentRow.appendChild(cell);
            yearIndex++;
        }
    }
    
    function submitDate(month, year) {
        fetch(`/home/calerdar/saveDate?month=${month}&year=${year}`)
            .then(res => res.json())
            .then(data => console.log("data", data))
            .catch(err => console.log("err", err));
    }
    
    // Now it's safe to log the selected date
    const date = getSelectedDate();
    // console.log("Month:", date.month, "Year:", date.year);
});

// Placeholder for profile tab change function
function changeTab(tab) {
    // console.log(`Changing to ${tab} tab`);
}



