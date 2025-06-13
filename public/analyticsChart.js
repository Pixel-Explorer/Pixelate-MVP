(function(){
    let chart;
    const ctx = document.getElementById('chartContainer').getContext('2d');
    const chartTypeSelect = document.getElementById('chartType');
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const applyBtn = document.getElementById('applyRange');

    function aggregate(data, start, end){
        const result = {};
        data.forEach(p=>{
            const ts = p.timestamp ? new Date(p.timestamp) : null;
            if(start && ts && ts < start) return;
            if(end && ts && ts > end) return;
            const user = p.user;
            result[user] = (result[user] || 0) + 1;
        });
        return result;
    }

    function render(){
        const start = startInput.value ? new Date(startInput.value) : null;
        const end = endInput.value ? new Date(endInput.value) : null;
        const agg = aggregate(window.photoData || [], start, end);
        const labels = Object.keys(agg);
        const values = Object.values(agg);
        if(chart) chart.destroy();
        chart = new Chart(ctx, {
            type: chartTypeSelect.value,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Photos',
                    data: values,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)'
                }]
            },
            options:{
                responsive:true
            }
        });
    }

    chartTypeSelect.addEventListener('change', render);
    applyBtn.addEventListener('click', render);
    document.addEventListener('DOMContentLoaded', render);
})();
