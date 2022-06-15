$( document ).ready(function() {
    fetch("/api/vendors", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(response => response.json())
    .then(data => console.log(data));
});