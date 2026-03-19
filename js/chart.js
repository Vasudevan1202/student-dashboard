// chart.js

let chart;

// Colour palette for each subject slice/bar
const PALETTE = [
    "#00c9d4", "#3dd68c", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316",
    "#e11d48", "#0ea5e9"
];

export function initChart() {
    const ctx = document.getElementById("progressChart");
    if (!ctx) return;

    if (typeof Chart === "undefined") {
        console.warn("[chart] Chart.js not loaded — skipping");
        return;
    }

    // Destroy any previous instance (e.g. hot reload)
    if (chart) {
        chart.destroy();
        chart = null;
    }

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels:   [],
            datasets: [{
                label: "Progress %",
                data:  [],
                backgroundColor: PALETTE,
                borderWidth: 3,
                borderColor: "transparent",
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            cutout: "62%",
            animation: { duration: 500 },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color:   "#7b85aa",
                        padding: 14,
                        font:    { size: 13, family: "Inter, Segoe UI, sans-serif" },
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (item) => `  ${item.label}: ${item.parsed}%`
                    }
                }
            }
        }
    });

    console.log("[chart] initialised ✅");
}


// Called by listenSubjects() with fresh labels + values arrays
export function updateChart(labels, values) {
    if (!chart) return;

    chart.data.labels                    = labels;
    chart.data.datasets[0].data         = values;
    chart.data.datasets[0].backgroundColor = PALETTE.slice(0, labels.length);
    chart.update();
}
