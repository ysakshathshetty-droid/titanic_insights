const API_URL = "http://127.0.0.1:8000";



const predictionForm = document.getElementById("predictionForm");

predictionForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const button = document.getElementById("predictButton");
    const resultBox = document.getElementById("resultBox");
    const errorMessage = document.getElementById("errorMessage");

    button.disabled = true;
    button.innerText = "Predicting...";

    resultBox.classList.add("hidden");
    errorMessage.innerText = "";

    const passenger = {
        Pclass: Number(document.getElementById("Pclass").value),
        Sex: document.getElementById("Sex").value,
        Age: Number(document.getElementById("Age").value),
        SibSp: Number(document.getElementById("SibSp").value),
        Parch: Number(document.getElementById("Parch").value),
        Fare: Number(document.getElementById("Fare").value),
        Embarked: document.getElementById("Embarked").value
    };

    try {

        const response = await fetch(`${API_URL}/api/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(passenger)
        });

        if (!response.ok) {
            throw new Error("Prediction failed. Check the backend.");
        }

        const data = await response.json();

        document.getElementById("resultTitle").innerText =
            data.result === "Survived"
                ? "Passenger is predicted to survive!"
                : "Passenger is predicted not to survive.";

        document.getElementById("probability").innerText =
            data.survival_probability + "%";

        document.getElementById("deathProbability").innerText =
            "Probability of not surviving: " +
            data.death_probability + "%";

        document.getElementById("probabilityBar").style.width =
            data.survival_probability + "%";

        resultBox.classList.remove("hidden");

    }

    catch (error) {

        errorMessage.innerText =
            "Unable to connect to prediction server. Please try again.";

        console.error(error);

    }

    finally {

        button.disabled = false;
        button.innerText = "Predict Survival";

    }

});




new Chart(document.getElementById("survivalChart"), {

    type: "doughnut",

    data: {
        labels: ["Survived", "Did Not Survive"],

        datasets: [{
            data: [342, 549],
            backgroundColor: ["#2dd4bf", "#475569"],
            borderWidth: 0
        }]
    },

    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: "white"
                }
            }
        }
    }

});



new Chart(document.getElementById("genderChart"), {

    type: "bar",

    data: {

        labels: ["Male", "Female"],

        datasets: [
            {
                label: "Survived",
                data: [109, 233],
                backgroundColor: "#2dd4bf"
            },
            {
                label: "Did Not Survive",
                data: [468, 81],
                backgroundColor: "#475569"
            }
        ]

    },

    options: {

        responsive: true,

        scales: {
            x: {
                ticks: {
                    color: "white"
                }
            },
            y: {
                ticks: {
                    color: "white"
                }
            }
        },

        plugins: {
            legend: {
                labels: {
                    color: "white"
                }
            }
        }

    }

});


async function loadAdditionalAnalytics() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/analytics"
        );

        if (!response.ok) {
            throw new Error("Unable to load analytics");
        }

        const data = await response.json();


        
        new Chart(document.getElementById("classChart"), {

            type: "bar",

            data: {

                labels: data.class_labels,

                datasets: [

                    {
                        label: "Survived",
                        data: data.class_survived,
                        backgroundColor: "#2dd4bf"
                    },

                    {
                        label: "Did Not Survive",
                        data: data.class_not_survived,
                        backgroundColor: "#475569"
                    }

                ]

            },

            options: {

                responsive: true,

                scales: {

                    x: {
                        ticks: { color: "white" }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: { color: "white" }
                    }

                },

                plugins: {
                    legend: {
                        labels: { color: "white" }
                    }
                }

            }

        });


    

        new Chart(document.getElementById("ageChart"), {

            type: "bar",

            data: {

                labels: data.age_labels,

                datasets: [

                    {
                        label: "Survived",
                        data: data.age_survived,
                        backgroundColor: "#2dd4bf"
                    },

                    {
                        label: "Did Not Survive",
                        data: data.age_not_survived,
                        backgroundColor: "#475569"
                    }

                ]

            },

            options: {

                responsive: true,

                scales: {

                    x: {
                        ticks: { color: "white" }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: { color: "white" }
                    }

                },

                plugins: {
                    legend: {
                        labels: { color: "white" }
                    }
                }

            }

        });

    }

    catch (error) {

        console.error("Analytics error:", error);

    }

}

loadAdditionalAnalytics();