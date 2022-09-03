const validateUnit = event => {
    const unitInput = event.target;
    if(!unitInput.value.trim()){
        unitInput.parentNode.querySelector(".invalid-feedback").textContent = "Введіть назву розділу!";
        unitInput.setCustomValidity("Введіть назву розділу!");
    }
    else{
        unitInput.parentNode.querySelector(".invalid-feedback").textContent = "";
        unitInput.setCustomValidity("");
    }
};

const addUnit = () => {
    $("#form-unit-add").trigger("submit");
};