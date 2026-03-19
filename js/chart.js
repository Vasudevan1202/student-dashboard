// chart.js

let chart;

// initialize chart
export function initChart() {
    const ctx = document.getElementById("progressChart");

    if (!ctx) return; // not on a page with chart

    // Chart.js must be loaded via CDN in the HTML
    if (typeof Chart === "undefined") {
        console.warn("[chart] Chart.js not loaded — skipping chart init");
        return;
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Math", "Science"],
            datasets: [{
                label: "Progress %",
                data: [0, 0],
                backgroundColor: ["#00adb5", "#007b80"],
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
