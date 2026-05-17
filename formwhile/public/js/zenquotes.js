fetch(`${window.location.origin}/data/api/zenquote`)
    .then(res => res.json())
    .then(data => {
        const quoteArea = document.getElementById("f-quote-area");
        quoteArea.innerHTML = data['html'];
    });