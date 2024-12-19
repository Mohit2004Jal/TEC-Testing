const alert_popup_container = document.querySelector(".modal")
const alert_popup_close = document.querySelector(".modal .close")
const alert_popup_heading = document.querySelector(".modal .status_alert_heading")
const alert_popup_text = document.querySelector(".modal .status_text")

function show_popup(status) {
    alert_popup_container.classList.remove('hidden')
    alert_popup_heading.textContent = status
    alert_popup_text.textContent = `${status} Alert!`
    // Auto-hide the popup after 10 seconds
    setTimeout(() => {
        alert_popup_container.classList.add('hidden');
    }, 10000);
}
alert_popup_close.addEventListener('click', () => {
    alert_popup_container.classList.add('hidden')
})

module.exports = {show_popup}