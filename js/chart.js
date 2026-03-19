// chart.js

let chart;

// initialize chart
export function initChart() {
    const ctx = document.getElementById("progressChart");

    if (!ctx) return;

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Math", "Science"],
            datasets: [{
                label: "Progress %",
                data: [0, 0],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}


// update chart dynamically
export function updateChart(math, science) {
    if (!chart) return;

    chart.data.datasets[0].data = [math, science];
    chart.update();
}